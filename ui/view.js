import {GameStatuses} from "../core/constants/game-statuses.js";
import {moveDirection} from "../core/constants/moveDirection.js";

export class View {
    onstart = null
    onplayermove = null

    constructor() {
        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowUp':
                    this.onplayermove?.(1, moveDirection.UP);
                    break;
                case 'ArrowDown':
                    this.onplayermove?.(1, moveDirection.DOWN);
                    break;
                case 'ArrowLeft':
                    this.onplayermove?.(1, moveDirection.LEFT);
                    break;
                case 'ArrowRight':
                    this.onplayermove?.(1, moveDirection.RIGHT);
                    break;
                case 'KeyW':
                    this.onplayermove?.(2, moveDirection.UP);
                    break;
                case 'KeyS':
                    this.onplayermove?.(2, moveDirection.DOWN);
                    break;
                case 'KeyA':
                    this.onplayermove?.(2, moveDirection.LEFT);
                    break;
                case 'KeyD':
                    this.onplayermove?.(2, moveDirection.RIGHT);
                    break;
            }
        });
    }

    render(dto) {
        const rootElement = document.getElementById('root')
        rootElement.innerHTML = '';
        rootElement.append('GAME WILL BE HERE:' + dto.status)
        switch (dto.status) {
            case GameStatuses.SETTINGS:
                const settingsComponent = new SettingsComponent({onstart: this.onstart});
                const settingsElement = settingsComponent.render(dto);
                rootElement.append(settingsElement)
                break;
            case GameStatuses.IN_PROGRESS: {
                const gridComponent = new GridComponent();
                const gridElement = gridComponent.render(dto);
                rootElement.append(gridElement)
                break;
            }
            case GameStatuses.WIN: {
                const modalComponent = new ModalComponent();
                const modalElement = modalComponent.render(dto);
                rootElement.append(modalElement)
                break;
            }
            case GameStatuses.LOSE: {
                const modalComponent = new ModalComponent();
                const modalElement = modalComponent.render(dto);
                rootElement.append(modalElement)
            }
        }
    }
}

class SettingsComponent {
    #props

    constructor(props) {
        this.#props = props;
    }

    render() {
        const container = document.createElement('div')
        container.classList.add('container')
        const button = document.createElement('button')
        button.classList.add('btn', 'btn-primary')
        button.append('START GAME')
        //observer - наблюдатель - почитать
        //button - subject/publisher
        //open-close principle: открытая для расширения-закрытая для изменения
        button.onclick = () => {
            //функция-слушатель/наблюдатель/observer/handler/listener/subscriber
            this.#props?.onstart?.()
        }

        container.append(button)
        return container
    }
}

class GridComponent {
    render(dto) {
        const table = document.querySelector('table')
        const tBody = document.createElement('tbody')
        table.append(tBody)
        //для таблиц и матриц - всегда цикл в цикле
        for (let y = 0; y < dto.gridSize.rowsCount; y++) {
            const row = document.createElement('tr')
            for (let x = 0; x < dto.gridSize.columnsCount; x++) {
                const cell = document.createElement('td')
                cell.classList.add('cell')
                const isPlayer1 = dto.player1Position?.x === x && dto.player1Position?.y === y;
                const isPlayer2 = dto.player2Position?.x === x && dto.player2Position?.y === y;
                const isGoogle = dto.googlePosition?.x === x && dto.googlePosition?.y === y;
                const googleIcon = document.createElement('img')
                googleIcon.src = "img/icons/googleIcon.svg"
                googleIcon.alt = "googleIcon"
                const player1Icon = document.createElement('img')
                player1Icon.src = "img/icons/man01.svg"
                player1Icon.alt = "man"
                const player2Icon = document.createElement('img')
                player2Icon.src = "img/icons/man02.svg"
                player2Icon.alt = "man"

                if (isPlayer1) {
                    cell.append(player1Icon)
                } else if (isPlayer2) {
                    cell.append(player2Icon)
                } else if (isGoogle) {
                    cell.append(googleIcon)
                }
                row.append(cell)
            }

            tBody.append(row)
        }
        return table
    }
}

class ModalComponent {
    render(dto){
        const winModal = document.createElement('div')
        winModal.classList.add('modal')
        winModal.id = 'modal-win'

        const winImageWrapper = document.createElement('div')
        winImageWrapper.classList.add('modal-decoration')
        const winImage = document.createElement('img')
        winImage.src = 'img/icons/winnerIcon.svg'
        winImage.alt = 'icon'
        winImageWrapper.append(winImage)
        winModal.append(winImageWrapper)

        const modalElements = document.createElement('div')
        modalElements.classList.add('modal-elements')
        const titleModal = document.createElement('div')
        titleModal.classList.add('title-modal')
        titleModal.textContent = `${dto.winner}, You Win!`
        const textModal = document.createElement('div')
        textModal.classList.add('text-modal')
        textModal.textContent = `Congratulations`
        const modalResult = document.createElement('div')
        modalResult.classList.add('modal-result')
        const resultBlock = document.createElement('div')
        resultBlock.classList.add('result-block')
        const resultTitle = document.createElement('span')
        resultTitle.classList.add('result-title')
        const result = document.createElement('span')
        result.classList.add('result')

        return winModal
    }
}