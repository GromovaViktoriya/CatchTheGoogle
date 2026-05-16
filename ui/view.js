import {GameStatuses} from "../core/constants/game-statuses.js";
import {moveDirection} from "../core/constants/moveDirection.js";

export class View {
    onstart = null
    onplayermove = null
    onsettingschange = null
    onrestart = null
    onpause = null
    onresume = null
    #isNoticeClosed = false;
    #isSoundToggleOn = false;

    #backgroundMusic = new Audio('sounds/background.mp3');
    #buttonSound = new Audio('sounds/buttonClick.mp3');
    #catchGoogleSound = new Audio('sounds/playerPoint.mp3');
    #missSound = new Audio('sounds/googlePoint.mp3');
    #playerMoveSound = new Audio('sounds/playerMove.mp3');
    #winSound = new Audio('sounds/winSound.mp3');
    #loseSound = new Audio('sounds/loseSound.mp3');
    #hoverSound = new Audio('sounds/hoverSound.mp3');
    #selectSound = new Audio('sounds/selectSound.mp3');

    #previousState = {
        status: null,
        player1Points: 0,
        player2Points: 0,
        googlePoints: 0,
        player1Position: null,
        player2Position: null
    };

    #playSound(audioObject) {
        if (!this.#isSoundToggleOn) return;
        if (audioObject === this.#backgroundMusic) {
            audioObject.currentTime = 13;
            audioObject.loop = true;
            audioObject.volume = 0.2;
        } else if (audioObject === this.#buttonSound) {
            audioObject.currentTime = 3;
            audioObject.volume = 0.1;
        } else {
            audioObject.currentTime = 0;
            audioObject.volume = 0.1;
        }
        audioObject.play().catch(error => {
            console.log('Воспроизведение заблокировано браузером:', error);
        });
    }

    #stopSound(audioObject) {
        audioObject.pause();
        audioObject.currentTime = 0;
    }

    get isNoticeClosed() {
        return this.#isNoticeClosed;
    }

    set isNoticeClosed(value) {
        this.#isNoticeClosed = value;
    }

    get isSoundToggleOn() {
        return this.#isSoundToggleOn;
    }

    set isSoundToggleOn(value) {
        this.#isSoundToggleOn = value;
        if (!value) {
            this.#backgroundMusic.pause();
        } else if (this.#previousState.status === GameStatuses.IN_PROGRESS) {
            this.#playSound(this.#backgroundMusic);
        }
    }

    #isPositionChanged(pos1, pos2) {
        if (!pos1 || !pos2) return false;
        return pos1.x !== pos2.x || pos1.y !== pos2.y;
    }


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
        //Анализ изменений dto и запуск звуков

        if (dto.status !== this.#previousState.status) {
            if (dto.status === GameStatuses.IN_PROGRESS) {
                this.#playSound(this.#backgroundMusic);
            } else if (dto.status === GameStatuses.PAUSE) {
                this.#backgroundMusic.pause();
            } else if (dto.status === GameStatuses.WIN) {
                this.#stopSound(this.#backgroundMusic);
                this.#playSound(this.#winSound);
            } else if (dto.status === GameStatuses.LOSE) {
                this.#stopSound(this.#backgroundMusic);
                this.#playSound(this.#loseSound);
            } else {
                this.#stopSound(this.#backgroundMusic);
            }
        }

        if (dto.status === GameStatuses.IN_PROGRESS && this.#previousState.status === GameStatuses.IN_PROGRESS) {
            if (dto.player1Points > this.#previousState.player1Points || dto.player2Points > this.#previousState.player2Points) {
                this.#playSound(this.#catchGoogleSound);
            } else if (dto.googlePoints > this.#previousState.googlePoints) {
                this.#playSound(this.#missSound);
            }

            else if (
                this.#isPositionChanged(dto.player1Position, this.#previousState.player1Position) ||
                this.#isPositionChanged(dto.player2Position, this.#previousState.player2Position)
            ) {
                this.#playSound(this.#playerMoveSound);
            }
        }

        this.#previousState = {
            status: dto.status,
            player1Points: dto.player1Points,
            player2Points: dto.player2Points,
            googlePoints: dto.googlePoints,
            player1Position: dto.player1Position ? { ...dto.player1Position } : null,
            player2Position: dto.player2Position ? { ...dto.player2Position } : null
        };

        //Отрисовка
        const rootElement = document.getElementById('root')

        const settingsComponent = new SettingsComponent({
            onchange: this.onsettingschange,
            onpause: () => {
                this.#playSound(this.#buttonSound);
                this.onpause?.();
            },
            isSoundOn: this.#isSoundToggleOn,
            ontogglesound: (value) => {
                this.isSoundToggleOn = value;
                if(value) this.#playSound(this.#buttonSound);
            },
            onhover: () => this.#playSound(this.#hoverSound),
            onselectclick: () => this.#playSound(this.#selectSound)
        });
        const settingsElement = settingsComponent.render(dto);
        const gameInterfaceComponent = new GameInterfaceComponent();
        const gameInterfaceElement = gameInterfaceComponent.render(dto);
        const gridComponent = new GridComponent();
        const gridElement = gridComponent.render(dto);

        rootElement.innerHTML = '';

        switch (dto.status) {
            case GameStatuses.SETTINGS:
                const startComponent = new StartComponent({
                    onstart: () => {
                        this.#playSound(this.#buttonSound);
                        this.onstart?.();
                    }
                });
                const startElement = startComponent.render();
                rootElement.append(settingsElement, startElement);
                break;
            case GameStatuses.IN_PROGRESS: {
                if (!this.#isNoticeClosed) {
                    const noticeComponent = new NoticeComponent({
                        onclose: () => {
                            this.#playSound(this.#buttonSound);
                            this.#isNoticeClosed = true;
                        },
                    });
                    const noticeElement = noticeComponent.render();
                    rootElement.append(noticeElement);
                }
                rootElement.append(settingsElement, gameInterfaceElement, gridElement);
                break;
            }
            case GameStatuses.WIN:
            case GameStatuses.LOSE: {
                const modalComponent = new ModalComponent({
                    onrestart: () => {
                        this.#playSound(this.#buttonSound);
                        this.onrestart?.();
                    },
                });
                const modalElement = modalComponent.render(dto);
                rootElement.append(modalElement);
                break;
            }
            case GameStatuses.PAUSE: {
                const pauseComponent = new PauseComponent({
                    onrestart: () => {
                        this.#playSound(this.#buttonSound);
                        this.onrestart?.();
                    },
                    onresume: () => {
                        this.#playSound(this.#buttonSound);
                        this.onresume?.();
                    },
                });
                const pauseElement = pauseComponent.render()
                rootElement.append(settingsElement, gameInterfaceElement, gridElement, pauseElement,);
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

    //Хелпер для создания селектов
    #createOptionLine(labelTitle, id, options, currentValue, settingKey, dto) {
        const container = document.createElement('div');
        container.classList.add('line');

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelTitle;

        const select = document.createElement('select');
        select.id = id;
        select.disabled = dto.status !== GameStatuses.SETTINGS;

        options.forEach(opt => {
            const option = new Option(opt.t, opt.v);
            if ((opt.v).toString() === currentValue?.toString()) option.selected = true;
            select.append(option);
        });

        select.onmouseenter = () => this.#props.onhover?.() //аналог hover в js

        select.onchange = (e) => {
            this.#props.onselectclick?.();
            this.#props.onchange?.(settingKey, e.target.value);
        };

        container.append(label, select);
        return container;
    };

    render(dto) {
        const settingsContainer = document.createElement('div');
        settingsContainer.classList.add('top-items');
        settingsContainer.id = 'settings';
        const isGameActive = dto.status === GameStatuses.IN_PROGRESS;

        const gridOptions = [{t: '4x4', v: 4}, {t: '5x5', v: 5}, {t: '7x7', v: 7}, {t: '8x8', v: 8}];
        const winOptions = [{t: '10 pts', v: 10}, {t: '20 pts', v: 20}, {t: '30 pts', v: 30}, {t: '40 pts', v: 40}];
        const loseOptions = [{t: '5 pts', v: 5}, {t: '10 pts', v: 10}, {t: '15 pts', v: 15}, {t: '20 pts', v: 20}];
        const intervalOptions = [{t: '1 sec', v: 1000}, {t: '2 sec', v: 2000}, {t: '3 sec', v: 3000}, {
            t: '4 sec',
            v: 4000
        }];

        const pauseButton = document.createElement('button');
        pauseButton.classList.add('pause-button');
        pauseButton.disabled = !isGameActive;
        const pauseIcon = document.createElement('img');

        pauseIcon.src = isGameActive ? 'img/icons/pauseButtonActive.svg' : 'img/icons/pauseButton.svg';
        pauseIcon.alt = 'pause';
        pauseButton.append(pauseIcon);
        pauseButton.onclick = () => {
            this.#props.onpause?.();
        }

        const switchButtonWrapper = document.createElement('div');
        switchButtonWrapper.classList.add('switch-button');
        const switchLabel = document.createElement('label');
        switchLabel.textContent = 'Sound on'

        const toggleButton = document.createElement('button');
        toggleButton.classList.add('toggle')
        if (this.#props.isSoundOn) {
            toggleButton.classList.add('on');
        }
        toggleButton.onclick = () => {
            toggleButton.classList.toggle('on');
            const isNowOn = toggleButton.classList.contains('on'); // true/false
            this.#props.ontogglesound?.(isNowOn);
        }
        const sliderSpan = document.createElement('span');
        sliderSpan.classList.add('icon-slider');
        toggleButton.append(sliderSpan);
        switchButtonWrapper.append(switchLabel, toggleButton);

        settingsContainer.append(
            this.#createOptionLine('Grid size', '01', gridOptions, dto.gridSize.columnsCount, 'gridSize', dto),
            this.#createOptionLine('Points to win', '02', winOptions, dto.pointsToWin, 'pointsToWin', dto),
            this.#createOptionLine('Points to lose', '03', loseOptions, dto.pointsToLose, 'pointsToLose', dto),
            this.#createOptionLine('Google Jump Interval', '04', intervalOptions, dto.googleJumpInterval, 'googleJumpInterval', dto),
            pauseButton,
            switchButtonWrapper
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

        //блок таймера
        const block = document.createElement('div');
        block.classList.add('result-block');
        const titleSpan = document.createElement('span');
        titleSpan.classList.add('result-title');
        titleSpan.textContent = 'Time';
        const scoreSpan = document.createElement('span');
        scoreSpan.classList.add('result');
        scoreSpan.textContent = dto.timer;
        block.append(titleSpan, scoreSpan);

        //отрисовка блоков счета (Player 1, Player 2, Google)
        pointsContainer.append(
            this.#createResultBlock('Player 1', 'img/icons/man01.svg', dto.player1Points),
            this.#createResultBlock('Player 2', 'img/icons/man02.svg', dto.player2Points),
            this.#createResultBlock('Google', 'img/icons/googleIcon.svg', dto.googlePoints),
            block
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
        img.classList.add('result-image');
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
        const isGoogleWinner = dto.status === GameStatuses.LOSE

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
        const winnerName = dto.winner.name
        textModal.textContent = isGoogleWinner ? `You'll be lucky next time` : winnerName;

        const modalResult = document.createElement('div')
        modalResult.classList.add('modal-result')

        const pointsResultBlock = document.createElement('div')
        pointsResultBlock.classList.add('result-block')
        const pointsResultTitle = document.createElement('span')
        pointsResultTitle.classList.add('result-title')
        pointsResultTitle.textContent = 'Catch:'
        const pointsResult = document.createElement('span')
        pointsResult.classList.add('result')
        pointsResult.append(`${dto.winner.points}`)
        pointsResultBlock.append(pointsResultTitle, pointsResult)

        const timeResultBlock = document.createElement('div')
        timeResultBlock.classList.add('result-block')
        const timeResultTitle = document.createElement('span')
        timeResultTitle.classList.add('result-title')
        timeResultTitle.textContent = 'Time:'
        const timeResult = document.createElement('span')
        timeResult.classList.add('result')
        timeResult.append(dto.timer)
        timeResultBlock.append(timeResultTitle, timeResult)

        const buttonPlayAgain = document.createElement('button')
        buttonPlayAgain.classList.add('button', 'play-again-button')
        buttonPlayAgain.textContent = 'Play again'
        buttonPlayAgain.onclick = () => {
            this.#props?.onrestart?.()
        }

        modalResult.append(pointsResultBlock, timeResultBlock)
        modalElements.append(titleModal, textModal, modalResult, buttonPlayAgain)
        Modal.append(ImageWrapper, modalElements)

        return Modal
    }
}

class PauseComponent {
    #props

    constructor(props) {
        this.#props = props;
    }

    render() {
        const pauseContainer = document.createElement('div');
        pauseContainer.classList.add('pause-container');
        pauseContainer.id = 'pause-container';

        const pauseWrapper = document.createElement('div');
        pauseWrapper.classList.add('pause-wrapper');
        pauseContainer.append(pauseWrapper);

        const pauseTitle = document.createElement('h1');
        pauseTitle.classList.add('pause-title');
        pauseTitle.textContent = 'GAME PAUSED';

        const pauseButtonWrapper = document.createElement('div');
        pauseButtonWrapper.classList.add('pause-button-wrapper');

        const resumeButton = document.createElement('button');
        resumeButton.classList.add('pauseBtn', 'resume-button');
        const resumeIcon = document.createElement('img');
        resumeIcon.src = 'img/icons/resumeIcon.svg';
        resumeIcon.alt = 'resumeIcon';
        resumeButton.onclick = () => {
            this.#props?.onresume?.()
        }
        resumeButton.append(resumeIcon, 'RESUME');

        const quitButton = document.createElement('button');
        quitButton.classList.add('pauseBtn', 'quit-button')
        const quitIcon = document.createElement('img');
        quitIcon.src = 'img/icons/quitIcon.svg';
        quitIcon.alt = 'quitIcon';
        quitButton.onclick = () => {
            this.#props?.onrestart?.()
        }
        quitButton.append(quitIcon, 'QUIT');

        pauseButtonWrapper.append(quitButton, resumeButton);

        pauseWrapper.append(pauseTitle, pauseButtonWrapper);
        return pauseContainer;
    }
}

class NoticeComponent {
    #props

    constructor(props) {
        this.#props = props
    }

    render() {
        const noticeContainer = document.createElement('div');
        noticeContainer.classList.add('notice');
        noticeContainer.id = 'notice';

        const noticeIcon = document.createElement('img');
        noticeIcon.src = 'img/icons/info.svg';
        noticeIcon.alt = 'notice';

        const noticeText = document.createElement('p');
        noticeText.classList.add('notice-text');
        noticeText.textContent = 'Control is done with “arrows for player 1” and “WASD for player 2”';

        const noticeButton = document.createElement('button');
        noticeButton.classList.add('notice-button');
        noticeButton.textContent = 'OK';
        noticeButton.onclick = () => {
            noticeContainer.style.display = 'none';
            this.#props?.onclose?.();
        }

        noticeContainer.append(noticeIcon, noticeText, noticeButton);
        return noticeContainer;
    }
}
