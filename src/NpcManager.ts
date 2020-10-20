import { Enemy } from './components/Enemy'
import { GameObjectManager } from './GameObject';
import { } from './components/Enemy';
import { AssetsManager } from './AssetsManager';
import { SceneManager } from './SceneManager';
import { globals } from './utils'

export class NpcManager extends GameObjectManager {
    //gameObjects: Enemy[];
    sceneManager: SceneManager;
    assetManager: AssetsManager;

    constructor(sceneManager: SceneManager, assetManager: AssetsManager) {
        super();
        this.sceneManager = sceneManager;
        this.assetManager = assetManager;
    }

    addEnemy = (posX: number, posZ: number) => {
        const gameObject = this.createGameObject(this.sceneManager.scene, 'TestEnemy');
        gameObject.addComponent(Enemy, this.assetManager?.getGameModel('TestEnemy'));
        gameObject.transform.position.x = posX;
        gameObject.transform.position.z = posZ;
    }

    addEnemies = () => {
        //todo prepare enemy factory
        this.addEnemy(2, 2);
        this.addEnemy(3, 3);
    }

    update() {
        this.getEnemiesInPlayerHitArea(globals.positionOfLastClick);
        super.update();
    }

    getEnemiesInPlayerHitArea = (clickArea: THREE.Vector3) => {
        if (!globals.playerHitNeedsCalculate) {
            return;
        }

        this.gameObjects.forEach(gameObject => {
            if (clickArea.distanceTo(gameObject.getComponent(Enemy).gameObject.transform.position) <= 3) {
                globals.playerNeedsToHit = true;
                const c = gameObject.getComponent(Enemy) as Enemy
                c.numberOfLives -= 1;
            }
        })

        globals.playerHitNeedsCalculate = false;
    }

}