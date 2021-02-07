import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { SceneManager } from './SceneManager';
import { globals } from './utils';
import { GameObjectManager } from './GameObject';
import { NpcManager } from './NpcManager';
import { Player } from './components/Player';
import { Enemy } from './components/Enemy'

import { InputManager } from './InputManager';

export interface IGameModel {
    name: string;
    url: string;
    gltf: GLTF;
    animations: Map<any, any>;
}

export interface IGameModelsGroup {
    groupName: string;
    names: string[];
    url: string;
    gltf: GLTF;
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
    mixerInfos: IMixerInfo[] = [];
    then: number = 0;
    sceneManager: SceneManager;
    gameObjectManager: GameObjectManager;
    npcManager: NpcManager;
    setupNpc: () => void;
    setupObstacles: () => void;
    playerComponent: any;

    public audioLoader: THREE.AudioLoader;
    public sound: THREE.Audio;
    public sound2: THREE.Audio;
    listener: THREE.AudioListener;


    constructor(scene: THREE.Scene, sceneManager: SceneManager, gameObjectManager: GameObjectManager, inputManager: InputManager, npcManager: NpcManager, setupNpc: () => void, setupObstacles: () => void) {
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
        this.setupNpc = setupNpc;
        this.setupObstacles = setupObstacles;


        this.gameObjectManager = gameObjectManager;

        this.audioLoader = new THREE.AudioLoader();
        this.listener = new THREE.AudioListener();
        this.sceneManager.camera.add(this.listener);
        this.sound = new THREE.Audio(this.listener);
        this.sound2 = new THREE.Audio(this.listener);
        this.npcManager = npcManager;
    }


    private addAssets = () => {
        this.assets.push(
            //this.addGameModel('Wall', 'stonewall.glb'),
            this.addGameModel('Barell1', 'barells.glb'),
            //this.addGameModel('Stone2', 'stone2.glb'),
            //this.addGameModel('WallAsset', 'wallasset.glb'),
            //this.addGameModel('Bricks', 'brick.glb')
        )

    }

    private addAssetsGroups = () => {
        this.assetsGroups.push(this.addGameModelWithMultupleMeshes('pixel_assets', ['Ground1', 'Ground1_Walkable', 'Ground2', 'Ground2_Walkable', 'Bridge', 'Bridge_Walkable', 'Terrain1', 'Pillar'], 'pixel_assets2.glb'));
        this.assetsGroups.push(this.addGameModelWithMultupleMeshes('containers', ['Chest1'], 'containers.glb'));

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
            if (scales) {
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
        let asset = this.assetsGroups.find(assetGroup => assetGroup.groupName === assetGroupName);
        if (asset?.gltf?.scene?.children && asset?.gltf?.scene?.children.length > 0) {
            asset.names.forEach(nameofobj => {
                let assetForClone = asset.gltf.scene.children.find(model => model.name === nameofobj);
                if (assetForClone) {
                    let clonedAsset: any = SkeletonUtils.clone(assetForClone);
                    this.objects3d.push({ name: assetForClone.name, model: clonedAsset });
                }
            })
        }

    }

    private addModels = () => {
        this.models.push(
            this.addGameModel('TestEnemy', 'Npc_Enemy.glb'),
            this.addGameModel('Knight', '/Player.glb')
        )
    }

    private loadModels = () => {
        this.models.forEach(model => {
            this.gltfLoader.load(model.url, (gltf) => { model.gltf = gltf; model.gltf.userData = { namee: model.name } })
        });
    }

    private setupEquipmentElements = (model: IGameModel) => {
        const helmet = model.gltf.scene.children[0].children.filter(child => child.name === 'Helmet')[0]
        helmet.visible = false;

        const pickaxe = model.gltf.scene.children[0].children.filter(child => child.name === 'Pickaxe')[0]
        pickaxe.visible = false;

        const armor = model.gltf.scene.children[0].children.filter(child => child.name === 'Armor')[0]
        armor.visible = false;
    }

    private loadAnimations = () => {
        this.models.forEach(model => {
            if (model?.gltf?.animations) {

                //todo prepare better elements initializer
                if (model.name === 'Knight') {
                    this.setupEquipmentElements(model);
                }

                const animsByName = new Map();
                model.gltf.animations.forEach(
                    (clip) => {
                        if (clip.name === 'Attack1') {
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


    private addGameModel = (name: string, url: string): IGameModel => {
        return { name: name, url: url, gltf: null, animations: new Map<any, any>() }
    }

    private addGameModelWithMultupleMeshes = (name: string, names: string[], url: string): IGameModelsGroup => {
        return { groupName: name, names: names, url: url, gltf: null }
    }

    public getGameModel = (name: string): IGameModel => {
        return this.models.find(model => model.name === name)
    }
    public getGameAsset = (name: string): IGameModel => {
        const asset = this.assets.find(model => model.name === name);
        return asset;
    }

    public AddGoblin = (posX: number, posZ: number) => {
        const gameObject = this.gameObjectManager.createGameObject(this.scene, 'Goblin');
        gameObject.addComponent(Enemy, this.getGameModel('Goblin'));
        gameObject.transform.position.x = posX;
        gameObject.transform.position.z = posZ;

    }

    public addObject3dToScene = (name: string, position: { posX: number, posY: number, posZ: Number }, rotates?: number, specialType?: string) => {

        let obj = this.objects3d.find(model => model.name === name);
        if (obj) {
            let clonedObj: any = SkeletonUtils.clone(obj.model);

            if (rotates) {
                clonedObj.rotation.set(0, rotates, 0);
            }

            clonedObj.position.set(position.posX, position.posY, position.posZ);

            clonedObj.userData =
            {
                type: specialType
            }


            this.scene.add(clonedObj);
        }

    }

    public init = () => {
        this.loadAnimations();
        this.loadSounds();
        this.getAssetFromGroup('pixel_assets');
        this.getAssetFromGroup('containers');
        this.addObject3dToScene('Chest1', { posX: 40, posY: 2, posZ: 0 }, Math.PI / -2, 'chest');
        //this.addObject3dToScene('Pillar', { posX: 20, posY: 2, posZ: 0 }, Math.PI / 2);
        this.addObject3dToScene('Ground1_Walkable', { posX: 27, posY: 0, posZ: 0 }, Math.PI / 2, 'walkable');
        this.addObject3dToScene('Ground1', { posX: 27, posY: 0, posZ: 0 }, Math.PI / 2);
        this.addObject3dToScene('Terrain1', { posX: 27, posY: 0, posZ: 0 }, Math.PI / 2);

        this.addObject3dToScene('Ground2_Walkable', { posX: -100, posY: 0, posZ: 0 }, Math.PI / 2, 'walkable');
        this.addObject3dToScene('Ground2', { posX: -100, posY: 0, posZ: 0 }, Math.PI / 2);

        this.addObject3dToScene('Bridge_Walkable', { posX: 27, posY: 0, posZ: 0 }, Math.PI / 2, 'walkable');
        this.addObject3dToScene('Bridge', { posX: 27, posY: 0, posZ: 0 }, Math.PI / 2);
        //this.addObject3dToScene('Walls', { posX: 0, posY: 0, posZ: 0 }, Math.PI / 2, 'walkable');
        this.initPlayer();
        this.setupNpc();
        this.setupObstacles();
        //this.addAssetsToScene();






    }

    public initPlayer = () => {
        //todo move to separated entity
        const gameObject = this.gameObjectManager.createGameObject(this.scene, 'player');
        gameObject.addComponent(Player, this.getGameModel('Knight'));
        globals.player = gameObject;

    }


}

