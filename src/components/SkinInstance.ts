import { GameObject } from "../GameObject";
import { Component } from './Component'
import { IGameModel } from '../AssetsManager'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import { globals } from '../utils';




export class SkinInstance extends Component {
    model: IGameModel;
    animRoot: THREE.Object3D;


    constructor(gameObject: GameObject, model: IGameModel) {
        super(gameObject);
        this.model = model;
        if (model?.gltf?.scene) {
            this.animRoot = SkeletonUtils.clone(model.gltf.scene) as THREE.Object3D;
        }
        gameObject.transform.add(this.animRoot);
    }
}

export class AnimatedSkinInstance extends SkinInstance {

    mixer: any;
    actions: Map<any, any>;
    constructor(gameObject: GameObject, model: IGameModel) {
        super(gameObject, model);

        this.mixer = new THREE.AnimationMixer(this.animRoot);

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

        if (this.actions.get(animName)) {
            this.actions.forEach((action) => {
                action.enabled = false;
            })

            const act = this.actions.get(animName);

            if (playonce) { act.reset(); act.setLoop(1, 1); act.clampWhenFinished = true; }
            act.enabled = true;


            // todo setup in blender
            if (animName === 'Attack2' || animName === 'Attack1') {
                act.setEffectiveTimeScale(1)
            }

            if ((animName === 'Run') && this.model.name === 'TestEnemy') {

                act.setEffectiveTimeScale(0.5)
            }

            if ((animName === 'Run') && this.model.name !== 'TestEnemy') {

                act.setEffectiveTimeScale(1.4)
            }


            if ((animName === 'Attack') && this.model.name === 'TestEnemy') {

                act.setEffectiveTimeScale(0.4)
            }
            act.play();

        }
    }
    update() {
        this.mixer.update(globals.deltaTime);
    }
}