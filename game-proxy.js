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

    //DI/Dependency injection
    constructor(somethingSimilarToNumberUtility) {
        this.#wsChannel = new WebSocket('wss://catchthegoogle.onrender.com')
        this.#wsChannel.addEventListener('message', (event) => {
            const receivedData = JSON.parse(event.data);

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

    initialized() {
        return this.#stateCache !== null && this.#playerRole !== null;
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
        return this.#stateCache.googlePosition
    }

    get player1Position() {
        return this.#stateCache.player1Position
    }

    get player2Position() {
        return this.#stateCache.player2Position
    }

    get player1Name() {
        return this.#stateCache.player1Name
    }

    get player2Name() {
        return this.#stateCache.player2Name
    }

    get player1Points() {
        return this.#stateCache.player1Points
    }

    get player2Points() {
        return this.#stateCache.player2Points
    }

    get googleName() {
        return this.#stateCache.googleName
    }

    get googlePoints() {
        return this.#stateCache.googlePoints
    }

    get pointsToWin() {
        return this.#stateCache.pointsToWin
    }

    get pointsToLose() {
        return this.#stateCache.pointsToLose
    }

    get player1() {
        return this.#stateCache.player1
    }

    get player2() {
        return this.#stateCache.player2
    }

    get google() {
        return this.#stateCache.google
    }

    get timer() {
        return this.#stateCache.timer
    }

    get winner() {
        return this.#stateCache.winner
    }

    get googleJumpInterval() {
        return this.#stateCache.googleJumpInterval
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

