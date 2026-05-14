//GRASP - Controller - почитать
export class Controller {
    //dependency injection
    #view
    #model

    constructor(somethingLikeView, somethingLikeModel) {
        this.#view = somethingLikeView
        this.#model = somethingLikeModel

        //low coupling
        this.#model.subscribe(() => {
            this.#render()
        })
        this.#model.subscribe(() => {
            console.log('STATE OF GAME CHANGED')
        })

        this.#view.onstart = () => {
            this.#model.start()
            this.#render()
        }
        this.#view.onplayermove = (playerNumber, direction) => {
            this.#model.movePlayer(playerNumber, direction)
        }
    }

    init() {
        this.#render()
    }

    #render() {
        const dto = {
            status: this.#model.status,
            gridSize: this.#model.gridSize,
            googlePosition: this.#model.googlePosition,
            player1Position: this.#model.player1Position,
            player2Position: this.#model.player2Position,
            googlePoints: this.#model.googlePoints,
            player1Points: this.#model.player1Points,
            player2Points: this.#model.player2Points,
            pointsToWin: this.#model.pointsToWin,
            pointsToLoose: this.#model.pointsToLose,
            winner: this.#model.winner,
            player1Name: this.#model.player1Name,
            player2Name: this.#model.player2Name,
            googleName: this.#model.googleName,
        }
        this.#view.render(dto)
    }
}