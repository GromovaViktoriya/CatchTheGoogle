import {GameStatuses} from "./constants/game-statuses.js";
import {Position} from "./position.js";
import {moveDirection} from "./constants/moveDirection.js";
import {Player} from "./entities/player.js";

export class Game {
    #status = GameStatuses.SETTINGS;
    #googlePosition = null;
    #player1Position = null;
    #player2Position = null;
    #player1 = new Player(1, 'Player 1', this.#player1Position, 0)
    #player2 = new Player(2, 'Player 2', this.#player2Position, 0)
    #googlePoints = null
    #numberUtility

    //DI/Dependency injection
    constructor(somethingSimilarToNumberUtility) {
        this.#numberUtility = somethingSimilarToNumberUtility // must have getRandomIntegerNumber method
    }

    #settings = {
        gridSize: new GridSettings(4, 4),
        googleJumpInterval: 1000,
        pointsToWin: 10,
        pointsToLoose: 10,
    }

    start() {
        if (this.#status !== GameStatuses.SETTINGS) {
            throw new Error('Game must be in Settings status before start')
        }
        this.#status = GameStatuses.IN_PROGRESS;
        this.#placePlayer1ToGrid()
        this.#placePlayer2ToGrid()
        this.#makeGoogleJump()
        this.#notify()

        setInterval(() => {
            this.#makeGoogleJump()
            this.#notify()
        }, this.#settings.googleJumpInterval)

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
        if (direction !== moveDirection.UP
            && direction !== moveDirection.DOWN
            && direction !== moveDirection.LEFT
            && direction !== moveDirection.RIGHT) {
            throw new Error('Invalid direction')
        }
        let position = playerId === 1 ? this.player1Position : this.player2Position;
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
        this.#notify()
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


    get status() {
        return this.#status;
    }

    get gridSize() {
        return this.#settings.gridSize
    }

    get googlePosition() {
        return this.#googlePosition
    }

    get player1Position() {
        return this.#player1.position
    }

    get player2Position() {
        return this.#player2.position
    }

    get player1Points() {
        return this.#player1.points
    }

    get player2Points() {
        return this.#player2.points
    }

    get googlePoints() {
        return this.#googlePoints
    }

    get pointsToWin(){
        return this.#settings.pointsToWin
    }

    get pointsToLose(){
        return this.#settings.pointsToLoose
    }

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

    set gridSize(value) {
        this.#settings.gridSize = value
        this.#notify()
    }

    set player1Points(points) {
        this.#player1.points = points;
    }

    set player2Points(points) {
        this.#player2.points = points;
    }

    set googlePoints(points) {
        this.#googlePoints = points;
    }


}

class GridSettings {
    constructor(columnsCount = 4, rowsCount = 4) {
        if (rowsCount * columnsCount < 4) {
            throw new Error('Min cells count should be 4')
        }
        if (typeof columnsCount !== 'number' || typeof rowsCount !== 'number') {
            throw new TypeError('Arguments must be numbers')
        }
        if (columnsCount <= 0 || rowsCount <= 0) {
            throw new RangeError('Columns and rows must be greater than 0')
        }
        return {
            columnsCount: columnsCount,
            rowsCount: rowsCount
        }
    }
}