import {GameStatuses} from "../core/constants/game-statuses.js";
import {moveDirection} from "../core/constants/moveDirection.js";

export class View {
    onstart = null
    onplayermove = null
    onsettingschange = null

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

        const settingsComponent = new SettingsComponent({onchange: this.onsettingschange});
        const settingsElement = settingsComponent.render(dto);


        const modalComponent = new ModalComponent({onstart: this.onstart});
        const modalElement = modalComponent.render(dto);

        rootElement.innerHTML = '';

        switch (dto.status) {
            case GameStatuses.SETTINGS:
                const startComponent = new StartComponent({onstart: this.onstart});
                const startElement = startComponent.render();
                rootElement.append(settingsElement, startElement);
                break;
            case GameStatuses.IN_PROGRESS: {
                const gameInterfaceComponent = new GameInterfaceComponent();
                const gameInterfaceElement = gameInterfaceComponent.render(dto);
                const gridComponent = new GridComponent();
                const gridElement = gridComponent.render(dto);
                rootElement.append(settingsElement, gameInterfaceElement, gridElement);
                break;
            }
            case GameStatuses.WIN:
            case GameStatuses.LOSE: {
                const modalComponent = new ModalComponent({onstart: this.onstart});
                const modalElement = modalComponent.render(dto);
                rootElement.append(modalElement);
                break;
            }
        }
    }
}

class SettingsComponent {
    #props
    constructor(props) {
        this.#props = props
    }

    // Хелпер для создания селектов
        #createOptionLine (labelTitle, id, options, currentValue, settingKey) {
        const container = document.createElement('div');
        container.classList.add('line');

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelTitle;

        const select = document.createElement('select');
        select.id = id;

        options.forEach(opt => {
            const option = new Option(opt.t, opt.v);
            if ((opt.v).toString() === currentValue) option.selected = true;
            select.append(option);
        });

        select.onchange = (e) => {
            this.#props.onchange?.(settingKey, e.target.value);
        };

        container.append(label, select);
        return container;
    };

    render(dto) {
        const settingsContainer = document.createElement('div');
        settingsContainer.classList.add('top-items');
        settingsContainer.id = 'settings';

        const gridOptions = [{t: '4x4', v: 4}, {t: '5x5', v: 5}, {t: '7x7', v: 7}, {t: '8x8', v: 8}];
        const winOptions = [{t: '10 pts', v: 10}, {t: '20 pts', v: 20}, {t: '30 pts', v: 30}];
        const loseOptions = [{t: '5 pts', v: 5}, {t: '10 pts', v: 10}, {t: '20 pts', v: 20}];
        const intervalOptions = [{t: '1 sec', v: 1000}, {t: '2 sec', v: 2000}, {t: '3 sec', v: 3000}];

        settingsContainer.append(
            this.#createOptionLine('Grid size', '01', gridOptions, dto.gridSize.columnsCount, 'gridSize'),
            this.#createOptionLine('Points to win', '02', winOptions, dto.pointsToWin, 'pointsToWin'),
            this.#createOptionLine('Points to lose', '03', loseOptions, dto.pointsToLose, 'pointsToLose'),
            this.#createOptionLine('Google Jump Interval', '04', intervalOptions, dto.googleJumpInterval, 'googleJumpInterval')
        );

        return settingsContainer;
    }
}

class StartComponent {
    #props

    constructor(props) {
        this.#props = props;
    }

    render() {
        const button = document.createElement('button')
        button.classList.add('button', 'main-button')
        button.textContent = 'START GAME'
        //observer - наблюдатель - почитать
        //button - subject/publisher
        //open-close principle: открытая для расширения-закрытая для изменения
        button.onclick = () => {
            //функция-слушатель/наблюдатель/observer/handler/listener/subscriber
            this.#props?.onstart?.()
        }

        return button
    }
}

class GameInterfaceComponent {
    render(dto) {
        const container = document.createElement('div');
        container.classList.add('main-elements');
        container.id = 'game-interface';

        const pointsContainer = document.createElement('div');
        pointsContainer.classList.add('points-container');
        pointsContainer.id = 'points-container';

        //Отрисовка блоков счета (Player 1, Player 2, Google)
        pointsContainer.append(
            this.#createResultBlock('Player 1', 'img/icons/man01.svg', dto.player1Points),
            this.#createResultBlock('Player 2', 'img/icons/man02.svg', dto.player2Points),
            this.#createResultBlock('Google', 'img/icons/googleIcon.svg', dto.googlePoints)
        );

        container.append(pointsContainer);
        return container;
    }

    #createResultBlock(name, imageSrc, points) {
        const block = document.createElement('div');
        block.classList.add('result-block');

        const titleSpan = document.createElement('span');
        titleSpan.classList.add('result-title');
        titleSpan.textContent = name;

        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = name;

        const scoreSpan = document.createElement('span');
        scoreSpan.classList.add('result');
        scoreSpan.textContent = points;

        block.append(titleSpan, img, scoreSpan);
        return block;
    }
}

class GridComponent {
    render(dto) {
        const table = document.createElement('table')
        table.classList.add('table')
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
    #props

    constructor(props) {
        this.#props = props;
    }

    render(dto) {
        const isGoogleWinner = dto.winner === dto.google
        const isPlayer1Winner = dto.winner === dto.player1
        const isPlayer2Winner = dto.winner === dto.player2

        const biggestPlayerCatch = dto.player1.points < dto.player2.points
            ? dto.player2.points
            : dto.player1.points
        const resultPoints = isPlayer1Winner
            ? `${dto.player1.points}`
            : isPlayer2Winner
                ? `${dto.player1.points}`
                : `${biggestPlayerCatch}`

        const Modal = document.createElement('div')
        Modal.classList.add('modal')
        Modal.id = isGoogleWinner ? 'modal-loose' : 'modal-win'

        const ImageWrapper = document.createElement('div')
        ImageWrapper.classList.add('modal-decoration')
        const Image = document.createElement('img')
        Image.src = isGoogleWinner ? 'img/icons/lossIcon.svg' : 'img/icons/winnerIcon.svg'
        Image.alt = 'icon'
        ImageWrapper.append(Image)

        const modalElements = document.createElement('div')
        modalElements.classList.add('modal-elements')
        const titleModal = document.createElement('div')
        titleModal.classList.add('title-modal')
        titleModal.textContent = isGoogleWinner ? 'Google Win!' : `You Win!`
        const textModal = document.createElement('div')
        textModal.classList.add('text-modal')
        textModal.textContent = isGoogleWinner ? `You'll be lucky next time` : `${dto.winner.name}`

        const modalResult = document.createElement('div')
        modalResult.classList.add('modal-result')

        const playerResultBlock = document.createElement('div')
        playerResultBlock.classList.add('result-block')
        const playerResultTitle = document.createElement('span')
        playerResultTitle.classList.add('result-title')
        playerResultTitle.textContent = 'Catch:'
        const playerResult = document.createElement('span')
        playerResult.classList.add('result')
        playerResult.append(`${resultPoints}`)
        playerResultBlock.append(playerResultTitle, playerResult)

        const googleResultBlock = document.createElement('div')
        googleResultBlock.classList.add('result-block')
        const googleResultTitle = document.createElement('span')
        googleResultTitle.classList.add('result-title')
        googleResultTitle.textContent = 'Miss:'
        const googleResult = document.createElement('span')
        googleResult.classList.add('result')
        googleResult.append(`${dto.google.points}`)
        googleResultBlock.append(googleResultTitle, googleResult)

        const buttonPlayAgain = document.createElement('button')
        buttonPlayAgain.classList.add('button', 'play-again-button')
        buttonPlayAgain.textContent = 'Play again'

        buttonPlayAgain.onclick = () => {
            this.#props?.onstart?.()
        }

        modalResult.append(playerResultBlock, googleResultBlock)
        modalElements.append(titleModal, textModal, modalResult, buttonPlayAgain)
        Modal.append(ImageWrapper, modalElements)

        return Modal
    }
}