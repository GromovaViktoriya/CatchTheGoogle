export class GoogleSettings {
    #googleJumpInterval = 0;

    constructor(ms) {
        this.#googleJumpInterval = ms
    }

    get googleJumpInterval() {return this.#googleJumpInterval}
    set googleJumpInterval(newInterval) {
        if (typeof newInterval !== 'number') {
            throw new TypeError('newValue must be a number')
        }
        if (newInterval <= 0) {
            throw new RangeError('newValue must be greater than 0')
        }
        this.#googleJumpInterval = newInterval;
    }
}