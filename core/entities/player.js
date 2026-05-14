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

    get playerPoints(){return this.#points}
    get playerId(){return this.#id}
    get playerName(){return this.#name}

    set playerPoints(points){this.#points = points}
    set playerName(name){this.#name = name}
}