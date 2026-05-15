export class Google {
    #points = 0
    #position = null
    #name = 'Google';
    constructor(position, googlePoints) {
        this.#position = position;
        this.#points = googlePoints;
    }

    get name(){return this.#name;}
    get points() {return this.#points;}
    get position() {return this.#position;}

    set position(newPosition) {this.#position = newPosition;}
    set points(newValue) {this.#points = newValue;}
}