import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { SceneManager } from './SceneManager';
import { globals } from './utils';
import { GameObjectManager, Player, Animal } from './GameObject';
import { InputManager } from './InputManager';
//const TWEEN = require('@tweenjs/tween.js');
import TWEEN from '@tweenjs/tween.js';
import { Children } from 'react';





export interface IGameModel {
    name: string;
    url: string;
    gltf: GLTF;
    animations: Map<any, any>;
    indexInGLTF?: number
}

export interface IGameModelsGroup {
    groupName: string;
    names: string[];
    url: string;
    gltf: GLTF;
    //animations: Map<any, any>;
    //indexInGLTF?: number
}

export interface IAsset {
    name: string;
    model: THREE.Object3D;

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
    assets: IGameModel[] = [];
    objects3d: IAsset[] = [];
    assetsGroups: IGameModelsGroup[] = [];
    loadedModels: THREE.Object3D;
    scene: THREE.Scene;
    //mixers: THREE.AnimationMixer[] = [];
    mixerInfos: IMixerInfo[] = [];
    then: number = 0;
    sceneManager: SceneManager;
    gameObjectManager: GameObjectManager;

    public audioLoader: THREE.AudioLoader;
    public sound: THREE.Audio;
    public sound2: THREE.Audio;
    listener: THREE.AudioListener;


    constructor(scene: THREE.Scene, sceneManager: SceneManager, gameObjectManager: GameObjectManager, inputManager: InputManager) {
        this.manager = new THREE.LoadingManager();
        this.manager.onLoad = this.init;
        this.gltfLoader = new GLTFLoader(this.manager);
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.addModels();
        this.loadModels();
        this.addAssets();
        this.loadAssets();
        this.addAssetsGroups();
        this.loadAssetsGroups();


        this.gameObjectManager = gameObjectManager;

        this.audioLoader = new THREE.AudioLoader();
        //console.log(this.audioLoader);
        this.listener = new THREE.AudioListener();
        this.sceneManager.camera.add(this.listener);
        this.sound = new THREE.Audio(this.listener);
        this.sound2 = new THREE.Audio(this.listener);
    }


    private addAssets = () => {
        this.assets.push(
            this.addGameModel('Wall', 'stonewall.glb'),
            this.addGameModel('Stone1', 'stone1.glb'),
            this.addGameModel('Stone2', 'stone2.glb'),
            this.addGameModel('WallAsset', 'wallasset.glb'),
            //this.addGameModel('Bricks', 'brick.glb')
        )

    }

    private addAssetsGroups = () => {
        this.assetsGroups.push(this.addGameModelWithMultupleMeshes('fence', ['Brick1', 'Brick2'], 'fences.glb'));
        this.assetsGroups.push(this.addGameModelWithMultupleMeshes('walls', ['Doors', 'StonePillar', 'StoneWall', 'Stonewall2'], 'wall2.1.glb'))

    }

    private loadAssets = () => {
        this.assets.forEach(model => {
            this.gltfLoader.load(model.url, (gltf) => { model.gltf = gltf; model.gltf.userData = { namee: 'aaaaaa' } })
        });
    }

    private loadAssetsGroups = () => {
        this.assetsGroups.forEach(group => {
            this.gltfLoader.load(group.url, (gltf) => { group.gltf = gltf; group.gltf.userData = { namee: 'aaaaaa' } })
        })
    }

    //todo create soundsManager
    loadSounds = () => {
        if (this.audioLoader) {
            this.audioLoader.load('Footsteps_Casual_Stone_09.ogg', (buffer) => {
                this.sound.setBuffer(buffer);
                this.sound.setLoop(true);
                this.sound.setVolume(0.5);
                this.sound.playbackRate = 0.4;
                this.sound.pause();
            });

            this.audioLoader.load('Sword-Attack.wav', (buffer) => {
                this.sound2.setBuffer(buffer);
                this.sound2.setLoop(false);
                this.sound2.setVolume(1.5);
                this.sound2.playbackRate = 1.5;
                this.sound2.pause();
            });
        }

        globals.sounds.push(this.sound, this.sound2);

    }

    private addAssetsToScene = () => {

        this.assets.forEach(model => {
            if (model?.gltf?.scene) {
                let m: any = SkeletonUtils.clone(model.gltf.scene);
                m.scale.x = 3;
                m.scale.y = 3;
                m.scale.z = 3;
                this.scene.add(m);
            }

        })
    }

    public addAsset(assetName: string, position: { posX: number, posY: number, posZ: Number }, scales?: { scaleX: number, scaleY: number, scaleZ: Number }, rotates?: number) {
        let asset = this.assets.find(asset => asset.name === assetName);
        if (asset?.gltf?.scene) {
            let clonedAsset: any = SkeletonUtils.clone(asset.gltf.scene);
            //console.log(clonedAsset);
            if (scales) {
                //clonedAsset.scale(scales.scaleX, scales.scaleY, scales.scaleZ);
                clonedAsset.scale.x = scales.scaleX;
                clonedAsset.scale.y = scales.scaleY;
                clonedAsset.scale.z = scales.scaleZ;
            }


            if (rotates) {
                clonedAsset.rotation.set(0, rotates, 0);
            }

            this.scene.add(clonedAsset);
            clonedAsset.position.set(position.posX, position.posY, position.posZ);


        }
    }

    public getAssetFromGroup = (assetGroupName: string,/*assetName: string,*/) => {
        console.log(this.assetsGroups);
        let asset = this.assetsGroups.find(assetGroup => assetGroup.groupName === assetGroupName);
        console.log(asset);
        if (asset?.gltf?.scene?.children && asset?.gltf?.scene?.children.length > 0) {
            console.log(asset.names)
            asset.names.forEach(nameofobj => {
                console.log(nameofobj);
                console.log(nameofobj.trim());
                console.log(asset.gltf.scene.children[0].name);
                let assetForClone = asset.gltf.scene.children.find(model => model.name === nameofobj);
                console.log(assetForClone);
                if (assetForClone) {
                    let clonedAsset: any = SkeletonUtils.clone(assetForClone);
                    this.objects3d.push({ name: assetForClone.name, model: clonedAsset });
                }

            })


            console.log(this.objects3d);

        }

    }

    private addModels = () => {
        this.models.push(
            this.addGameModel('Cow', 'https://threejsfundamentals.org/threejs/resources/models/animals/Cow.gltf'),
            this.addGameModel('Goblin', 'Goblin2.glb'),
            this.addGameModel('Knight', '/i.glb')
        )
    }

    private loadModels = () => {
        this.models.forEach(model => {
            this.gltfLoader.load(model.url, (gltf) => { model.gltf = gltf; model.gltf.userData = { namee: 'aaaaaa' } })
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
                        if (clip.name === 'AttackLeft') {
                            //clip.duration /= 2;
                            //clip.duration /= 4
                        }
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
                        //action.warp(1, 20, 51);
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

        globals.time = now * 0.001;
        globals.deltaTime = Math.min(globals.time - this.then, 1 / 20);

        this.then = globals.time;
        this.gameObjectManager.update();

        if (globals.isMouseDown) {
            globals.leftButtonHoldTime += 1;
        }

        if (globals.leftButtonHoldTime > 1 && globals.leftButtonHoldTime <= 20) {
            globals.isMouseClicked = true;
        } if (globals.leftButtonHoldTime > 20) {

            globals.isMouseClicked = false;
            globals.isMouseHold = true;
        }

        if (globals.cameraPositionNeedsUpdate) {
        }

        this.sceneManager.render();
        requestAnimationFrame(this.render);
    }



    private addGameModel = (name: string, url: string): IGameModel => {
        return { name: name, url: url, gltf: null, animations: new Map<any, any>() }
    }

    /*private addGameModelWithMultupleMeshes = (names: string[], url: string): IGameModel[] => {
        let index: number = 0;
        let models: IGameModel[];
        names.forEach(name => {
            models.push(
                { name: name, url: url, gltf: null, animations: null, indexInGLTF: index })
            index += 1;
        })
        return models;
    }*/

    private addGameModelWithMultupleMeshes = (name: string, names: string[], url: string): IGameModelsGroup => {
        console.log(names);
        return { groupName: name, names: names, url: url, gltf: null }
    }



    public getGameModel = (name: string): IGameModel => {
        return this.models.find(model => model.name === name)
    }

    public AddGoblin = (posX: number, posZ: number) => {
        const gameObject = this.gameObjectManager.createGameObject(this.scene, 'Goblin');
        gameObject.addComponent(Animal, this.getGameModel('Goblin'));

        //tu lezy problem
        gameObject.transform.position.x = posX;
        gameObject.transform.position.z = posZ;

    }

    public addObject3dToScene = (name: string, position: { posX: number, posY: number, posZ: Number }, rotates?: number) => {

        let obj = this.objects3d.find(model => model.name === name);
        if (obj) {
            let clonedObj: any = SkeletonUtils.clone(obj.model);

            if (rotates) {
                clonedObj.rotation.set(0, rotates, 0);
            }

            clonedObj.position.set(position.posX, position.posY, position.posZ);
            this.scene.add(clonedObj);
        }

    }

    public init = () => {
        this.loadAnimations();
        this.loadSounds();
        //this.addAssetsToScene();

        /////////////////////////////////////////////////////
        this.getAssetFromGroup('fence');
        this.getAssetFromGroup('walls');
        this.addObject3dToScene('Brick1', { posX: 50, posY: 0, posZ: 14 });
        this.addObject3dToScene('Brick1', { posX: 50, posY: 0, posZ: -14 });

        this.addObject3dToScene('Brick1', { posX: 68, posY: 0, posZ: 14 });
        this.addObject3dToScene('Brick1', { posX: 68, posY: 0, posZ: -14 });

        this.addObject3dToScene('Brick2', { posX: 55, posY: 3, posZ: 14 });
        this.addObject3dToScene('Brick2', { posX: 55, posY: 3, posZ: -14 });

        this.addObject3dToScene('Brick2', { posX: 55, posY: -3, posZ: 14 });
        this.addObject3dToScene('Brick2', { posX: 55, posY: -3, posZ: -14 });

        this.addObject3dToScene('StonePillar', { posX: 67, posY: -30, posZ: -14 }, Math.PI);


        this.addObject3dToScene('Brick1', { posX: 84, posY: 0, posZ: 14 });
        this.addObject3dToScene('Brick1', { posX: 84, posY: 0, posZ: -14 });

        this.addObject3dToScene('Brick2', { posX: 72, posY: 3, posZ: 14 });
        this.addObject3dToScene('Brick2', { posX: 72, posY: 3, posZ: -14 });

        this.addObject3dToScene('Brick2', { posX: 72, posY: -3, posZ: 14 });
        this.addObject3dToScene('Brick2', { posX: 72, posY: -3, posZ: -14 });

        this.addObject3dToScene('Doors', { posX: 18, posY: 0, posZ: 26 }, Math.PI);

        this.addObject3dToScene('StonePillar', { posX: 2, posY: 0, posZ: 28 }, Math.PI);

        this.addObject3dToScene('StonePillar', { posX: 45, posY: 0, posZ: 28 }, Math.PI);


        this.addObject3dToScene('StoneWall', { posX: -20, posY: 6, posZ: 32 }, Math.PI);

        this.addObject3dToScene('Stonewall2', { posX: 22, posY: 6, posZ: 32 }, Math.PI);


        //['Doors', 'StonePillar', 'StoneWall', 'StoneWall2']

        //this.addAsset('Wall', { posX: 68, posY: 2, posZ: 20 }, { scaleX: 5, scaleY: 2, scaleZ: 3 });
        //this.addAsset('Stone1', { posX: -54, posY: 2, posZ: -44 }, { scaleX: 5, scaleY: 6, scaleZ: 5 });
        //this.addAsset('Stone2', { posX: -15, posY: 2, posZ: -44 }, { scaleX: 4, scaleY: 3, scaleZ: 4 });
        //this.addAsset('Stone1', { posX: -4, posY: 2, posZ: -44 }, { scaleX: 5, scaleY: 6, scaleZ: 5 });
        //this.addAsset('Stone2', { posX: 37, posY: 2, posZ: -44 }, { scaleX: 4, scaleY: 3, scaleZ: 4 });
        //this.addAsset('Stone1', { posX: 45, posY: 2, posZ: -44 }, { scaleX: 5, scaleY: 6, scaleZ: 5 });

        this.addAsset('WallAsset', { posX: 104, posY: -23, posZ: -36 }, { scaleX: 2, scaleY: 4, scaleZ: 4 }, 3 * Math.PI / 2);

        this.addAsset('WallAsset', { posX: 104, posY: -23, posZ: 37 }, { scaleX: -2, scaleY: 4, scaleZ: 4 }, 3 * Math.PI / 2);

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
            globals.player = gameObject;
        }

        const npcModelNames = [

            //'Cow',
            'Goblin'

        ]

        /*npcModelNames.forEach((name, ndx) => {
            const gameObject = this.gameObjectManager.createGameObject(this.scene, name);
            gameObject.addComponent(Animal, this.getGameModel(name));

            //tu lezy problem
            gameObject.transform.position.x = (ndx + 1) * 20;

        })*/

        this.AddGoblin(60, 7);

        this.AddGoblin(30, 7);

        this.AddGoblin(70, 3);


        this.AddGoblin(120, 3);

        this.AddGoblin(160, 3);
        this.AddGoblin(155, -10);
        this.AddGoblin(150, -10);





    }


}

