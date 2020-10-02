import { globals } from './utils';
import { SceneManager } from './SceneManager';
import { AssetsManager } from './AssetsManager';

import * as THREE from 'three';
//const TWEEN = require('@tweenjs/tween.js');
import TWEEN from '@tweenjs/tween.js';

export class InputManager {

    mouseDownTime: Date = new Date();
    mouseUpTime: Date = new Date();
    sceneManager: SceneManager;
    public mouse: THREE.Vector2;
    assetsManager: AssetsManager;

    public onChestClick: (open: boolean) => void

    constructor(sceneManager: SceneManager, assetsManager: AssetsManager, setOpenUi: (show: boolean) => void) {
        this.sceneManager = sceneManager;
        this.mouse = new THREE.Vector2();
        this.onChestClick = setOpenUi;
        this.assetsManager = assetsManager;

        window.addEventListener('mousedown', e => {
            if (globals.isInventoryMode) {
                return;
            }

            TWEEN.removeAll();
            globals.isMouseDown = true;
            let shouldMove = this.calculate(e, true);
            if (shouldMove) {
                globals.playerIsIdle = false;
                globals.player.transform.lookAt(globals.positionOfLastClick);
            } else {
                globals.player.transform.lookAt(globals.positionOfLastClick);
            }

        })


        window.addEventListener('keydown', (e) => {
            if (e.key === 'f') {

            }

            if (!e.repeat)
                console.log(`Key "${e.key}" pressed  [event: keydown]`);
            else
                console.log(`Key "${e.key}" repeating  [event: keydown]`);
        });

        window.addEventListener('mouseup', e => {
            globals.isMouseDown = false;
            if (globals.isMouseHold) {
                globals.playerIsIdle = true;
            }

            //globals.isMouseClicked = false;
            globals.isMouseHold = false;
            globals.leftButtonHoldTime = 0;

        })

        window.addEventListener('mousemove', e => {
            if (globals.isMouseHold) {
                this.calculate(e);

            }
        })
    }

    update = () => {
        if (globals.isMouseDown) {
            globals.leftButtonHoldTime += 1;
        }

        if (globals.leftButtonHoldTime > 1 && globals.leftButtonHoldTime <= 20) {
            globals.isMouseClicked = true;
        } if (globals.leftButtonHoldTime > 20) {

            globals.isMouseClicked = false;
            globals.isMouseHold = true;
        }

        //if (globals.cameraPositionNeedsUpdate) {
        //}
    }

    //todo refractor and use mousehold for moving
    public calculate = (e, updateArea: boolean = false) => {
        const clickTarget = this.calculatePositionFromClick(
            e.clientX, e.clientY,
            this.mouse, this.sceneManager.raycaster,
            this.sceneManager.camera, this.sceneManager.scene);
        if (!clickTarget) {
            return false;
        }
        globals.setPositonOfLastClickVector(clickTarget);

        if (updateArea && this.calculateIfElementOfSceneInClickArea(clickTarget, 3)) {
            globals.playerHitNeedsCalculate = true;
            globals.playerNeedsToHit = true;
        }

        return !!clickTarget;
    }

    calculateIfElementOfSceneInClickArea(clickVector: THREE.Vector3, area: number): boolean {
        let i: number;
        for (i = 0; i < this.sceneManager.scene.children.length; i++) {
            if (this.sceneManager.scene.children[i].name === 'goblin'
                && this.sceneManager.scene.children[i].position.distanceTo(clickVector) < area) {
                return true;
            }
        }
        return false;

    }

    calculatePositionFromClick = (clientX: number, clientY: number, mouse, raycaster: THREE.Raycaster, camera: THREE.Camera, scene: THREE.Scene) => {
        //let mouse: THREE.Vector2 
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObjects(scene.children);

        // todo make chest as entity
        if (intersects[0]?.object?.userData?.type === 'chest') {
            globals.isInventoryMode = true;
            this.onChestClick(true);
        }

        if (intersects[0]?.object?.userData?.type !== 'walkable') {
            return;
        }

        if (!!intersects && intersects.length !== 0) {
            var test = intersects[0].point;
            return test;
        }
    }
}