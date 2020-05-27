import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { AssetsManager } from './AssetsManager';
import { GameObjectManager } from './GameObject';
import { InputManager } from './InputManager'

export class GameManager {
    public clock: THREE.Clock;
    public time: number;
    public deltaTime: number;
    public sceneManager: SceneManager;
    public assetsManager: AssetsManager;
    public gameObjectsManager: GameObjectManager;
    public inputManager: InputManager;

    constructor(innerWidth: number, innerHeight: number) {
        this.clock = new THREE.Clock();
        this.gameObjectsManager = new GameObjectManager();
        this.sceneManager = new SceneManager(innerWidth, innerHeight);
        this.assetsManager = new AssetsManager(this.sceneManager.scene, this.sceneManager, this.gameObjectsManager, this.inputManager);
        this.inputManager = new InputManager(this.sceneManager, this.assetsManager);
        //this.assetsManager.init();
    }

}

//export default new GameManager();