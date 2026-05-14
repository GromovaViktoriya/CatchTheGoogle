import {GoogleSettings} from "./google-settings.js";
import {GridSettings} from "./grid-settings.js";

export class GameSettings {
    #gridSize
    #googleJumpInterval
    #pointsToWin
    #pointsToLose

    constructor(grid = 4, pointsToWin = 10, pointsToLose = 10) {
        this.#gridSize = new GridSettings(grid)
        this.#googleJumpInterval = new GoogleSettings(1000)
        this.#pointsToWin = pointsToWin
        this.#pointsToLose = pointsToLose
    }

    get gridSize() {return this.#gridSize}
    get googleJumpInterval() {return this.#googleJumpInterval}
    get pointsToWin() {return this.#pointsToWin}
    get pointsToLose() {return this.#pointsToLose}

    set gridSize(grid) {return this.#gridSize = grid}
    set googleJumpInterval(interval) {this.#googleJumpInterval = interval}
    set pointsToLose(pointsToLose) {this.#pointsToLose = pointsToLose}
    set pointsToWin(pointsToWin) {this.#pointsToWin = pointsToWin}
}