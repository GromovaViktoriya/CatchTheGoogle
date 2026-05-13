import {ShogunNumberUtility} from "./shogun-number-utility";


describe('ShogunNumberUtility', () => {
    let utility;

    beforeEach(() => {
        utility = new ShogunNumberUtility();
    });

    describe('getRandomIntegerNumber', () => {

        test('should throw error if arguments are not numbers', () => {
            expect(() => utility.getRandomIntegerNumber('1', 10)).toThrow('Arguments must be numbers');
            expect(() => utility.getRandomIntegerNumber(1, null)).toThrow('Arguments must be numbers');
            expect(() => utility.getRandomIntegerNumber(undefined, 5)).toThrow('Arguments must be numbers');
        });

        test('should throw error if fromInclusive is greater than or equal to ToExclusive', () => {
            expect(() => utility.getRandomIntegerNumber(10, 5)).toThrow('fromInclusive must be less than ToExclusive');
            expect(() => utility.getRandomIntegerNumber(5, 5)).toThrow('fromInclusive must be less than ToExclusive');
        });

        test('should return exactly fromInclusive when Math.random is 0', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0);

            const result = utility.getRandomIntegerNumber(5, 10);
            expect(result).toBe(5);

            Math.random.mockRestore();
        });

        test('should return an integer within the specified range', () => {
            const from = 1;
            const to = 3;

            for (let i = 0; i < 100; i++) {
                const result = utility.getRandomIntegerNumber(from, to);
                expect(Number.isInteger(result)).toBe(true);
                expect(result).toBeGreaterThanOrEqual(from);
                expect(result).toBeLessThan(to);
            }
        });

        test('should return 0 when range is (0, 1)', () => {
            const result = utility.getRandomIntegerNumber(0, 1);
            expect(result).toBe(0);
        });
    });
});