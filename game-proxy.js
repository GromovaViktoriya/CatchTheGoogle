export class GameProxy {
    // #status = GameStatuses.SETTINGS;
    // #googlePosition = null;
    // #player1
    // #player2
    // #google
    // #googlePoints = 0
    // #numberUtility
    // #winner = null
    // #jumpIntervalId = null
    // #gameSessionTimerId = null
    // seconds = 0
    // minutes = 0
    // #timer = `00:00`;
    // #player1CustomName = 'Player 1';
    // #player2CustomName = 'Player 2';

    #wsChannel = null;
    #stateCache = null;
    #playerRole = null;
    #isRoomFull = false;

    //DI/Dependency injection
    constructor(somethingSimilarToNumberUtility) {
        this.#connect();
    }

    // Переключатель: если мы локально, используем ws://localhost:8080
    // Если мы на github pages - используем облако
    #url = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'ws://localhost:8080'
        : 'wss://catchthegoogle.onrender.com';

    // Сервер на бесплатном Render засыпает без игроков: первое подключение может оборваться,
    // пока он просыпается. Поэтому при обрыве переподключаемся, пока сервер не ответит
    static RECONNECT_DELAY = 2000;

    #connect() {
        this.#wsChannel = new WebSocket(this.#url);

        this.#wsChannel.addEventListener('close', () => {
            // Третьему игроку сервер сам закрывает соединение — переподключаться не нужно
            if (this.#isRoomFull) return;

            // Сбрасываем состояние: пока соединения нет, показывается экран подключения
            this.#stateCache = null;
            this.#playerRole = null;
            this.#notify();
            setTimeout(() => this.#connect(), GameProxy.RECONNECT_DELAY);
        });

        this.#wsChannel.addEventListener('message', (event) => {
            const receivedData = JSON.parse(event.data);

            if (receivedData.type === 'room-full') {
                this.#isRoomFull = true;
                this.#notify();
                return;
            }

            if (receivedData.type === 'role-assigned') {
                this.#playerRole = receivedData.payload.role;
                this.#notify();
                return;
            }

            this.#stateCache = receivedData;
            this.#notify();
        })
    }

    get role() {
        return this.#playerRole; // Геттер для получения роли в контроллере
    }
    get playersCount() {
        return this.#stateCache ? this.#stateCache.playersCount : 1;
    }

    get isRoomFull() {
        return this.#isRoomFull; // true, если оба места в игре уже заняты
    }

    initialized() {
        return this.#isRoomFull || (this.#stateCache !== null && this.#playerRole !== null);
    }

    start() {
        const action = {type: 'start'};
        this.#wsChannel.send(JSON.stringify(action))
    }

    restart() {
        const action = {type: 'restart'};
        this.#wsChannel.send(JSON.stringify(action))
    }

    pause() {
        const action = {type: 'pause'};
        this.#wsChannel.send(JSON.stringify(action))
    }

    resume() {
        const action = {type: 'resume'};
        this.#wsChannel.send(JSON.stringify(action))
    }

    //массив наблюдателей-подписчиков
    #observers = []

    subscribe(observerFunction) {
        this.#observers.push(observerFunction)
    }

    //уведомить наблюдателей-подписчиков
    #notify() {
        return this.#observers.forEach(observerFunction => observerFunction())
    }

    movePlayer(playerId, direction) {
        const action = {type: 'move-player', payload: {
            playerId, direction
        }}
        this.#wsChannel.send(JSON.stringify(action))
    }

    get status() { return this.#stateCache ? this.#stateCache.status : 'SETTINGS'; }

    get gridSize() { return this.#stateCache ? this.#stateCache.gridSize : {columnsCount: 4, rowsCount: 4}; }

    get googlePosition() {
        return this.#stateCache ? this.#stateCache.googlePosition : null;
    }

    get player1Position() {
        return this.#stateCache ? this.#stateCache.player1Position : null;
    }

    get player2Position() {
        return this.#stateCache ? this.#stateCache.player2Position : null;
    }

    get player1Name() {
        return this.#stateCache ? this.#stateCache.player1Name : 'Player 1';
    }

    get player2Name() {
        return this.#stateCache ? this.#stateCache.player2Name : 'Player 2';
    }

    get player1Points() {
        return this.#stateCache ? this.#stateCache.player1Points : 0;
    }

    get player2Points() {
        return this.#stateCache ? this.#stateCache.player2Points : 0;
    }

    get googleName() {
        return this.#stateCache ? this.#stateCache.googleName : 'Google';
    }

    get googlePoints() {
        return this.#stateCache ? this.#stateCache.googlePoints : 0;
    }

    get pointsToWin() {
        return this.#stateCache ? this.#stateCache.pointsToWin : 10;
    }

    get pointsToLose() {
        return this.#stateCache ? this.#stateCache.pointsToLose : 10;
    }

    get player1() {
        return this.#stateCache ? this.#stateCache.player1 : null;
    }

    get player2() {
        return this.#stateCache ? this.#stateCache.player2 : null;
    }

    get google() {
        return this.#stateCache ? this.#stateCache.google : null;
    }

    get timer() {
        return this.#stateCache ? this.#stateCache.timer : "00:00";
    }

    get winner() {
        return this.#stateCache ? this.#stateCache.winner : null;
    }

    get googleJumpInterval() {
        return this.#stateCache ? this.#stateCache.googleJumpInterval : 1000;
    }

    set status(newValue) {
        const action = {type: 'set-status', payload: {newValue}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set googleJumpInterval(newValue) {
        const action = {type: 'set-googleJumpInterval', payload: {newValue}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set gridSize(value) {
        const action = {type: 'set-gridSize', payload: {value}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set pointsToWin(value) {
        const action = {type: 'set-pointsToWin', payload: {value}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set pointsToLose(value) {
        const action = {type: 'set-pointsToLose', payload: {value}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set player1Points(points) {
        const action = {type: 'set-player1Points', payload: {points}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set player2Points(points) {
        const action = {type: 'set-player2Points', payload: {points}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set googlePoints(points) {
        const action = {type: 'set-googlePoints', payload: {points}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set player1Name(player1Name) {
        const action = {type: 'set-player1Name', payload: {player1Name}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set player2Name(player2Name) {
        const action = {type: 'set-player2Name', payload: {player2Name}}
        this.#wsChannel.send(JSON.stringify(action));
    }

    set winner(winner) {
        const action = {type: 'set-winner', payload: {winner}}
        this.#wsChannel.send(JSON.stringify(action));
    }
}

