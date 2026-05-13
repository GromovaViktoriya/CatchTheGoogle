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
                const winComponent = new WinComponent();
                const winElement = winComponent.render();
                rootElement.append(winElement)
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
        const container = document.createElement('table')
        //для таблиц и матриц - всегда цикл в цикле
        for (let y = 0; y < dto.gridSize.rowsCount; y++) {
            const row = document.createElement('tr')
            for (let x = 0; x < dto.gridSize.columnsCount; x++) {
                const cell = document.createElement('td')
                const isPlayer1 = dto.player1Position?.x === x && dto.player1Position?.y === y;
                const isPlayer2 = dto.player2Position?.x === x && dto.player2Position?.y === y;
                const isGoogle = dto.googlePosition?.x === x && dto.googlePosition?.y === y;

                if (isGoogle && (isPlayer1 || isPlayer2)) {
                    cell.textContent = '✨';
                } else if (isPlayer1) {
                    cell.textContent = '👩‍💻';
                } else if (isPlayer2) {
                    cell.textContent = '👨‍💻';
                } else if (isGoogle) {
                    cell.textContent = '💸';
                }
                row.append(cell)
            }

            container.append(row)
        }
        return container
    }
}

class WinComponent {
    render(){
        const container = document.createElement('div')
        container.classList.add('container')
        container.classList.add('win')
        button.append('')
        return container
    }
}