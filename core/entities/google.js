export class Google {
    #googlePoints = 0
    #googlePosition = null
    #googleName = 'Google';
    constructor(position, googlePoints) {
        this.#googlePosition = position;
        this.#googlePoints = googlePoints;
    }

    get googleName(){return this.#googleName;}
    get googlePoints() {return this.#googlePoints;}
    get googlePosition() {return this.#googlePosition;}

    set googlePosition(newPosition) {this.#googlePosition = newPosition;}
    set googlePoints(newValue) {this.#googlePoints = newValue;}
}