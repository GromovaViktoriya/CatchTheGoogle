import {ShogunNumberUtility} from "../core/shogun-number-utility.js";
import {Game} from "../core/game.js";

const numberUtil = new ShogunNumberUtility()
const game = new Game(numberUtil);

// Хранилище подключенных клиентов и их ролей
const players = new Map();

function createDTO(game) {
    const dto = {
        status: game.status,
        gridSize: game.gridSize,
        googlePosition: game.googlePosition,
        player1Position: game.player1Position,
        player2Position: game.player2Position,
        googlePoints: game.googlePoints,
        player1Points: game.player1Points,
        player2Points: game.player2Points,
        pointsToWin: game.pointsToWin,
        pointsToLose: game.pointsToLose,
        winner: game.winner ? {
            name: game.winner.name,
            points: game.winner.points
        } : null,
        player1Name: game.player1Name,
        player2Name: game.player2Name,
        googleName: game.googleName,
        google: game.google,
        player1: game.player1,
        player2: game.player2,
        googleJumpInterval: game.googleJumpInterval,
        timer: game.timer,

        playersCount: players.size
    }
    return dto
}

import {WebSocketServer} from "ws";

const port = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: port });

// Функция для выдачи свободной роли
function getAvailableRole() {
    // Очищаем Map от "мертвых" каналов (если вдруг они остались в памяти)
    for (let [channel, role] of players.entries()) {
        if (channel.readyState !== 1) { // 1 = OPEN
            players.delete(channel);
        }
    }

    const activeRoles = Array.from(players.values());
    console.log("Текущие роли в игре:", activeRoles); // Поможет понять, почему ты Player 2

    if (!activeRoles.includes(1)) return 1;
    if (!activeRoles.includes(2)) return 2;
    return 'spectator';
}

wss.on('connection', (channel) => {
    // 1. Присваиваем роль при подключении
    const role = getAvailableRole();
    players.set(channel, role);
    console.log(`Подключился игрок. Выдана роль: ${role === 'spectator' ? 'Зритель' : 'Player ' + role}`);

    // 2. Сообщаем клиенту, кто он такой (отправляем спец. сообщение)
    channel.send(JSON.stringify({
        type: 'role-assigned',
        payload: { role }
    }));

    // При каждом подключении или отключении рассылаем новый DTO, чтобы обновить playersCount у всех
    for (const player of players.keys()) {
        if (player.readyState === 1) player.send(JSON.stringify(createDTO(game)));
    }

    // Подписываем канал на обновления игры
    // Обязательно проверяем состояние канала, чтобы не отправить данные в закрытый сокет
    const observer = () => {
        if (channel.readyState === 1) { // 1 = OPEN
            channel.send(JSON.stringify(createDTO(game)));
        }
    };
    game.subscribe(observer);

    // 3. Обработка входящих команд
    channel.on('message', (message) => {

        try {
            const action = JSON.parse(message.toString());

            // Узнаем, кто именно прислал сообщение
            const playerRole = players.get(channel);

            // Зрителям запрещено управлять игрой
            if (playerRole === 'spectator') {
                console.log('Попытка управления от зрителя отклонена');
                return;
            }

            switch (action.type) {
                case 'start': game.start(); break;
                case 'restart': game.restart(); break;
                case 'pause': game.pause(); break;
                case 'resume': game.resume(); break;

                case 'move-player': {
                    // УМНАЯ ПРОВЕРКА УПРАВЛЕНИЯ:
                    if (players.size === 1) {
                        // Режим 1 экрана (Local Co-op): Разрешаем одной вкладке двигать обоих
                        game.movePlayer(action.payload.playerId, action.payload.direction);
                    } else {
                        // Онлайн режим: Жестко игнорируем присланный ID и используем роль клиента (защита)
                        game.movePlayer(playerRole, action.payload.direction);
                    }
                    break;
                }

                case 'set-status': game.status = action.payload.newValue; break;
                case 'set-googleJumpInterval': game.googleJumpInterval = action.payload.newValue; break;
                case 'set-gridSize': game.gridSize = action.payload.value; break;
                case 'set-pointsToWin': game.pointsToWin = action.payload.value; break;
                case 'set-pointsToLose': game.pointsToLose = action.payload.value; break;
                case 'set-player1Points': game.player1Points = action.payload.points; break;
                case 'set-player2Points': game.player2Points = action.payload.points; break;
                case 'set-googlePoints': game.googlePoints = action.payload.points; break;
                case 'set-player1Name': game.player1Name = action.payload.player1Name; break;
                case 'set-player2Name': game.player2Name = action.payload.player2Name; break;
                case 'set-winner': game.winner = action.payload.winner; break;
            }
        } catch (err) {
            console.error("Ошибка при обработке команды:", err); // ЛОГ ДЛЯ ОТЛАДКИ
        }

    });

    channel.on('close', () => {
        const disconnectedRole = players.get(channel);
        players.delete(channel);

        if ((disconnectedRole === 1 || disconnectedRole === 2) && game.status === 'IN_PROGRESS') {
            game.pause();
        }

        // Оповещаем оставшихся, что количество игроков изменилось
        for (const player of players.keys()) {
            if (player.readyState === 1) player.send(JSON.stringify(createDTO(game)));
        }
    });

    channel.send(JSON.stringify(createDTO(game)));
});

console.log('WebSocket server is running on port 8080');