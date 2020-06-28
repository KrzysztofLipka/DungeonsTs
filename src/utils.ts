import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { GameObject } from './GameObject';

//todo use that instead of ShinnedMesh Clonning
export const cloneGltf = (gltf): GLTF => {
    const clone = {
        animations: gltf.animations,
        scene: gltf.scene.clone(true),
        scenes: [],
        cameras: [],
        asset: {},
        parser: null,
        userData: null
    };

    const skinnedMeshes = {};

    gltf.scene.traverse(node => {
        if (node.isSkinnedMesh) {
            skinnedMeshes[node.name] = node;
        }
    });

    const cloneBones = {};
    const cloneSkinnedMeshes = {};

    clone.scene.traverse(node => {
        if (node.isBone) {
            cloneBones[node.name] = node;
        }

        if (node.isSkinnedMesh) {
            cloneSkinnedMeshes[node.name] = node;
        }
    });

    for (let name in skinnedMeshes) {
        const skinnedMesh = skinnedMeshes[name];
        const skeleton = skinnedMesh.skeleton;
        const cloneSkinnedMesh = cloneSkinnedMeshes[name];

        const orderedCloneBones = [];

        for (let i = 0; i < skeleton.bones.length; ++i) {
            const cloneBone = cloneBones[skeleton.bones[i].name];
            orderedCloneBones.push(cloneBone);
        }

        cloneSkinnedMesh.bind(
            new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
            cloneSkinnedMesh.matrixWorld);
    }

    return clone;
}

export const removeArrayElement = (array: any[], element: number) => {
    const ndx = array.indexOf(element);
    if (ndx >= 0) {
        array.splice(ndx, 1);
    }
}


export class SafeArray {
    array: any[];
    addQueue = [];
    removeQueue: Set<any>;

    constructor() {
        this.array = [];
        this.addQueue = [];
        this.removeQueue = new Set();
    }
    get isEmpty() {
        return this.addQueue.length + this.array.length > 0;
    }
    add(element) {
        this.addQueue.push(element);
    }
    remove(element) {
        this.removeQueue.add(element);
    }
    get(name: string) {
        return this.array.find(element => element.name = name);
    }
    forEach(fn) {
        this._addQueued();
        this._removeQueued();
        for (const element of this.array) {
            if (this.removeQueue.has(element)) {
                continue;
            }
            fn(element);
        }
        this._removeQueued();
    }
    _addQueued() {
        if (this.addQueue.length) {
            this.array.splice(this.array.length, 0, ...this.addQueue);
            this.addQueue = [];
        }
    }
    _removeQueued() {
        if (this.removeQueue.size) {
            this.array = this.array.filter(element => !this.removeQueue.has(element));
            this.removeQueue.clear();
        }
    }
}


class Globals {

    constructor() {
        this.positionOfLastClick = new THREE.Vector3();
    }

    time: number = 0;
    deltaTime: number = 0;
    positionOfLastClick: THREE.Vector3;
    playerRotationNeedsUpdate: boolean = false;
    moveSpeed: number = 16;

    isMouseDown: boolean = false;
    leftButtonHoldTime: number = 0;


    isMouseClicked: boolean = false;
    isMouseHold: boolean = false;

    cameraPositionNeedsUpdate: boolean = false;
    player: GameObject
    playerRadius: number = 4;

    playerHitNeedsCalculate = false;

    playerNeedsToHit = false;

    playerIsIdle: boolean = true;

    //playerComboLevel: number = 0;
    attackTime: number = 0;
    lastAtackDirectionWasLeft: boolean = true;


    setPositonOfLastClickVector = (vector: THREE.Vector3) => {
        this.positionOfLastClick.set(vector.x, vector.y, vector.z);
    }

    sounds: THREE.Audio[] = [];



}

export const globals = new Globals();

export interface IState {
    stateName: string;
    enter: () => void;
    update: () => void;
    exit?: () => void;
}

export class FiniteStateMachine {
    states: any[];
    currentState: any;
    constructor(states, initialState) {
        this.states = states;
        this.transition(initialState);
    }
    get state() {
        return this.currentState;
    }
    transition(state) {
        const oldState = this.states[this.currentState];
        if (oldState && oldState.exit) {
            oldState.exit.call(this);
        }
        this.currentState = state;
        const newState = this.states[state];
        if (newState.enter) {
            newState.enter.call(this);
        }
    }
    update() {
        const state = this.states[this.currentState];
        if (state.update) {
            state.update.call(this);
        }
    }
}

export function isClose(obj1, obj1Radius, obj2, obj2Radius) {
    const minDist = obj1Radius + obj2Radius;
    const dist = obj1.position.distanceTo(obj2.position);
    return dist < minDist;
}
