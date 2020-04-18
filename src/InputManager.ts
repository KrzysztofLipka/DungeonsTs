import { globals } from './utils';
import { SceneManager } from './SceneManager';
import { AssetsManager } from './AssetsManager';
import * as THREE from 'three';
//const TWEEN = require('@tweenjs/tween.js');
import TWEEN from '@tweenjs/tween.js';


export class InputManager {

    /**
     *
     */
    mouseDownTime: Date = new Date();
    mouseUpTime: Date = new Date();

    //holdedMouseClientX = 0;
    //holdedMouseClientY = 0;





    constructor(sceneManager: SceneManager, assetsManager: AssetsManager) {

        /*window.addEventListener('mousemove', (e) => {
            if (globals.isMouseHold) {
                console.log('targetUpdate');
                globals.playerRotationNeedsUpdate = true;
                sceneManager.calculate2(e.clientX, e.clientY);


            }
        })*/

        /*window.addEventListener('click', (e) => {
            sceneManager.calculate(e);
            console.log('click');
            globals.playerRotationNeedsUpdate = true;
        })*/

        window.addEventListener('mousedown', e => {
            //TWEEN.tween.stop();
            console.log('mousedown');
            //this.mouseDownTime = new Date()

            globals.isMouseDown = true;
            sceneManager.calculate(e);
            globals.playerRotationNeedsUpdate = true;

            globals.holdedMouseClientX = e.clientX;
            globals.holdedMouseClientY = e.clientY;

            const cameraTarget = new THREE.Vector3(
                globals.positionOfLastClick.x - 30,
                80,
                globals.positionOfLastClick.z - 30);

            //let tween = new Tween(sceneManager.camera.position).to(cameraTarget, 2000).start();
            //tween.update();

            const distance = sceneManager.camera.position.distanceTo(cameraTarget);
            const tw = new TWEEN.Tween(sceneManager.camera.position).to(cameraTarget, 60 * distance)
                .easing(TWEEN.Easing.Linear.None);

            tw.onComplete(() => {
                console.log('complete');
                if (globals.isMouseHold === true) {
                    //sceneManager.calculate2(window.screenX, e.screenY);
                    console.log('mousehold');
                    //tw.start();
                }
            })
            tw.start();






        })

        window.addEventListener('mouseup', e => {
            console.log('mouseup');
            globals.isMouseDown = false;
            //globals.isMouseClicked = false;
            globals.isMouseHold = false;
            globals.leftButtonHoldTime = 0;

            //globals.playerPositionNeedsUpdate = true;
            //console.log(globals.leftButtonHoldTime);

            //this.mouseUpTime = new Date();
            //let i = this.mouseUpTime.getMilliseconds();
            //let j = this.mouseDownTime.getMilliseconds();
            //console.log(i - j);
        })
    }


}