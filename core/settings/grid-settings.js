export class GridSettings {
    constructor(grid) {
        if (grid < 3) {
            throw new Error('Min cells count should be 4')
        }
        if (typeof grid !== 'number') {
            throw new TypeError('Argument must be a number')
        }
        if (grid <= 0) {
            throw new RangeError('Columns and rows must be greater than 0')
        }
        return {
            columnsCount: grid,
            rowsCount: grid
        }
    }
}