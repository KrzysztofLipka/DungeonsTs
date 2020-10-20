import { SceneManager } from './SceneManager';
import { AssetsManager } from './AssetsManager';
import { GameObjectManager } from './GameObject';
import { NpcManager } from './NpcManager';
import { InputManager } from './InputManager'
import { globals } from './utils'

export class GameManager {
    public sceneManager: SceneManager;
    public assetsManager: AssetsManager;
    public gameObjectsManager: GameObjectManager;
    public npcManager: NpcManager;
    public inputManager: InputManager;
    public then: number = 0;

    constructor(innerWidth: number, innerHeight: number, setOpenUi: (open: boolean) => void) {
        this.gameObjectsManager = new GameObjectManager();
        this.sceneManager = new SceneManager(innerWidth, innerHeight);
        this.assetsManager = new AssetsManager(this.sceneManager.scene, this.sceneManager, this.gameObjectsManager, this.inputManager, this.npcManager, () => this.npcManager.addEnemies());
        this.inputManager = new InputManager(this.sceneManager, this.assetsManager, setOpenUi);
        this.npcManager = new NpcManager(this.sceneManager, this.assetsManager);
    }

    private render = (now: number) => {
        globals.time = now * 0.001;
        globals.deltaTime = Math.min(globals.time - this.then, 1 / 20);

        this.then = globals.time;

        this.gameObjectsManager.update();
        this.npcManager.update();
        this.sceneManager.render();
        requestAnimationFrame(this.render);
        this.inputManager.update();
    }

    public init = () => {
        this.assetsManager.init();
        this.npcManager.addEnemy(60, 7);
        this.npcManager.addEnemy(1, 1);
        requestAnimationFrame(this.render);
    }
}
