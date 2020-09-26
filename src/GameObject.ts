import * as THREE from 'three';
import { removeArrayElement, SafeArray, FiniteStateMachine, isClose } from './utils';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { IGameModel } from './AssetsManager';
import { globals } from './utils'
import { Vector3, Color } from 'three';
import TWEEN from '@tweenjs/tween.js';
import { threadId } from 'worker_threads';

export class GameObject {
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

        if (name === 'Goblin') {
            this.transform.name = 'goblin';
        }



        parent.add(this.transform);

        //todo
    }
    addComponent(ComponentType, ...args) {
        const component = new ComponentType(this, ...args);
        //if (ComponentType == SkinnedMesh) {
        //}
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
    //id: string;

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
        globals.playerHitNeedsCalculate = false;
        TWEEN.update();
    }

}


class SkinInstance extends Component {
    model: IGameModel;
    animRoot: any;
    mixer: any;
    actions: Map<any, any>;

    constructor(gameObject: GameObject, model: IGameModel) {
        super(gameObject);
        this.model = model;
        if (model?.gltf?.scene) {
            this.animRoot = SkeletonUtils.clone(model.gltf.scene);

        }

        this.mixer = new THREE.AnimationMixer(this.animRoot);
        gameObject.transform.add(this.animRoot);
        this.actions = new Map();
        this.loadActions();
    }

    loadActions = () => {

        this.model.animations.forEach(clip => {

            const action = this.mixer.clipAction(clip);
            action.enabled = false;
            //action.setEffectiveWeight(4);
            this.actions.set(clip.name, action);

        })

    }


    setAnimation = (animName, playonce?: boolean) => {
        //console.log(this.actions);
        if (this.actions.get(animName)) {
            //const clip: THREE.AnimationClip = this.model.animations.get(animName);
            // turn off all current actions
            this.actions.forEach((action) => {
                action.enabled = false;
            })

            const act = this.actions.get(animName);

            if (playonce) { act.reset(); act.setLoop(1, 1); act.clampWhenFinished = true; }
            act.enabled = true;


            // todo setup in blender
            if (animName === 'Attack2' || animName === 'Attack1') {
                act.setEffectiveTimeScale(6)
            }

            if ((animName === 'Run') && this.model.name === 'Goblin') {

                act.setEffectiveTimeScale(0.5)
            }

            if ((animName === 'Run') && this.model.name !== 'Goblin') {

                act.setEffectiveTimeScale(1.4)
            }


            if ((animName === 'Attack') && this.model.name === 'Goblin') {

                act.setEffectiveTimeScale(0.4)
            }
            act.play();

        }
    }
    update() {
        this.mixer.update(globals.deltaTime);
    }
}

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
                enter: () => { this.skinInstance.setAnimation('Idle'); /*globals.player.transform.lookAt(globals.positionOfLastClick);*/ },
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

                    if (globals.playerNeedsToHit && this.skinInstance.gameObject.transform.position.distanceTo(globals.positionOfLastClick) < 5) {
                        this.fsm.transition('attack')
                    }

                    if ((globals.positionOfLastClick.distanceTo(this.transform.position) > 0.5 || globals.isMouseHold) && !globals.playerIsIdle) {
                        //console.log(16 * globals.deltaTime);
                        this.transform.translateOnAxis(this.kForward, 16 * globals.deltaTime);



                        //this.playerLight.lookAt(globals.positionOfLastClick.x, 0, globals.positionOfLastClick.z);
                        //this.playerLight.translateOnAxis(this.kForward2, 16 * globals.deltaTime);
                    } else {
                        globals.playerIsIdle = true;
                        console.log(this.transform);
                    }

                    if (globals.isMouseHold) {
                        this.transform.lookAt(globals.positionOfLastClick.x, 0, globals.positionOfLastClick.z);
                        //this.playerLight.lookAt(this.transform.position.x, 0, this.transform.position.z);
                        //this.playerLight.translateOnAxis(this.kForward2, 16 * globals.deltaTime);
                    }

                    if (!globals.playerNeedsToHit && this.skinInstance.gameObject.transform.position.distanceTo(globals.positionOfLastClick) >= 5) {
                        globals.playerNeedsToHit = false;
                    }
                }
            },
            attack: {
                enter: () => {
                    if (globals.lastAtackDirectionWasLeft) {
                        this.skinInstance.setAnimation('Attack1', true)
                        globals.lastAtackDirectionWasLeft = false;
                    } else {
                        this.skinInstance.setAnimation('Attack2', true)
                        globals.lastAtackDirectionWasLeft = true;
                    }; /*globals.playerComboLevel = 1;*/ globals.attackTime = 0
                },
                update: () => {
                    globals.attackTime += 1;
                    if (globals.attackTime === 40) {

                        globals.playerNeedsToHit = false;
                        console.log('player is attacking');
                        globals.sounds[1].play();

                        //attackTime = 0;
                        this.fsm.transition('idle')
                    }


                }


            },
        }, 'idle')


    }

    update = () => {
        if (globals.playerRotationNeedsUpdate) {
            //this.skinInstance.gameObject.transform.lookAt(globals.positionOfLastClick);
        }

        //this.transform.translateOnAxis()
        /*if ((globals.positionOfLastClick.distanceTo(this.transform.position) > 0.5 || globals.isMouseHold) && !globals.playerIsIdle) {
            //console.log(16 * globals.deltaTime);
            this.transform.translateOnAxis(this.kForward, 16 * globals.deltaTime);
        } else {
            this.fsm.transition('idle');
        }

        if (globals.isMouseHold) {
            this.transform.lookAt(globals.positionOfLastClick);
        }*/



        this.fsm.update();

    }

    movePlayerLight = () => {

        //this.playerLight.lookAt(this.transform.position.x, this.transform.position.y, this.transform.position.z);
        this.playerLight.target = this.transform


        const lightTarget = new THREE.Vector3(
            this.transform.position.x,
            5,
            this.transform.position.z);



        let delta = new THREE.Vector3();
        delta.subVectors(lightTarget, this.playerLight.position);
        this.playerLight.position.addVectors(this.playerLight.position, delta);
    }

    /*private moveCamera = () => {
        const cameraTarget = new THREE.Vector3(
            globals.player.transform.position.x - 50,
            80,
            globals.player.transform.position.z - 50);

        let delta = new THREE.Vector3();
        delta.subVectors(cameraTarget, this.camera.position);
        this.camera.position.addVectors(this.camera.position, delta);
    }*/


}

export class Enemy extends Component {
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
        const playerTransform = globals.player.transform;
        //Todo refractor
        const transform = gameObject.transform;
        this.transform = gameObject.transform;

        let updateOffset = 0;

        this.fsm = new FiniteStateMachine({
            idle: {
                enter: () => {
                    this.skinInstance.setAnimation('Idle');
                },
                update: () => {
                    // check if player is near
                    if (isClose(transform, this.followRadius, playerTransform, globals.playerRadius)) {
                        this.fsm.transition('followPlayer');
                    }
                },
            },
            followPlayer: {
                enter: () => {
                    this.skinInstance.setAnimation('Run'); transform.lookAt(playerTransform.position);
                },
                update: () => {
                    updateOffset += 1;

                    if (updateOffset === 1) {
                        transform.lookAt(playerTransform.position);
                        transform.translateOnAxis(this.kForward, 6 * globals.deltaTime);

                        if (isClose(transform, this.hitRadius, playerTransform, globals.playerRadius)) {
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
                        if (isClose(transform, this.hitRadius, playerTransform, globals.playerRadius)) {
                            transform.lookAt(playerTransform.position);
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

        if (globals.playerHitNeedsCalculate && globals.positionOfLastClick.distanceTo(this.transform.position) <= 3) {
            this.numberOfLives -= 1;
            console.log(this.skinInstance.gameObject.name + 'Mob has' + this.numberOfLives + 'lives')
        }
    }
}
