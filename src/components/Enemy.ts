import * as THREE from 'three';
import { FiniteStateMachine, isClose } from '../utils';
import { IGameModel } from '../AssetsManager';
import { globals } from '../utils'
import { Component } from './Component';
import { SkinInstance } from './SkinInstance';
import { GameObject } from '../GameObject';

export class Enemy extends Component {
    name: string = 'test';
    followRadius: number = 20;
    hitRadius: number = 1;
    fsm: FiniteStateMachine;
    skinInstance: SkinInstance;
    maxTurnSpeed = Math.PI * (globals.moveSpeed / 4);
    transform: THREE.Object3D;
    kForward = new THREE.Vector3(0, 0, 1);

    //todo implement stats
    numberOfLives: number;

    constructor(gameObject: GameObject, model: IGameModel) {
        super(gameObject);
        this.numberOfLives = 5;
        this.skinInstance = gameObject.addComponent(SkinInstance, model);
        this.skinInstance.mixer.timeScale = globals.moveSpeed / 4;
        const playerTransform = globals.player?.transform;
        //Todo refractor
        //const transform = gameObject?.transform;
        this.transform = gameObject?.transform;

        let updateOffset = 0;

        //todo refractor and split animation and ai
        this.fsm = new FiniteStateMachine({
            idle: {
                enter: () => {
                    this.skinInstance.setAnimation('Idle');
                },
                update: () => {
                    // check if player is near
                    if (isClose(this.transform, this.followRadius, playerTransform, globals.playerRadius)) {
                        this.fsm.transition('followPlayer');
                    }
                },
            },
            followPlayer: {
                enter: () => {
                    this.skinInstance.setAnimation('Run'); this.transform.lookAt(playerTransform.position);
                },
                update: () => {
                    updateOffset += 1;

                    if (updateOffset === 1) {
                        this.transform.lookAt(playerTransform.position);
                        this.transform.translateOnAxis(this.kForward, 6 * globals.deltaTime);

                        if (isClose(this.transform, this.hitRadius, playerTransform, globals.playerRadius)) {
                            this.fsm.transition('attack');
                            updateOffset = 0;
                        }
                        updateOffset = 0;
                    }

                }
            },
            attack: {
                enter: () => {
                    this.skinInstance.setAnimation('Attack');
                }, update: () => {
                    updateOffset += 1;
                    if (updateOffset === 200) {
                        if (isClose(this.transform, this.hitRadius, playerTransform, globals.playerRadius)) {
                            this.transform.lookAt(playerTransform.position);
                        } else {
                            this.fsm.transition('followPlayer');
                        }
                        updateOffset = 0;
                    }

                    if (this.numberOfLives < 0) {
                        this.fsm.transition('dead');
                    }
                }
            }, dead: {
                enter: () => { this.skinInstance.setAnimation('Death', true) },
                update: () => { }
            }
        }, 'idle')
    }

    update() {
        if (this.skinInstance && this.fsm) {
            this.fsm.update();
        }

    }
}