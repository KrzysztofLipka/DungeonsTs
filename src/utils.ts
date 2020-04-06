import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

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

export const globals = {
    time: 0,
    deltaTime: 0,
};