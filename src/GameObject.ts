import * as THREE from 'three';
import { removeArrayElement, SafeArray } from './utils';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { IGameModel } from './AssetsManager';
import { globals } from './utils'

export class GameObject {
    name: string;
    components: any[];
    transform: THREE.Object3D;
    constructor(parent, name) {
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
    }
}


class SkinInstance extends Component {
    model: any;
    animRoot: any;
    mixer: any;
    actions: Map<any, any>;

    constructor(gameObject: GameObject, model: any) {
        super(gameObject);
        this.model = model;
        this.animRoot = SkeletonUtils.clone(this.model.gltf.scene);
        this.mixer = new THREE.AnimationMixer(this.animRoot);
        gameObject.transform.add(this.animRoot);
        this.actions = new Map();;
    }
    setAnimation(animName) {
        const clip = this.model.animations[animName];
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
        this.actions[animName] = action;
    }
    update() {
        this.mixer.update(globals.deltaTime);
    }
}


export class Player extends Component {
    skinInstance: any;
    constructor(gameObject: GameObject, importedModel: IGameModel) {
        super(gameObject);
        const model = importedModel;
        this.skinInstance = gameObject.addComponent(SkinInstance, model);
        this.skinInstance.setAnimation('Run');
    }
}