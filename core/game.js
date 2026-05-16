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
    #gameSessionTimerId = null
    seconds = 0
    minutes = 0
    #timer = `00:00`;
    #player1CustomName = '';
    #player2CustomName = '';

    //DI/Dependency injection
    constructor(somethingSimilarToNumberUtility) {
        this.#numberUtility = somethingSimilarToNumberUtility // must have getRandomIntegerNumber method
    }

    #settings = new GameSettings(4, 10, 5)

    start() {
        if (this.status !== GameStatuses.SETTINGS) {
            throw new Error('Game must be in Settings status before start')
        }

        this.status = GameStatuses.IN_PROGRESS;
        this.winner = null;
        this.#player1 = new Player(1, this.#player1CustomName, null, 0)
        this.#player2 = new Player(2, this.#player2CustomName, null, 0)
        this.#google = new Google(null, 0);
        this.#placePlayer1ToGrid()
        this.#placePlayer2ToGrid()
        this.#makeGoogleJump()
        this.#notify()
        //установка таймера игровой сессии
        this.#runGameSessionTimer()
        this.#runJumpInterval();
    }

    restart() {
        if (this.status !== GameStatuses.WIN &&
            this.status !== GameStatuses.LOSE &&
            this.status !== GameStatuses.PAUSE) {
            throw new Error('Game must be finished or paused to restart')
        }
        this.#settings = new GameSettings(4, 10, 10);
        this.status = GameStatuses.SETTINGS;
        this.winner = null;
        this.seconds = 0;
        this.minutes = 0;
        this.#timer = `00:00`;
        this.googlePoints = 0;
        this.#notify();
    }

    pause(){
        this.status = GameStatuses.PAUSE;
        clearInterval(this.#gameSessionTimerId);
        clearInterval(this.#jumpIntervalId);
        this.#notify();
    }

    resume(){
        this.status = GameStatuses.IN_PROGRESS;
        this.#runGameSessionTimer()
        this.#runJumpInterval();
        this.#notify();
    }

    #runJumpInterval() {
        this.#jumpIntervalId = setInterval(() => {
            this.#makeGoogleJump();

            this.googlePoints += 1;

            this.#checkWinCondition();
            this.#notify();
        }, this.#settings.googleJumpInterval);
    }

    #runGameSessionTimer() {
        clearInterval(this.#gameSessionTimerId);
        this.#gameSessionTimerId = setInterval(() => {
            this.seconds += 1;
            if (this.seconds > 59) {
                this.minutes += 1;
                this.seconds = 0;
            }
            const minutes = this.minutes < 10 ? `0${this.minutes}` : this.minutes;
            const seconds = this.seconds < 10 ? `0${this.seconds}` : this.seconds;
            this.#timer = `${minutes}:${seconds}`;
        }, 1000);
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
        if (this.status !== GameStatuses.IN_PROGRESS) return;
        if (direction !== moveDirection.UP
            && direction !== moveDirection.DOWN
            && direction !== moveDirection.LEFT
            && direction !== moveDirection.RIGHT) {
            throw new Error('Invalid direction')
        }
        let position = playerId === 1 ? this.player1Position : this.player2Position;
        const activePlayer = playerId === 1 ? this.player1 : this.player2;
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
            clearInterval(this.#jumpIntervalId);
            this.#googlePosition = null;
            this.#notify();

            setTimeout(() => {
                if (this.status !== GameStatuses.IN_PROGRESS) return;
                this.#makeGoogleJump();
                this.#notify();
                this.#runJumpInterval();
            }, 500);
        }

        this.#checkWinCondition();
        this.#notify();
    }

    #placePlayer1ToGrid() {
        const newPosition = new Position(
            this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.columnsCount),
            this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.rowsCount)
        )
        this.player1.position = newPosition
    }

    #placePlayer2ToGrid() {
        let newPosition
        do { newPosition = new Position(
                this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.columnsCount),
                this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.rowsCount))
        } while (newPosition.equals(this.player1Position));
        this.player2.position = newPosition
    }

    #makeGoogleJump() {
        const totalCells = this.gridSize.columnsCount * this.gridSize.rowsCount;
        const occupiedCellsCount = 3;
        //Если свободных ячеек нет, прыжок невозможен
        if (totalCells <= occupiedCellsCount) {
            throw new Error('There are no free cells for Google to jump in')
        }

        let newPosition
        do {
            newPosition = new Position(
                this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.columnsCount),
                this.#numberUtility.getRandomIntegerNumber(0, this.gridSize.rowsCount))
        } while (newPosition.equals(this.#googlePosition)
        || newPosition.equals(this.player1Position)
        || newPosition.equals(this.player2Position))
        this.#googlePosition = newPosition
    }

    #checkWinCondition() {
        if (this.player1Points >= this.pointsToWin) {
            this.winner = this.#player1;
            this.#finishGame(GameStatuses.WIN);
        }
        if (this.player2Points >= this.pointsToWin) {
            this.winner = this.#player2;
            this.#finishGame(GameStatuses.WIN);
        }
        if (this.googlePoints >= this.pointsToLose) {
            this.winner = this.#google;
            this.#finishGame(GameStatuses.LOSE);
        }
    }

    #finishGame(status) {
        this.status = status;
        clearInterval(this.#jumpIntervalId);
        clearInterval(this.#gameSessionTimerId);
    }


    get status() {return this.#status;}
    get gridSize() {return this.#settings.gridSize}
    get googlePosition() {return this.#googlePosition}
    get player1Position() {return this.#player1?.position}
    get player2Position() {return this.#player2?.position}
    get player1Name() { return this.#player1 ? this.#player1.name : this.#player1CustomName; }
    get player2Name() { return this.#player2 ? this.#player2.name : this.#player2CustomName; }
    get player1Points() {return this.#player1?.points}
    get player2Points() {return this.#player2?.points}
    get googleName() {return this.#google?.name}
    get googlePoints() {return this.#googlePoints}
    get pointsToWin() {return this.#settings.pointsToWin}
    get pointsToLose() {return this.#settings.pointsToLose}
    get player1() {return this.#player1}
    get player2() {return this.#player2}
    get google() {return this.#google}
    get timer() {return this.#timer}
    get winner() {return this.#winner}
    get googleJumpInterval() {return this.#settings.googleJumpInterval}

    /**
     * Sets the interval for the target's jumps across the grid.
     * * @param {number} newValue - The new interval duration in milliseconds.
     * @throws {TypeError} If the provided value is not of type 'number'.
     * @throws {RangeError} If the provided value is less than or equal to 0.
     */
    set status(newValue) {
        this.#status = newValue
        this.#notify()
    }
    set googleJumpInterval(newValue) {
        if (this.status !== GameStatuses.SETTINGS) {
            return;
        }
        if (typeof newValue !== 'number') {
            throw new TypeError('newValue must be a number')
        }
        if (newValue <= 0) {
            throw new RangeError('newValue must be greater than 0')
        }
        this.#settings.googleJumpInterval = newValue;
    }
    set gridSize(value) {
        if (this.status !== GameStatuses.SETTINGS) {
            return;
        }
        this.#settings.gridSize = value;
        this.#notify()
    }
    set pointsToWin(value) {
        if (this.status !== GameStatuses.SETTINGS) {
            return;
        }
        this.#settings.pointsToWin = value;
        this.#notify();
    }
    set pointsToLose(value) {
        if (this.status !== GameStatuses.SETTINGS) {
            return;
        }
        this.#settings.pointsToLose = value;
        this.#notify();
    }
    set player1Points(points) {this.#player1.points = points}
    set player2Points(points) {this.#player2.points = points;}
    set googlePoints(points) {
        this.#googlePoints = points;
        if (this.#google) {
            this.#google.points = points;
        }}
    set player1Name(player1Name) {
        this.#player1CustomName = player1Name;
        if (this.#player1) {
            this.#player1.name = player1Name;
        }
        this.#notify();
    }
    set player2Name(player2Name) {
        this.#player2CustomName = player2Name;
        if (this.#player2) {
            this.#player2.name = player2Name;
        }
        this.#notify();
    }
    set winner(winner) {this.#winner = winner;}
}

