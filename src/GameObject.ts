import * as THREE from 'three';
import { removeArrayElement } from './utils';
import { SkinInstance, AnimatedSkinInstance } from './components/SkinInstance';
import { Component, IComponent } from './components/Component';

export interface IGameObject {
    name: string;
    update(): void;
}

//Todo Implement better ECS
export class GameObject implements IGameObject {
    name: string;
    components: Component[];
    transform: THREE.Object3D;
    id: string;
    parent: THREE.Scene;
    constructor(parent: THREE.Scene, name) {
        this.name = name;
        this.components = [];
        this.transform = new THREE.Object3D();
        this.parent = parent;
        if (name === 'player') {
            this.transform.name = 'player';

        }

        if (name === 'TestEnemy') {
            this.transform.name = 'Enemy';
        }
        parent.add(this.transform);

    }
    addComponent(ComponentType, ...args: any[]) {
        const component = new ComponentType(this, ...args);
        this.components.push(component);
        return component;
    }
    removeComponent(component) {
        removeArrayElement(this.components, component);
    }
    getComponent(ComponentType): IComponent {
        return this.components.find(c => c instanceof ComponentType);
    }
    update() {
        for (const component of this.components) {
            component.update();
        }
    }
}

export class GameObjectManager {
    gameObjects: GameObject[];

    constructor() {
        this.gameObjects = [];
    }
    createGameObject(parent, name) {
        const gameObject = new GameObject(parent, name);
        this.gameObjects.push(gameObject);
        return gameObject;
    }

    update() {
        this.gameObjects.forEach(gameObject => gameObject.update());
        //globals.playerHitNeedsCalculate = false;
    }
    get gameObjectsArray() {
        return this.gameObjects
    }

    getSkinInstance(obj: any) {
        return obj.components.find(obj => obj instanceof AnimatedSkinInstance)
    }
}

