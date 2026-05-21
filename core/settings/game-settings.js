import {GoogleSettings} from "./google-settings.js";
import {GridSettings} from "./grid-settings.js";

export class GameSettings {
    #gridSize
    #thisGoogleSettings
    #pointsToWin
    #pointsToLose

    constructor(grid = 4, pointsToWin = 10, pointsToLose = 10) {
        this.#gridSize = new GridSettings(grid)
        this.#thisGoogleSettings = new GoogleSettings(1000)
        this.#pointsToWin = pointsToWin
        this.#pointsToLose = pointsToLose
    }

    get gridSize() {return this.#gridSize}
    get googleJumpInterval() {return this.#thisGoogleSettings.googleJumpInterval}
    get pointsToWin() {return this.#pointsToWin}
    get pointsToLose() {return this.#pointsToLose}

    set gridSize(grid) {
        return this.#gridSize = grid
    }
    set googleJumpInterval(interval) {
        this.#thisGoogleSettings.googleJumpInterval = interval
    }
    set pointsToLose(pointsToLose) {this.#pointsToLose = pointsToLose}
    set pointsToWin(pointsToWin) {this.#pointsToWin = pointsToWin}
}