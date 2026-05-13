
/**
 * Utility class for mathematical operations and random number generation.
 */
export class ShogunNumberUtility {
    /**
     * Generates a random integer within a specified range.
     * @param {number} fromInclusive - The lower bound of the range (inclusive).
     * @param {number} ToExclusive - The upper bound of the range (exclusive).
     * @returns {number} A random integer between fromInclusive and ToExclusive - 1.
     * @throws {Error} Arguments must be of type 'number'.
     * @throws {Error} fromInclusive must be strictly less than ToExclusive.
     * @example
     * const utils = new ShogunNumberUtility();
     * const randomVal = utils.getRandomIntegerNumber(1, 5); // returns 1, 2, 3, or 4
     */
    getRandomIntegerNumber(fromInclusive, ToExclusive) {
        if (typeof fromInclusive !== 'number' || typeof ToExclusive !== 'number') {
            throw new TypeError('Arguments must be numbers')
        }
        if (fromInclusive >= ToExclusive) {
            throw new RangeError('fromInclusive must be less than ToExclusive')
        }
        return Math.floor(Math.random() * (ToExclusive - fromInclusive) + fromInclusive);
    }
}