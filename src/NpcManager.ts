import { Enemy } from './components/Enemy'
import { GameObjectManager } from './GameObject';
import { } from './components/Enemy';
import { AssetsManager } from './AssetsManager';
import { SceneManager } from './SceneManager';

export class NpcManager extends GameObjectManager {
    //gameObjects: Enemy[];
    sceneManager: SceneManager;
    assetManager: AssetsManager;

    constructor(sceneManager: SceneManager, assetManager: AssetsManager) {
        super();
        this.sceneManager = sceneManager;
        this.assetManager = assetManager;
        //this.addEnemy(2, 2);
        //this.addEnemy(3, 3);
    }

    addEnemy = (posX: number, posZ: number) => {
        const gameObject = this.createGameObject(this.sceneManager.scene, 'Goblin');
        gameObject.addComponent(Enemy, this.assetManager?.getGameModel('Goblin'));
        console.log(this.assetManager.getGameModel('Goblin'));
        console.log(gameObject);
        gameObject.transform.position.x = posX;
        gameObject.transform.position.z = posZ;
    }

    addEnemies = () => {
        this.addEnemy(2, 2);
        this.addEnemy(3, 3);
    }

    update() {
        super.update();
    }

    getEnemiesInPlayerHitArea = (clickArea: THREE.Vector3) => {
        this.gameObjects.forEach(gameObject => {
            if (clickArea.distanceTo(gameObject.getComponent(Enemy).gameObject.transform.position) <= 4) {
                console.log('testt');
            }
        })
    }

}