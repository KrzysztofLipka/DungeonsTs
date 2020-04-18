import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { SceneManager } from './SceneManager';
import { globals } from './utils';
import { GameObjectManager, Player, Animal } from './GameObject';
import { InputManager } from './InputManager';
//const TWEEN = require('@tweenjs/tween.js');
import TWEEN from '@tweenjs/tween.js';




export interface IGameModel {
    name: string;
    url: string;
    gltf: GLTF;
    animations: Map<any, any>;
}

interface IMixerInfo {
    mixer: THREE.AnimationMixer;
    actions: THREE.AnimationAction[];
    actionNdx: number;
}

interface IAnims {
    name: string,
    clip: any
}

export class AssetsManager {
    manager: THREE.LoadingManager;
    gltfLoader: GLTFLoader;
    models: IGameModel[] = [];
    loadedModels: THREE.Object3D;
    scene: THREE.Scene;
    //mixers: THREE.AnimationMixer[] = [];
    mixerInfos: IMixerInfo[] = [];
    then: number = 0;
    sceneManager: SceneManager;
    gameObjectManager: GameObjectManager

    constructor(scene: THREE.Scene, sceneManager: SceneManager, gameObjectManager: GameObjectManager, inputManager: InputManager) {
        this.manager = new THREE.LoadingManager();
        this.manager.onLoad = this.init;
        this.gltfLoader = new GLTFLoader(this.manager);
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.addModels();
        this.loadModels();
        this.gameObjectManager = gameObjectManager;
    }

    private addModels = () => {
        this.models.push(
            this.addGameModel('Cow', 'https://threejsfundamentals.org/threejs/resources/models/animals/Cow.gltf'),
            this.addGameModel('Pig', 'https://threejsfundamentals.org/threejs/resources/models/animals/Pig.gltf'),
            this.addGameModel('Knight', 'https://threejsfundamentals.org/threejs/resources/models/knight/KnightCharacter.gltf')
        )
    }

    private loadModels = () => {
        this.models.forEach(model => {
            this.gltfLoader.load(model.url, (gltf) => { model.gltf = gltf })
        });
    }


    getRoot(n: number): THREE.Object3D | THREE.Skeleton {
        if (n === 0) {
            return new THREE.Object3D();
        } if (n === 1) {
            return new THREE.Skeleton(null, null);
        }
    }

    private loadAnimations = () => {
        this.models.forEach(model => {
            if (model?.gltf?.animations) {
                const animsByName = new Map();
                model.gltf.animations.forEach(
                    (clip) => {
                        animsByName.set(clip.name, clip);
                    }
                )
                model.animations = animsByName;

            }

        })

        this.models.forEach(model => {
            if (model?.gltf?.animations) {
                const m = model.gltf.scene;
                //const clonedScene = SkeletonUtils.clone(model.gltf.scene);
                //const cloned = model.gltf.scene.clone()
                //const root = new THREE.Object3D();
                //root.add(cloned);
                //this.scene.add(m);
                //root.position.x = (8 - 3) * 3;
                if (model.animations) {
                    const mixer = new THREE.AnimationMixer(model.gltf.scene);
                    const actions: THREE.AnimationAction[] = [];
                    model.animations.forEach((clip) => {
                        const action = mixer.clipAction(clip);
                        actions.push(action);
                    })

                    const mixerInfo: IMixerInfo = {
                        mixer,
                        actions,
                        actionNdx: -1
                    }

                    this.mixerInfos.push(mixerInfo);
                }

            }

        })

    }

    playNextAction = (mixerInfo) => {
        const { actions, actionNdx } = mixerInfo;
        const nextActionNdx = (actionNdx + 1) % actions.length;
        mixerInfo.actionNdx = nextActionNdx;
        actions.forEach((action, ndx) => {
            const enabled = ndx === nextActionNdx;
            action.enabled = enabled;
            if (enabled) {
                action.play();
            }
        });
    }


    private render = (now) => {

        //now *= 0.001;
        //const deltaTime = now - this.then;
        globals.time = now * 0.001;
        globals.deltaTime = Math.min(globals.time - this.then, 1 / 20);


        //this.then = now;

        this.then = globals.time;
        //@todo replace
        //this.mixerInfos.forEach(mixer => {
        //    mixer.mixer.update(globals.deltaTime);
        //});

        this.gameObjectManager.update();

        if (globals.isMouseDown) {
            globals.leftButtonHoldTime += 1;
        }

        if (globals.leftButtonHoldTime > 1 && globals.leftButtonHoldTime <= 20) {
            //console.log('mouseclickevent');
            globals.isMouseClicked = true;
        } if (globals.leftButtonHoldTime > 20) {
            //console.log('mouseholdEvent');
            //this.sceneManager.calculate2(globals.holdedMouseClientX, globals.holdedMouseClientY)
            globals.isMouseClicked = false;
            globals.isMouseHold = true;
        }

        if (globals.cameraPositionNeedsUpdate) {
            //this.sceneManager.camera.translateOnAxis();
        }

        this.sceneManager.render();
        requestAnimationFrame(this.render);
    }



    private addGameModel = (name: string, url: string): IGameModel => {
        return { name: name, url: url, gltf: null, animations: new Map<any, any>() }
    }

    public getGameModel = (name: string): IGameModel => {
        return this.models.find(model => model.name === name)
    }

    public init = () => {
        this.loadAnimations();
        requestAnimationFrame(this.render);
        //////////////////
        window.addEventListener('keydown', (e) => {
            const mixerInfo = this.mixerInfos[e.keyCode - 49];
            if (!mixerInfo) {
                return;
            }
            //this.playNextAction(mixerInfo);
        });



        //window.addEventListener('click', (e) => {
        //    this.sceneManager.calculate(e);
        //    globals.playerRotationNeedsUpdate = true;
        //})
        ///////////
        {
            const gameObject = this.gameObjectManager.createGameObject(this.scene, 'player');
            gameObject.addComponent(Player, this.getGameModel('Knight'));
        }

        const npcModelNames = [
            'Cow',
            'Pig'
        ]

        npcModelNames.forEach((name, ndx) => {
            const gameObject = this.gameObjectManager.createGameObject(this.scene, name);
            gameObject.addComponent(Animal, this.getGameModel(name));
            gameObject.transform.position.x = (ndx + 1) * 5;

        })

    }


}

