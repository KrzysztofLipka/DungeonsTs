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

    public audioLoader: THREE.AudioLoader;
    public sound: THREE.Audio;
    public sound2: THREE.Audio;
    listener: THREE.AudioListener;


    constructor(scene: THREE.Scene, sceneManager: SceneManager, gameObjectManager: GameObjectManager, inputManager: InputManager, npcManager: NpcManager, setupNpc: () => void) {
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
            this.addGameModel('Wall', 'stonewall.glb'),
            this.addGameModel('Stone1', 'stone1.glb'),
            this.addGameModel('Stone2', 'stone2.glb'),
            this.addGameModel('WallAsset', 'wallasset.glb'),
            //this.addGameModel('Bricks', 'brick.glb')
        )

    }

    private addAssetsGroups = () => {
        this.assetsGroups.push(this.addGameModelWithMultupleMeshes('fence', ['Brick1', 'Brick2'], 'fences.glb'));
        this.assetsGroups.push(this.addGameModelWithMultupleMeshes('walls',
            ['Doors', 'StonePillar',
                'StoneWall', 'Stonewall2',
                'Floor', 'StoneFloor',
                'Chest', 'WoodFloor', 'BridgeTop', 'BridgeBottom'],
            'wall2.4.glb'))

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
            this.addGameModel('Cow', 'https://threejsfundamentals.org/threejs/resources/models/animals/Cow.gltf'),
            this.addGameModel('Goblin', 'Goblin2.glb'),
            this.addGameModel('Knight', '/ne6.glb')
        )
    }

    private loadModels = () => {
        this.models.forEach(model => {
            this.gltfLoader.load(model.url, (gltf) => { model.gltf = gltf; model.gltf.userData = { namee: model.name } })
        });
    }

    private loadAnimations = () => {
        this.models.forEach(model => {
            if (model?.gltf?.animations) {

                if (model.name === 'Knight') {
                    const player = model.gltf.scene.children[0].children.filter(child => child.name === 'Player')[0] as THREE.Mesh;

                    if (player.material instanceof THREE.MeshStandardMaterial) {
                        player.material.flatShading = false;
                        player.material.opacity = 1000;
                        player.material.roughness = 1000;
                        player.material.polygonOffset = true;
                        //player.material.metalness = 0.8;
                        player.material.skinning = true;
                        player.castShadow = true;
                        player.material.vertexTangents = true;

                    }

                    const helmet = model.gltf.scene.children[0].children.filter(child => child.name === 'Helmet')[0]
                    helmet.visible = false;

                    const pickaxe = model.gltf.scene.children[0].children.filter(child => child.name === 'Pickaxe')[0]
                    pickaxe.visible = false;

                    const armor = model.gltf.scene.children[0].children.filter(child => child.name === 'Armor')[0]
                    armor.visible = false;
                }

                if (model.name === 'Goblin') {
                    model.gltf.userData = { test: 'ffff' }
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
        //this.addAssetsToScene();

        /////////////////////////////////////////////////////
        this.getAssetFromGroup('fence');
        this.getAssetFromGroup('walls');

        this.addObject3dToScene('Floor', { posX: 0, posY: 0, posZ: 0 }, Math.PI, 'walkable');

        this.addObject3dToScene('StoneFloor', { posX: 65, posY: -5, posZ: 0 }, Math.PI, 'walkable');

        this.addObject3dToScene('WoodFloor', { posX: 48, posY: -1, posZ: 0 }, Math.PI, 'walkable');

        this.addObject3dToScene('Chest', { posX: 0, posY: 2, posZ: 10 }, Math.PI, 'chest');

        this.addObject3dToScene('BridgeTop', { posX: 27, posY: -3, posZ: 0 }, Math.PI / 2, 'walkable');

        this.addObject3dToScene('BridgeBottom', { posX: 27, posY: -3, posZ: 1 }, Math.PI / 2);



        const gameObject = this.gameObjectManager.createGameObject(this.scene, 'player');
        gameObject.addComponent(Player, this.getGameModel('Knight'));
        globals.player = gameObject;

        //this.npcManager.addEnemy(1, 1);

        //this.AddGoblin(60, 7);
        this.setupNpc();

        //this.AddGoblin(60, 8);
        //this.AddGoblin(70, 3);
        //this.AddGoblin(120, 3);
        //this.AddGoblin(160, 3);
        //this.AddGoblin(155, -10);
        //this.AddGoblin(150, -10);

    }


}

