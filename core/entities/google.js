import {Position} from "../position";

export class Google {
    #googleJumpInterval
    constructor(ms) {
        this.#googleJumpInterval = ms
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
        this.#googleJumpInterval = newValue;
    }

    #makeGoogleJump() {
        const newPosition = new Position (
            this.#numberUtility.getRandomIntegerNumber(0, this.#settings.gridSize.columnsCount),
            this.#numberUtility.getRandomIntegerNumber(0, this.#settings.gridSize.rowsCount)
        )
        if (newPosition.x === this.#googlePosition?.x && newPosition.y === this.#googlePosition?.y) {
            this.#makeGoogleJump();
            return
        }
        this.#googlePosition = newPosition
    }
}