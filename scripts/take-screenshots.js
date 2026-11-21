// Снимает скриншоты игры для README через headless Chrome (Chrome DevTools Protocol).
// Перед запуском должны работать бэк (npm start) и статика (python -m http.server 5500),
// и в игре не должно быть других подключённых вкладок.
// Запуск: node scripts/take-screenshots.js
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';

const BROWSER = process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const GAME_URL = process.env.GAME_URL || 'http://localhost:5500/';
const OUT_DIR = path.resolve('screenshots');
const PORT = 9333;
const VIEWPORT = {width: 1440, height: 900};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Хелперы, которые выполняются внутри страницы игры
const PAGE_HELPERS = `
window.__h = {
    wait: ms => new Promise(r => setTimeout(r, ms)),
    text: () => document.querySelector('#root')?.innerText ?? '',
    btn: re => [...document.querySelectorAll('button')].find(b => re.test(b.textContent.trim())),
    async click(re) {
        const b = this.btn(re);
        if (!b) throw new Error('Нет кнопки ' + re);
        b.click();
        await this.wait(600);
    },
    async waitFor(fn, timeout = 60000) {
        const start = Date.now();
        while (!fn()) {
            if (Date.now() - start > timeout) throw new Error('Таймаут ожидания');
            await this.wait(100);
        }
    },
    async setSelect(id, value) {
        const s = document.getElementById(id);
        s.value = String(value);
        s.dispatchEvent(new Event('change'));
        await this.wait(400);
    },
    async setName(id, value) {
        const input = document.getElementById(id);
        input.value = value;
        input.dispatchEvent(new Event('change'));
        await this.wait(400);
    },
    positions() {
        const res = {};
        document.querySelectorAll('table.table tr').forEach((row, y) => {
            [...row.children].forEach((cell, x) => {
                const name = cell.querySelector('img')?.src.split('/').pop() ?? '';
                if (name.startsWith('man01')) res.p1 = {x, y};
                else if (name.startsWith('man02')) res.p2 = {x, y};
                else if (name.startsWith('google')) res.g = {x, y};
            });
        });
        return res;
    },
    key: code => window.dispatchEvent(new KeyboardEvent('keyup', {code})),
    // Один ход «бота»: каждый игрок делает шаг в сторону Google
    step() {
        const {p1, p2, g} = this.positions();
        if (!g) return;
        const move = (p, k) => {
            if (!p) return;
            if (p.x < g.x) this.key(k.r); else if (p.x > g.x) this.key(k.l);
            else if (p.y < g.y) this.key(k.d); else if (p.y > g.y) this.key(k.u);
        };
        move(p1, {u: 'ArrowUp', d: 'ArrowDown', l: 'ArrowLeft', r: 'ArrowRight'});
        move(p2, {u: 'KeyW', d: 'KeyS', l: 'KeyA', r: 'KeyD'});
    },
    async playUntil(fn, stepMs = 300, timeout = 180000) {
        const start = Date.now();
        while (!fn()) {
            if (Date.now() - start > timeout) throw new Error('Таймаут игры');
            this.step();
            await this.wait(stepMs);
        }
    },
    score() {
        const nums = [...document.querySelectorAll('#game-interface .result')].map(e => e.textContent);
        return {p1: Number(nums[0]), p2: Number(nums[1]), g: Number(nums[2])};
    },
};
true`;

class Cdp {
    #ws; #id = 0; #pending = new Map();
    constructor(ws) {
        this.#ws = ws;
        ws.on('message', data => {
            const msg = JSON.parse(data.toString());
            const p = this.#pending.get(msg.id);
            if (!p) return;
            this.#pending.delete(msg.id);
            msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
        });
    }
    send(method, params = {}) {
        const id = ++this.#id;
        this.#ws.send(JSON.stringify({id, method, params}));
        return new Promise((resolve, reject) => this.#pending.set(id, {resolve, reject}));
    }
    async eval(expression) {
        const res = await this.send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
        if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text);
        return res.result.value;
    }
    async shot(name) {
        const {data} = await this.send('Page.captureScreenshot', {format: 'png'});
        fs.writeFileSync(path.join(OUT_DIR, name), Buffer.from(data, 'base64'));
        console.log('Сохранён', name);
    }
}

async function getPageWsUrl() {
    for (let i = 0; i < 50; i++) {
        try {
            const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
            const page = list.find(t => t.type === 'page');
            if (page) return page.webSocketDebuggerUrl;
        } catch { /* браузер ещё стартует */ }
        await sleep(200);
    }
    throw new Error('Браузер не запустился');
}

async function main() {
    fs.mkdirSync(OUT_DIR, {recursive: true});
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctg-shots-'));
    const browser = spawn(BROWSER, [
        '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`,
        '--no-first-run', '--hide-scrollbars', 'about:blank',
    ]);

    try {
        const ws = new WebSocket(await getPageWsUrl());
        await new Promise(r => ws.once('open', r));
        const cdp = new Cdp(ws);

        await cdp.send('Page.enable');
        await cdp.send('Emulation.setDeviceMetricsOverride', {...VIEWPORT, deviceScaleFactor: 1, mobile: false});
        await cdp.send('Page.navigate', {url: GAME_URL});
        await sleep(1500);
        await cdp.eval(PAGE_HELPERS);
        await cdp.eval(`__h.waitFor(() => __h.text().length > 0)`);

        // Приводим игру к экрану настроек, если сервер остался в другом состоянии
        await cdp.eval(`(async () => {
            if (__h.btn(/^RESUME$/i)) await __h.click(/QUIT/i);
            if (__h.btn(/play again/i)) await __h.click(/play again/i);
            await __h.waitFor(() => __h.btn(/start game/i));
        })()`);

        // 1. Экран настроек
        await cdp.eval(`(async () => {
            await __h.setSelect('01', 5);
            await __h.setSelect('02', 10);
            await __h.setSelect('03', 10);
            await __h.setSelect('04', 2000);
            await __h.setName('player1-name-input', 'Alice');
            await __h.setName('player2-name-input', 'Bob');
        })()`);
        await cdp.shot('01-settings.png');

        // 2. Начало игры с подсказкой по управлению
        await cdp.eval(`__h.click(/start game/i)`);
        await sleep(1200);
        await cdp.shot('02-game-start.png');

        // 3. Игра в процессе: оба игрока набрали очки
        await cdp.eval(`(async () => {
            await __h.click(/^OK$/);
            await __h.playUntil(() => { const s = __h.score(); return s.p1 >= 4 && s.p2 >= 3 && s.g >= 1; });
        })()`);
        await sleep(200);
        await cdp.shot('03-gameplay.png');

        // 4. Пауза
        await cdp.eval(`(async () => { document.querySelector('.pause-button').click(); await __h.wait(600); })()`);
        await cdp.shot('04-pause.png');

        // 5. Победа игрока
        await cdp.eval(`(async () => {
            await __h.click(/^RESUME$/i);
            await __h.playUntil(() => __h.btn(/play again/i));
        })()`);
        await sleep(800);
        await cdp.shot('05-win.png');

        // 6. Победа Google: игроки не двигаются
        await cdp.eval(`(async () => {
            await __h.click(/play again/i);
            await __h.waitFor(() => __h.btn(/start game/i));
            await __h.setSelect('03', 5);
            await __h.setSelect('04', 1000);
            await __h.click(/start game/i);
            await __h.click(/^OK$/);
            await __h.waitFor(() => __h.btn(/play again/i), 30000);
        })()`);
        await sleep(800);
        await cdp.shot('06-lose.png');

        // Возвращаем игру к настройкам по умолчанию
        await cdp.eval(`(async () => {
            await __h.click(/play again/i);
            await __h.setSelect('01', 4);
            await __h.setSelect('03', 5);
            await __h.setSelect('04', 1000);
            await __h.setName('player1-name-input', 'Player 1');
            await __h.setName('player2-name-input', 'Player 2');
        })()`);
        ws.close();
    } finally {
        browser.kill();
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
