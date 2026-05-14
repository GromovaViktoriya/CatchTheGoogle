import {GameStatuses} from "./constants/game-statuses.js";
import {Position} from "./position.js";
import {moveDirection} from "./constants/moveDirection.js";
import {Player} from "./entities/player.js";
import {GameSettings} from "./settings/game-settings.js";
import {Google} from "./entities/google.js";

export class Game {
    #status = GameStatuses.SETTINGS;
    #googlePosition = null;
    #player1
    #player2
    #google
    #googlePoints = 0
    #numberUtility
    #winner = null
    #jumpIntervalId = null

    //DI/Dependency injection
    constructor(somethingSimilarToNumberUtility) {
        this.#numberUtility = somethingSimilarToNumberUtility // must have getRandomIntegerNumber method
    }

    #settings = new GameSettings(4, 10, 10)

    start() {
        if (this.#status !== GameStatuses.SETTINGS &&
            this.#status !== GameStatuses.WIN &&
            this.#status !== GameStatuses.LOSE) {
            throw new Error('Game must be in Settings status before start')
        }

        if (this.#status === GameStatuses.WIN || this.#status === GameStatuses.LOSE) {
            clearInterval(this.#jumpIntervalId);
            this.#googlePoints = 0;
        }

        this.#status = GameStatuses.IN_PROGRESS;
        this.#winner = null;
        this.#player1 = new Player(1, 'Player 1', null, 0)
        this.#player2 = new Player(2, 'Player 2', null, 0)
        this.#google = new Google(null, 0);
        this.#placePlayer1ToGrid()
        this.#placePlayer2ToGrid()
        this.#makeGoogleJump()
        this.#notify()

        this.#jumpIntervalId = setInterval(() => {
            this.#googlePoints += 1;
            this.#checkWinCondition();
            if (this.#status === GameStatuses.IN_PROGRESS) {
                this.#makeGoogleJump();
                this.#notify();
            }
        }, this.#settings.googleJumpInterval);
    }

    //массив наблюдателей-подписчиков
    #observers = []

    subscribe(observerFunction) {
        this.#observers.push(observerFunction)
    }

    //уведомить наблюдателей-подписчиков
    #notify() {
        this.#observers.forEach(observerFunction => observerFunction())
    }

    movePlayer(playerId, direction) {
        if (this.#status !== GameStatuses.IN_PROGRESS) return;
        if (direction !== moveDirection.UP
            && direction !== moveDirection.DOWN
            && direction !== moveDirection.LEFT
            && direction !== moveDirection.RIGHT) {
            throw new Error('Invalid direction')
        }
        let position = playerId === 1 ? this.player1Position : this.player2Position;
        const activePlayer = playerId === 1 ? this.#player1 : this.#player2;
        let newPosition
        switch (direction) {
            case moveDirection.UP:
                newPosition = new Position(position.x, position.y - 1)
                break
            case moveDirection.DOWN:
                newPosition = new Position(position.x, position.y + 1)
                break
            case moveDirection.LEFT:
                newPosition = new Position(position.x - 1, position.y)
                break
            case moveDirection.RIGHT:
                newPosition = new Position(position.x + 1, position.y)
                break
            default: {
                throw new Error('Invalid direction')
            }
        }
        if (newPosition.x >= this.gridSize.columnsCount ||
            newPosition.y >= this.gridSize.rowsCount ||
            newPosition.x < 0 ||
            newPosition.y < 0) {
            return
        }
        if (playerId === 1) {
            if (newPosition.equals(this.player2Position)) return;
            this.#player1.position = newPosition;
        }
        if (playerId === 2) {
            if (newPosition.equals(this.player1Position)) return;
            this.#player2.position = newPosition;
        }
        if (activePlayer.position.equals(this.#googlePosition)) {
            activePlayer.points += 1;
        }

        this.#checkWinCondition();
        this.#notify();
    }

    #placePlayer1ToGrid() {
        const newPosition = new Position(
            this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.columnsCount),
            this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.rowsCount)
        )
        this.#player1.position = newPosition
    }

    #placePlayer2ToGrid() {
        const newPosition = new Position(
            this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.columnsCount),
            this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.rowsCount)
        )
        if (!newPosition.equals(this.player1Position)) {
            this.#player2.position = newPosition
        }
    }

    #makeGoogleJump() {
        const newPosition = new Position(
            this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.columnsCount),
            this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.rowsCount)
        )
        if (newPosition.equals(this.#googlePosition) ||
            newPosition.equals(this.player1Position) ||
            newPosition.equals(this.player2Position)) {
            this.#makeGoogleJump();
            return
        }
        this.#googlePosition = newPosition
    }

    #checkWinCondition() {
        if (this.player1Points === this.pointsToWin) {
            this.#winner = this.#player1;
            this.#finishGame(GameStatuses.WIN);
        }
        if (this.player2Points === this.pointsToWin) {
            this.#winner = this.#player2;
            this.#finishGame(GameStatuses.WIN);
        }
        if (this.#googlePoints === this.#settings.pointsToLose) {
            this.#winner = this.#google;
            this.#finishGame(GameStatuses.LOSE);
        }
    }

    #finishGame(status){
        this.status = status;
        clearInterval(this.#jumpIntervalId);
    }


    get status() {return this.#status;}
    get gridSize() {return this.#settings.gridSize}
    get googlePosition() {return this.#googlePosition}
    get player1Position() {return this.#player1?.position}
    get player2Position() {return this.#player2?.position}
    get player1Points() {return this.#player1?.points}
    get player1Name(){return this.#player1?.name}
    get player2Points() {return this.#player2?.points}
    get player2Name(){return this.#player2?.name}
    get googleName(){return this.#google?.name}
    get googlePoints() {return this.#googlePoints}
    get pointsToWin(){return this.#settings.pointsToWin}
    get pointsToLose(){return this.#settings.pointsToLose}
    get player1(){return this.#player1}
    get player2(){return this.#player2}
    get google(){return this.#google}

    /**
     * Sets the interval for the target's jumps across the grid.
     * * @param {number} newValue - The new interval duration in milliseconds.
     * @throws {TypeError} If the provided value is not of type 'number'.
     * @throws {RangeError} If the provided value is less than or equal to 0.
     */
    set googleJumpInterval(newValue) {
        if (typeof newValue !== 'number') {
            throw new TypeError('newValue must be a number')
        }
        if (newValue <= 0) {
            throw new RangeError('newValue must be greater than 0')
        }
        this.#settings.googleJumpInterval = newValue;
    }

    set status(newValue) {this.#status = newValue;}
    set gridSize(value) {
        this.#settings.gridSize = value;
        this.#notify()
    }
    set player1Points(points) {this.#player1.points = points}
    set player2Points(points) {this.#player2.points = points;}
    set googlePoints(points) {this.#googlePoints = points;}
    set player1Name(player1Name) {this.#player1.name = player1Name;}
    set player2Name(player2Name) {this.#player2.name = player2Name;}
    set pointsToWin(value) {
        this.#settings.pointsToWin = value;
        this.#notify();
    }

    set pointsToLose(value) {
        this.#settings.pointsToLose = value;
        this.#notify();
    }
}

