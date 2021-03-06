import * as THREE from 'three';
import { GameObject } from './GameObject';
import { Player } from './components/Player'
import { HoldableButton } from './InputManager';

export const removeArrayElement = (array: any[], element: number) => {
    const ndx = array.indexOf(element);
    if (ndx >= 0) {
        array.splice(ndx, 1);
    }
}

class Globals {

    constructor() {
        this.positionOfLastClick = new THREE.Vector3();
        this.leftMouseButton = new HoldableButton();
    }

    leftMouseButton: HoldableButton;

    time: number = 0;
    deltaTime: number = 0;
    positionOfLastClick: THREE.Vector3;
    moveSpeed: number = 16;

    isInventoryMode: boolean = false;

    player: GameObject;

    playerRadius: number = 4;
    playerHitNeedsCalculate = false;
    playerNeedsToHit = false;
    playerIsIdle: boolean = true;
    playerHasCollison: boolean = false;
    playerCollisionNeedUpdate: boolean = false;

    attackTime: number = 0;
    lastAttackAnimatianWas2: boolean = true;

    setPositonOfLastClickVector = (vector: THREE.Vector3) => {
        this.positionOfLastClick.set(vector.x, vector.y, vector.z);
    }

    sounds: THREE.Audio[] = [];

    getPlayerVectorHitbox = () => {
        return (this.player.getComponent(Player) as Player).playerHitVector;
    }

}

export const globals = new Globals();

export const cameraPosition: THREE.Vector3 = new THREE.Vector3(-60, 80, -60);

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
    const dist = obj1?.position?.distanceTo(obj2?.position);
    return dist < minDist;
}
