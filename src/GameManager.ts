import { SceneManager } from './SceneManager';
import { AssetsManager } from './AssetsManager';
import { GameObjectManager } from './GameObject';
import { InputManager } from './InputManager'
import { globals } from './utils'

export class GameManager {
    public sceneManager: SceneManager;
    public assetsManager: AssetsManager;
    public gameObjectsManager: GameObjectManager;
    public inputManager: InputManager;
    public then: number = 0;

    constructor(innerWidth: number, innerHeight: number, setOpenUi: (open: boolean) => void) {
        this.gameObjectsManager = new GameObjectManager();
        this.sceneManager = new SceneManager(innerWidth, innerHeight);
        this.assetsManager = new AssetsManager(this.sceneManager.scene, this.sceneManager, this.gameObjectsManager, this.inputManager);
        this.inputManager = new InputManager(this.sceneManager, this.assetsManager, setOpenUi);
    }

    private render = (now: number) => {
        globals.time = now * 0.001;
        globals.deltaTime = Math.min(globals.time - this.then, 1 / 20);

        this.then = globals.time;
        this.gameObjectsManager.update();

        this.sceneManager.render();
        requestAnimationFrame(this.render);
        this.inputManager.update();
    }

    public init = () => {
        this.assetsManager.init();
        requestAnimationFrame(this.render);
    }

}

//export default new GameManager();