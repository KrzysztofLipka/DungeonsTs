import * as THREE from 'three';
import { removeArrayElement, SafeArray, FiniteStateMachine, isClose } from './utils';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { IGameModel } from './AssetsManager';
import { globals } from './utils'
import { Vector3 } from 'three';
import TWEEN from '@tweenjs/tween.js';

export class GameObject {
    name: string;
    components: Component[];
    transform: THREE.Object3D;
    id: string;
    constructor(parent: THREE.Scene, name) {
        this.name = name;
        this.components = [];
        this.transform = new THREE.Object3D();
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
            this.animRoot.name = 'fffffh';
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

            if (animName === 'AttackRight' || animName === 'AttackLeft') {
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
    attack: any;
    fsm: FiniteStateMachine;
    kForward = new THREE.Vector3(0, 0, 1);

    constructor(gameObject: GameObject, importedModel: IGameModel) {
        super(gameObject);
        const model = importedModel;
        this.skinInstance = gameObject.addComponent(SkinInstance, model);

        this.currentPosition = this.skinInstance.gameObject.transform.position;
        this.attack = () => {
            this.skinInstance.setAnimation('AttackLeft');
        }

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

                    if (globals.playerIsIdle) {
                        this.fsm.transition('idle');
                        globals.sounds[0].pause();
                    }

                    if (globals.playerNeedsToHit && this.skinInstance.gameObject.transform.position.distanceTo(globals.positionOfLastClick) < 5) {

                        this.fsm.transition('attack')


                    }

                    if (!globals.playerNeedsToHit && this.skinInstance.gameObject.transform.position.distanceTo(globals.positionOfLastClick) >= 5) {
                        globals.playerNeedsToHit = false;
                    }
                }
            },
            attack: {
                enter: () => {
                    if (globals.lastAtackDirectionWasLeft) {
                        this.skinInstance.setAnimation('AttackLeft', true)
                        globals.lastAtackDirectionWasLeft = false;
                    } else {
                        this.skinInstance.setAnimation('AttackRight', true)
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

        this.fsm.update();

    }


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
