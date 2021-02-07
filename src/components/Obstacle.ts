import { Component } from './Component';
import * as THREE from 'three';
import { GameObject } from '../GameObject';
import { SkinInstance, AnimatedSkinInstance } from './SkinInstance';
import { IGameModel } from '../AssetsManager';


export class Obstacle extends Component {

    hitbox: THREE.Mesh;
    skinInstance: AnimatedSkinInstance;
    hitboxVector: THREE.Vector3;

    constructor(gameObject: GameObject, model: IGameModel, x: number, y: number, posX: number, posZ: number) {
        super(gameObject);
        const h = new THREE.PlaneGeometry(x, y);
        h.rotateX(Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        this.hitbox = new THREE.Mesh(h, material);
        this.hitbox.position.set(posX + 2, 0.1, posZ - 2);
        this.skinInstance = gameObject.addComponent(SkinInstance, model);
        this.gameObject.parent.add(this.hitbox);
        this.hitboxVector = new THREE.Vector3(posX + 2, 0, posZ - 2);
    }

}