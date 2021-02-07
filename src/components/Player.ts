import * as THREE from 'three';
import { FiniteStateMachine } from '../utils';
import { IGameModel } from '../AssetsManager';
import { globals } from '../utils'
import { Vector3 } from 'three';
import { Component } from './Component';
import { SkinInstance, AnimatedSkinInstance } from './SkinInstance';
import { GameObject } from '../GameObject';
import { ButtonState } from '../InputManager'

export class Player extends Component {
    skinInstance: AnimatedSkinInstance;
    currentPosition: Vector3;
    fsm: FiniteStateMachine;
    kForward = new THREE.Vector3(0, 0, 1);
    kBackward = new THREE.Vector3(0, 0, -1);
    transform: THREE.Object3D;
    playerLight: THREE.PointLight;
    playerHitBox: THREE.Mesh;
    playerHitVector: THREE.Vector3;

    previousPosition: THREE.Vector3;
    previousPositionUpdateCounter: number = 0;

    constructor(gameObject: GameObject, importedModel: IGameModel) {
        super(gameObject);
        const model = importedModel;
        this.skinInstance = gameObject.addComponent(AnimatedSkinInstance, model);
        this.transform = gameObject.transform;
        const geom = new THREE.PlaneGeometry(0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        this.playerHitBox = new THREE.Mesh(geom, material);

        this.playerHitVector = new THREE.Vector3(4, 0, -2);

        this.currentPosition = this.skinInstance.gameObject.transform.position;
        this.previousPosition = this.skinInstance.gameObject.transform.position;

        this.playerLight = new THREE.PointLight(0x629696, 45, 155)
        this.playerLight.position.set(0, 40, 0);
        this.playerHitBox.position.set(2, 0.1, -2);
        this.gameObject.parent.add(this.playerLight);
        this.gameObject.parent.add(this.playerHitBox);

        //todo refractor
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

                    this.movePlayerLightAndHitbox();

                    if (globals.playerIsIdle) {
                        this.fsm.transition('idle');
                        globals.sounds[0].pause();
                        return;
                    }

                    const playerPosition = this.transform.position;

                    if (globals.playerNeedsToHit && playerPosition.distanceTo(globals.positionOfLastClick) < 5) {
                        this.fsm.transition('attack')
                    }

                    if ((globals.positionOfLastClick.distanceTo(playerPosition) > 0.5 || globals.leftMouseButton.state === ButtonState.Hold)) {
                        if (!globals.playerHasCollison) {
                            this.transform.translateOnAxis(this.kForward, 16 * globals.deltaTime);
                            globals.playerHasCollison = false;
                        } else {
                            //globals.playerHasCollison = false;
                            let delta = new THREE.Vector3();
                            delta.subVectors(this.previousPosition, this.transform.position);
                            this.transform.position.addVectors(this.transform.position, delta);
                            console.log('ccc');
                            //this.fsm.transition('idle');
                            globals.playerIsIdle = true;
                            globals.playerHasCollison = false;
                            globals.playerCollisionNeedUpdate = false;


                        }

                    } else {
                        globals.playerIsIdle = true;
                        //globals.playerHasCollison = false;
                    }

                    if (globals.leftMouseButton.state === ButtonState.Hold) {
                        this.transform.lookAt(globals.positionOfLastClick.x, 0, globals.positionOfLastClick.z);
                    }

                    if (!globals.playerNeedsToHit && playerPosition.distanceTo(globals.positionOfLastClick) >= 5) {
                        globals.playerNeedsToHit = false;
                    }

                    globals.playerHasCollison = false;
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
                    }; globals.attackTime = 0
                },
                update: () => {
                    globals.attackTime += 1;
                    if (globals.attackTime >= 40) {

                        globals.playerNeedsToHit = false;
                        globals.sounds[1].play();
                        this.fsm.transition('idle');
                    }
                }

            },
        }, 'idle')
    }

    update = () => {

        this.previousPositionUpdateCounter += 1;
        if (this.previousPositionUpdateCounter >= 10) {
            if (!globals.playerHasCollison) {
                this.previousPosition = this.currentPosition.clone();
            }
            this.previousPositionUpdateCounter = 0;
        }

        this.fsm.update();
    }

    movePlayerLightAndHitbox = () => {
        const lightTarget = new THREE.Vector3(
            this.transform.position.x,
            5,
            this.transform.position.z);
        let delta = new THREE.Vector3();
        delta.subVectors(lightTarget, this.playerLight.position);
        this.playerLight.position.addVectors(this.playerLight.position, delta);
        const t = this.playerHitBox.position.clone();
        t.addVectors(this.playerLight.position, delta);
        this.playerHitBox.position.x = t.x + 2;
        this.playerHitBox.position.z = t.z - 2;
        this.playerHitVector.x = t.x + 2;
        this.playerHitVector.z = t.z - 2;
    }
}