import { GameObject } from '../GameObject';

export interface IComponent {
    gameObject: GameObject;
}

export abstract class Component implements IComponent {
    gameObject: GameObject
    constructor(gameObject) {
        this.gameObject = gameObject;

    }
    update() {

    }
}