import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { AssetsManager } from './AssetsManager';
import { GameObjectManager } from './GameObject'

export class GameManager {
    public clock: THREE.Clock;
    public time: number;
    public deltaTime: number;
    public sceneManager: SceneManager;
    public assetsManager: AssetsManager;
    public gameObjectsManager: GameObjectManager;

    constructor(innerWidth: number, innerHeight: number) {
        this.clock = new THREE.Clock();
        this.gameObjectsManager = new GameObjectManager();
        this.sceneManager = new SceneManager(innerWidth, innerHeight);
        this.assetsManager = new AssetsManager(this.sceneManager.scene, this.sceneManager, this.gameObjectsManager);
        //this.assetsManager.init();

    }

}

//export default new GameManager();