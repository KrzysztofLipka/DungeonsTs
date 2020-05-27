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


            TWEEN.removeAll();
            globals.tweenNeedsInit = true;
            console.log('mousedown');
            globals.playerIsIdle = false;
            //this.mouseDownTime = new Date()

            globals.isMouseDown = true;
            let shouldMove = sceneManager.calculate(e);

            //const intersect = sceneManager.raycaster.intersectObjects(sceneManager.scene.children);
            //console.log(sceneManager.scene.children);

            /*console.log(intersect[0].object);
            if (intersect.length > 1) {
                console.log('!!!!!!!!!!!');
                console.log(intersect[1].object);

            }*/

            //console.log(intersect);
            globals.playerRotationNeedsUpdate = true;

            globals.holdedMouseClientX = e.clientX;
            globals.holdedMouseClientY = e.clientY;

            const cameraTarget = new THREE.Vector3(
                globals.positionOfLastClick.x - 50,
                80,
                globals.positionOfLastClick.z - 50);

            //let tween = new Tween(sceneManager.camera.position).to(cameraTarget, 2000).start();
            //tween.update();

            //if (globals.playerComboLevel === 1 && globals.attackTime > 50 && globals.attackTime < 150) {
            //    globals.playerComboLevel = 2;
            //}

            if (shouldMove) {

                //globals.player.transform.lookAt(globals.positionOfLastClick);

                const distance = sceneManager.camera.position.distanceTo(cameraTarget);

                const playerDistance = globals.player.transform.position.distanceTo(globals.positionOfLastClick);
                const tw = new TWEEN.Tween(sceneManager.camera.position).to(cameraTarget, 60 * distance)
                    .easing(TWEEN.Easing.Linear.None);


                const tw2 = new TWEEN.Tween(globals.player.transform.position).to(globals.positionOfLastClick, 60 * playerDistance)
                    .easing(TWEEN.Easing.Linear.None);

                tw.onComplete(() => {
                    globals.playerIsIdle = true;
                    console.log('complete');
                    if (globals.isMouseHold === true) {
                        //sceneManager.calculate2(window.screenX, e.screenY);
                        console.log('mousehold');
                        //globals.player.transform.lookAt(globals.positionOfLastClick);
                        //tw.start();
                    }
                })
                tw.start();
                tw2.start();
                globals.player.transform.lookAt(globals.positionOfLastClick);
            } else {
                globals.player.transform.lookAt(globals.positionOfLastClick);
            }








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