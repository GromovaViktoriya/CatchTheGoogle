export class Player {
    #position
    #id
    #name
    #points

    constructor(id, name, position) {
        this.#position = position
        this.#id = id
        this.#name = name
        this.#points = 0
    }

    get points(){return this.#points}
    get id(){return this.#id}
    get name(){return this.#name}

    set points(points){this.#points = points}
    set name(name){this.#name = name}
}