import {Game} from "./game";
import {GameStatuses} from "./constants/game-statuses";
import {ShogunNumberUtility} from "./shogun-number-utility";
import {moveDirection} from "./constants/moveDirection";


describe('Game', () => {
    it('game should be created and return status', () => {
        const numberUtil = new ShogunNumberUtility();
        const game = new Game(numberUtil);
        expect(game.status).toBe(GameStatuses.SETTINGS)
    })

    it('game should be created and return status', async () => {
        const numberUtil = new ShogunNumberUtility();
        const game = new Game(numberUtil);
        await game.start()
        expect(game.status).toBe(GameStatuses.IN_PROGRESS)
    })

    it('game should be in the Grid after start', async () => {
        const numberUtil = new ShogunNumberUtility();
        for (let i = 0; i < 100; i++) {
            const game = new Game(numberUtil);
            expect(game.googlePosition).toBeNull()
            await game.start()
            expect(game.googlePosition.x).toBeLessThan(game.gridSize.columnsCount)
            expect(game.googlePosition.x).toBeGreaterThanOrEqual(0)
            expect(game.googlePosition.y).toBeLessThan(game.gridSize.rowsCount)
            expect(game.googlePosition.y).toBeGreaterThanOrEqual(0)
        }
    })

    it('google should be in the Grid but in new position after jump', async () => {
        const game = new Game(new ShogunNumberUtility());
        game.googleJumpInterval = 1; //1ms
        await game.start(); // jump -> webAPI/browser 10
        for (let i = 0; i < 100; i++) {
            const prevGooglePosition = game.googlePosition;
            await delay(1) // await -> webAPI/browser 10 // after 10 ms: macroTask
            const currentGooglePosition = game.googlePosition;
            expect(prevGooglePosition).not.toEqual(currentGooglePosition)
        }
    })

    it('player should be in the Grid after start', async () => {
        const numberUtil = new ShogunNumberUtility();
        for (let i = 0; i < 100; i++) {
            const game = new Game(numberUtil);
            expect(game.player1Position).toBeNull()
            await game.start()
            expect(game.player1Position.x).toBeLessThan(game.gridSize.columnsCount)
            expect(game.player1Position.x).toBeGreaterThanOrEqual(0)
            expect(game.player1Position.y).toBeLessThan(game.gridSize.rowsCount)
            expect(game.player1Position.y).toBeGreaterThanOrEqual(0)
        }
    })
    it('player should be moved in correct directions', async () => {
        // const numberUtil = new ShogunNumberUtility();
        const fakeNumberUtil = {
            // #index:0,
            // values:[2,2,0,0],
            // getRandomIntegerNumber(){
            //     return this.values[this.#index++]
            // }
            *numbersGenerator() {
                yield 2;
                yield 2;
                yield 1;
                yield 1;
                yield 0;
                yield 0;
                while (true) {
                    yield 0;
                }
            },
            iterator: null,
            getRandomIntegerNumber() {
                if (!this.iterator) {
                    this.iterator = this.numbersGenerator();
                }
                return this.iterator.next().value;
            }

        }
        const game = new Game(fakeNumberUtil);
        game.gridSize = {columnsCount: 3, rowsCount: 3}
        game.start()
        // [  ] [  ] [  ]
        // [  ] [  ] [  ]
        // [  ] [  ] [p1]
        // вниз-вверх по y
        // влево-вправо по x

        expect(game.player1Position).toEqual({x: 2, y: 2})
        game.movePlayer(1, moveDirection.RIGHT)
        expect(game.player1Position).toEqual({x: 2, y: 2})
        game.movePlayer(1, moveDirection.DOWN)
        expect(game.player1Position).toEqual({x: 2, y: 2})
        game.movePlayer(1, moveDirection.UP)
        // [  ] [  ] [  ]
        // [  ] [  ] [p1]
        // [  ] [  ] [. ]
        expect(game.player1Position).toEqual({x: 2, y: 1})
        game.movePlayer(1, moveDirection.UP)
        // [  ] [  ] [p1]
        // [  ] [  ] [. ]
        // [  ] [  ] [  ]
        expect(game.player1Position).toEqual({x: 2, y: 0})
        game.movePlayer(1, moveDirection.LEFT)
        // [  ] [p1] [. ]
        // [  ] [  ] [  ]
        // [  ] [  ] [  ]
        expect(game.player1Position).toEqual({x: 1, y: 0})
        game.movePlayer(1, moveDirection.UP)
        // [  ] [p1] [  ]
        // [  ] [  ] [  ]
        // [  ] [  ] [  ]
        // [  ] [  ] [  ]
        expect(game.player1Position).toEqual({x: 1, y: 0})
        game.movePlayer(1, moveDirection.LEFT)
        // [p1] [. ] [  ]
        // [  ] [  ] [  ]
        // [  ] [  ] [  ]
        // [  ] [  ] [  ]
        expect(game.player1Position).toEqual({x: 0, y: 0})
        game.movePlayer(1, moveDirection.LEFT)
        // [p1] [  ] [  ]
        // [  ] [  ] [  ]
        // [  ] [  ] [  ]
        // [  ] [  ] [  ]
        expect(game.player1Position).toEqual({x: 0, y: 0})
    })

});

//промисификация setTimeout
const delay = (ms) => new Promise(res => setTimeout(res, ms));