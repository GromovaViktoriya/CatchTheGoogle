import {Controller} from "./controller.js";
import {View} from "./view.js";
import {GameProxy} from "./game-proxy.js";

// Игра рассчитана на клавиатуру и широкий экран. На телефонах и планшетах вместо игры
// показывается заглушка (см. .desktop-only в style.css), и к серверу не подключаемся,
// чтобы не занимать место одного из двух игроков
const smallScreen = window.matchMedia('(max-width: 1023px), (hover: none) and (pointer: coarse)');

function startGame() {
    //composition root
    const view = new View();
    const game = new GameProxy();
    const controller = new Controller(view, game);
    controller.init();
}

if (!smallScreen.matches) {
    startGame();
} else {
    // Если окно браузера на компьютере просто было узким — запускаем игру, когда его расширят
    smallScreen.addEventListener('change', function onChange(event) {
        if (event.matches) return;
        smallScreen.removeEventListener('change', onChange);
        startGame();
    });
}
