import {Game} from "./game.js";
import {GameStatuses} from "./constants/game-statuses.js";
import {ShogunNumberUtility} from "./shogun-number-utility.js";
import {moveDirection} from "./constants/moveDirection.js";
import {GridSettings} from "./settings/grid-settings.js";


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
        game.googleJumpInterval = 10;
        game.start();

        const prevGooglePosition = { x: game.googlePosition.x, y: game.googlePosition.y };
        await delay(20);
        const currentGooglePosition = { x: game.googlePosition.x, y: game.googlePosition.y };

        expect(prevGooglePosition).not.toEqual(currentGooglePosition);
    })

    it('player should be in the Grid after start', async () => {
        const numberUtil = new ShogunNumberUtility();
        for (let i = 0; i < 100; i++) {
            const game = new Game(numberUtil);
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
                yield 2; yield 2; // p1 (x, y)
                yield 1; yield 1; // p2 (x, y)
                yield 0; yield 0; // google (x, y)
                while (true) yield 0;
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
        game.gridSize = new GridSettings(3);
        game.start()
        // [  ] [  ] [  ]
        // [  ] [p2] [  ]
        // [  ] [  ] [p1]
        // вниз-вверх по y
        // влево-вправо по x

        expect(game.player1Position).toEqual({x: 2, y: 2})
        expect(game.player2Position).toEqual({x: 1, y: 1})
        game.movePlayer(1, moveDirection.RIGHT)
        game.movePlayer(2, moveDirection.LEFT)
        expect(game.player1Position).toEqual({x: 2, y: 2})
        expect(game.player2Position).toEqual({x: 0, y: 1})
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