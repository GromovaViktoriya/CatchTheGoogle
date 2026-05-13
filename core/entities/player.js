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

    get playerPoints(){
        return this.#points
    }

    set playerPoints(points){
        this.#points = points
    }
}