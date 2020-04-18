import * as THREE from 'three';
import { removeArrayElement, SafeArray } from './utils';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { IGameModel } from './AssetsManager';
import { globals } from './utils'
import { Vector3 } from 'three';
import TWEEN from '@tweenjs/tween.js';

export class GameObject {
    name: string;
    components: Component[];
    transform: THREE.Object3D;
    constructor(parent: THREE.Scene, name) {
        this.name = name;
        this.components = [];
        this.transform = new THREE.Object3D();
        parent.add(this.transform);
    }
    addComponent(ComponentType, ...args) {
        const component = new ComponentType(this, ...args);
        this.components.push(component);
        return component;
    }
    removeComponent(component) {
        removeArrayElement(this.components, component);
    }
    getComponent(ComponentType) {
        return this.components.find(c => c instanceof ComponentType);
    }
    update() {
        for (const component of this.components) {
            component.update();
        }
    }
}

class Factory {
    create<T>(type: (new () => T)): T {
        return new type();
    }
}
const factory = new Factory();


export class Component {
    gameObject: GameObject

    constructor(gameObject) {
        this.gameObject = gameObject;
    }
    update() {

    }
}


export class GameObjectManager {
    gameObjects: SafeArray;

    constructor() {
        this.gameObjects = new SafeArray();
    }
    createGameObject(parent, name) {
        const gameObject = new GameObject(parent, name);
        this.gameObjects.add(gameObject);
        return gameObject;
    }
    removeGameObject(gameObject) {
        this.gameObjects.remove(gameObject);
    }
    update() {
        this.gameObjects.forEach(gameObject => gameObject.update());
        TWEEN.update();
    }

}


class SkinInstance extends Component {
    model: IGameModel;
    animRoot: any;
    mixer: any;
    actions: Map<any, any>;

    constructor(gameObject: GameObject, model: IGameModel) {
        super(gameObject);
        this.model = model;
        if (model?.gltf?.scene) {
            this.animRoot = SkeletonUtils.clone(model.gltf.scene);
        }

        this.mixer = new THREE.AnimationMixer(this.animRoot);
        gameObject.transform.add(this.animRoot);
        this.actions = new Map();
    }
    setAnimation(animName) {
        if (this.model.animations.get(animName)) {
            const clip: THREE.AnimationClip = this.model.animations.get(animName);
            // turn off all current actions
            this.actions.forEach((action) => {
                action.enabled = false;
            })

            //for (const action of Object.values(this.actions)) {
            //    action.enabled = false;
            //}
            // get or create existing action for clip
            const action = this.mixer.clipAction(clip);
            action.enabled = true;
            action.reset();
            action.play();
            this.actions.set(action.name, action);
        }
    }
    update() {
        this.mixer.update(globals.deltaTime);
    }
}

const kForward = new THREE.Vector3(0, 0, 1);

export class Player extends Component {
    skinInstance: SkinInstance;
    currentPosition: Vector3;

    constructor(gameObject: GameObject, importedModel: IGameModel) {
        super(gameObject);
        const model = importedModel;
        this.skinInstance = gameObject.addComponent(SkinInstance, model);

        this.skinInstance.setAnimation('Run');
        this.currentPosition = this.skinInstance.gameObject.transform.position;
    }

    update() {
        if (globals.playerRotationNeedsUpdate) {
            this.skinInstance.gameObject.transform.lookAt(globals.positionOfLastClick);
        }

        if (globals.isMouseClicked && this.skinInstance.gameObject.transform.position.distanceTo(globals.positionOfLastClick) > 0.5) {
            this.skinInstance.gameObject.transform.translateOnAxis(kForward, 16 * globals.deltaTime);
            globals.cameraPositionNeedsUpdate = true;
        }

        if (globals.isMouseHold && this.skinInstance.gameObject.transform.position.distanceTo(globals.positionOfLastClick) > 0.5) {
            //console.log(this.skinInstance.gameObject.transform.position.distanceTo(globals.positionOfLastClick));
            this.skinInstance.gameObject.transform.translateOnAxis(kForward, 16 * globals.deltaTime);
        }

        /*if (globals.playerPositionNeedsUpdate) {
            //globals.positionOfLastClick = this.skinInstance.gameObject.transform.position;
            //globals.playerPositionNeedsUpdate = false;
        }*/

    }


}

export class Animal extends Component {
    constructor(gameObject, model) {
        super(gameObject);
        const skinInstance = gameObject.addComponent(SkinInstance, model);
        skinInstance.mixer.timeScale = globals.moveSpeed / 4;
        skinInstance.setAnimation('Idle');
    }
}