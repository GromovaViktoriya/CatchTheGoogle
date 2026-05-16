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
        this.#view.onrestart = () => {
            this.#model.restart()
            this.#view.isNoticeClosed = false
            this.#view.isSoundToggleOn = false
            this.#render()
        }
        this.#view.onpause = () => {
            this.#model.pause()
            this.#render()
        }
        this.#view.onresume = () => {
            this.#model.resume()
            this.#render()
        }
        this.#view.onplayermove = (playerNumber, direction) => {
            this.#model.movePlayer(playerNumber, direction)
        }
        this.#view.onsettingschange = (settingKey, value) => {
            if (settingKey === 'gridSize') this.#model.gridSize = {
                columnsCount: Number(value),
                rowsCount: Number(value)
            };
            if (settingKey === 'pointsToWin') this.#model.pointsToWin = Number(value);
            if (settingKey === 'pointsToLose') this.#model.pointsToLose = Number(value);
            if (settingKey === 'googleJumpInterval') this.#model.googleJumpInterval = Number(value);
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
            pointsToLose: this.#model.pointsToLose,
            winner: this.#model.winner,
            player1Name: this.#model.player1Name,
            player2Name: this.#model.player2Name,
            googleName: this.#model.googleName,
            google: this.#model.google,
            player1: this.#model.player1,
            player2: this.#model.player2,
            googleJumpInterval: this.#model.googleJumpInterval,
            timer: this.#model.timer,
        }
        this.#view.render(dto)
    }
}