import { GameObjectManager } from './GameObject';
import { SceneManager } from './SceneManager';
import { AssetsManager } from './AssetsManager';
import { Obstacle } from './components/Obstacle';
import { globals } from './utils';
import { Player } from './components/Player';
import * as THREE from 'three';


export class CollisionsManager extends GameObjectManager {

    sceneManager: SceneManager;
    assetManager: AssetsManager;
    playerColliderBox: THREE.Mesh;
    isCollision: boolean = false;

    constructor(sceneManager: SceneManager, assetManager: AssetsManager) {
        super();
        this.sceneManager = sceneManager;
        this.assetManager = assetManager;
    }

    public setupCollison = () => {
        const player = globals.player.getComponent(Player) as Player;
        this.playerColliderBox = player.playerHitBox;
        this.addTestCollidableObject(0.5, 0.5, 20, 10);
        this.addTestCollidableObject(0.5, 0.5, 20, -10);
        this.addTestCollidableObject(0.5, 0.5, 20, 0);
    }

    addTestCollidableObject = (sizeX: number, sizeZ: number, posX: number, posZ: number) => {
        const gameObject = this.createGameObject(this.sceneManager.scene, 'Barell1');
        gameObject.addComponent(Obstacle, this.assetManager.getGameAsset('Barell1'), sizeX, sizeZ, posX, posZ);

        gameObject.transform.position.x = posX;
        gameObject.transform.position.z = posZ;
    }

    getHitbox = (obstacle: Obstacle) => {
        return obstacle.hitbox.geometry as THREE.PlaneGeometry;
    }

    update() {
        const playerCollider = this.playerColliderBox?.geometry as THREE.Geometry;
        if (playerCollider?.vertices) {
            this.gameObjects.forEach(obstacle => {
                const ob = obstacle.getComponent(Obstacle) as Obstacle;
                if ((globals.getPlayerVectorHitbox().x <= ob.hitboxVector.x + 2
                    && globals.getPlayerVectorHitbox().x + 2 >= ob.hitboxVector.x) &&
                    (globals.getPlayerVectorHitbox().z <= ob.hitboxVector.z + 2
                        && globals.getPlayerVectorHitbox().z + 2 >= ob.hitboxVector.z)
                ) {
                    if (globals.playerCollisionNeedUpdate) { globals.playerHasCollison = true };
                    globals.playerCollisionNeedUpdate = true;
                }
            });
        }
        super.update();
    }
}