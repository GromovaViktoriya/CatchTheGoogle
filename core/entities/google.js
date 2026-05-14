export class Google {
    #googlePoints = 0
    #googlePosition = null
    #googleName = 'Google';
    constructor(position, googlePoints) {
        this.#googlePosition = position;
        this.#googlePoints = googlePoints;
    }

    get name(){return this.#googleName;}
    get points() {return this.#googlePoints;}
    get position() {return this.#googlePosition;}

    set position(newPosition) {this.#googlePosition = newPosition;}
    set points(newValue) {this.#googlePoints = newValue;}
}