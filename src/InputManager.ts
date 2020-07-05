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

    constructor(sceneManager: SceneManager, assetsManager: AssetsManager) {
        this.sceneManager = sceneManager;
        this.mouse = new THREE.Vector2();


        window.addEventListener('mousedown', e => {
            console.log(globals.positionOfLastClick);
            TWEEN.removeAll();
            globals.isMouseDown = true;
            let shouldMove = this.calculate(e, true);

            globals.playerRotationNeedsUpdate = true;

            if (shouldMove) {
                globals.playerIsIdle = false;
                globals.player.transform.lookAt(globals.positionOfLastClick);
                globals.distanceBetweenClickAndPlayer = globals.player.transform.position.distanceTo(globals.positionOfLastClick);
                globals.onClickCameraPosition = sceneManager.camera.position;
                //console.log(globals.player.transform.rotation);
            } else {
                globals.player.transform.lookAt(globals.positionOfLastClick);
            }

        })

        window.addEventListener('mouseup', e => {
            console.log('mouseup');
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
            console.log('mouseclick');
        } if (globals.leftButtonHoldTime > 20) {

            globals.isMouseClicked = false;
            globals.isMouseHold = true;
        }

        if (globals.cameraPositionNeedsUpdate) {
        }
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
        //this.cube.translateOnAxis(kForward, distance);
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

    calculatePositionFromClick = (clientX, clientY, mouse, raycaster, camera, scene) => {
        //let mouse: THREE.Vector2 
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObjects(scene.children);

        console.log(intersects[0].object.userData.type);
        if (intersects[0]?.object?.userData?.type !== 'walkable') {
            console.log(intersects[0].point);
            return;
        }
        if (!!intersects && intersects.length !== 0) {
            var test = intersects[0].point;
            return test;
        }
    }


}