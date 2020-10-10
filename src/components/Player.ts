import * as THREE from 'three';
import { FiniteStateMachine } from '../utils';
import { IGameModel } from '../AssetsManager';
import { globals } from '../utils'
import { Vector3 } from 'three';
import { Component } from './Component';
import { SkinInstance } from './SkinInstance';
import { GameObject } from '../GameObject';
import { ButtonState } from '../InputManager'

export class Player extends Component {
    skinInstance: SkinInstance;
    currentPosition: Vector3;
    fsm: FiniteStateMachine;
    kForward = new THREE.Vector3(0, 0, 1);
    transform: THREE.Object3D;
    playerLight: THREE.DirectionalLight;

    constructor(gameObject: GameObject, importedModel: IGameModel) {
        super(gameObject);
        const model = importedModel;
        this.skinInstance = gameObject.addComponent(SkinInstance, model);
        this.transform = gameObject.transform;

        this.currentPosition = this.skinInstance.gameObject.transform.position;

        this.playerLight = new THREE.DirectionalLight(0x629696, 5)
        this.playerLight.position.set(0, 5, 0);



        this.gameObject.parent.add(this.playerLight);

        this.fsm = new FiniteStateMachine({
            idle: {
                enter: () => { this.skinInstance.setAnimation('Idle'); },
                update: () => {
                    if (!globals.playerIsIdle) {

                        this.fsm.transition('run');
                    }
                }
            },

            run: {
                enter: () => { this.skinInstance.setAnimation('Run'); globals.sounds[0].play(); },
                update: () => {

                    this.movePlayerLight();

                    if (globals.playerIsIdle) {
                        this.fsm.transition('idle');
                        globals.sounds[0].pause();
                    }

                    const playerPosition = this.transform.position;

                    if (globals.playerNeedsToHit && playerPosition.distanceTo(globals.positionOfLastClick) < 5) {
                        this.fsm.transition('attack')
                    }

                    if ((globals.positionOfLastClick.distanceTo(playerPosition) > 0.5 || /*globals.isMouseHold*/ globals.leftMouseButton.state === ButtonState.Hold) && !globals.playerIsIdle) {
                        this.transform.translateOnAxis(this.kForward, 16 * globals.deltaTime);
                    } else {
                        globals.playerIsIdle = true;
                    }

                    if (/*globals.isMouseHold*/  globals.leftMouseButton.state === ButtonState.Hold) {
                        this.transform.lookAt(globals.positionOfLastClick.x, 0, globals.positionOfLastClick.z);
                    }

                    if (!globals.playerNeedsToHit && playerPosition.distanceTo(globals.positionOfLastClick) >= 5) {
                        globals.playerNeedsToHit = false;
                    }
                }
            },
            attack: {
                enter: () => {
                    if (globals.lastAttackAnimatianWas2) {
                        this.skinInstance.setAnimation('Attack1', true)
                        globals.lastAttackAnimatianWas2 = false;
                    } else {
                        this.skinInstance.setAnimation('Attack2', true)
                        globals.lastAttackAnimatianWas2 = true;
                    }; /*globals.playerComboLevel = 1;*/ globals.attackTime = 0
                },
                update: () => {
                    globals.attackTime += 1;
                    if (globals.attackTime === 40) {

                        globals.playerNeedsToHit = false;
                        globals.sounds[1].play();

                        //attackTime = 0;
                        this.fsm.transition('idle')
                    }
                }

            },
        }, 'idle')


    }

    update = () => {
        this.fsm.update();
    }

    movePlayerLight = () => {
        this.playerLight.target = this.transform

        const lightTarget = new THREE.Vector3(
            this.transform.position.x,
            5,
            this.transform.position.z);



        let delta = new THREE.Vector3();
        delta.subVectors(lightTarget, this.playerLight.position);
        this.playerLight.position.addVectors(this.playerLight.position, delta);
    }
}