import {Controller} from "./controller.js";
import {View} from "./view.js";
import {GameProxy} from "./game-proxy.js";


//composition root
const view = new View();
// const numberUtil = new ShogunNumberUtility()
const game = new GameProxy();

const controller = new Controller(view, game);

const intervalId = setInterval(()=>{
    if(game.initialized()){
        controller.init();
        clearInterval(intervalId);
    }
}, 100)
