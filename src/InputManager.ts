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
            TWEEN.removeAll();
            globals.isMouseDown = true;
            let shouldMove = this.calculate(e);

            globals.playerRotationNeedsUpdate = true;

            const cameraTarget = new THREE.Vector3(
                globals.positionOfLastClick.x - 50,
                80,
                globals.positionOfLastClick.z - 50);

            if (shouldMove) {

                globals.playerIsIdle = false;
                const distance = sceneManager.camera.position.distanceTo(cameraTarget);

                const playerDistance = globals.player.transform.position.distanceTo(globals.positionOfLastClick);
                const tw = new TWEEN.Tween(sceneManager.camera.position).to(cameraTarget, 60 * distance)
                    .easing(TWEEN.Easing.Linear.None);


                const tw2 = new TWEEN.Tween(globals.player.transform.position).to(globals.positionOfLastClick, 60 * playerDistance)
                    .easing(TWEEN.Easing.Linear.None);

                tw.onComplete(() => {
                    globals.playerIsIdle = true;

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
            console.log('mousehold');
        }

        if (globals.cameraPositionNeedsUpdate) {
        }
    }

    public calculate = (e) => {
        const clickTarget = this.calculatePositionFromClick(
            e.clientX, e.clientY,
            this.mouse, this.sceneManager.raycaster,
            this.sceneManager.camera, this.sceneManager.scene);
        globals.setPositonOfLastClickVector(clickTarget);

        if (this.calculateIfElementOfSceneInClickArea(clickTarget, 3)) {
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
        console.log(intersects);
        if (!!intersects && intersects.length !== 0) {
            let faceIndex = intersects[0].faceIndex;
            let obj = intersects[0].object;
            var geom = obj.geometry;
            var faces = obj.geometry.faces;
            var facesIndices = ["a", "b", "c"];
            var verts = [];
            var x_values = [];
            var z_values = [];
            var x_sum = 0;
            var z_sum = 0;

            if (faceIndex % 2 === 0) {
                faceIndex = faceIndex + 1;
            } else {
                faceIndex = faceIndex - 1;
            }
            facesIndices.forEach(function (indices) {
                verts.push(geom.vertices[faces[faceIndex][indices]])
                if (!x_values.includes(geom.vertices[faces[faceIndex][indices]].x)) {
                    x_values.push(geom.vertices[faces[faceIndex][indices]].x);
                    x_sum += geom.vertices[faces[faceIndex][indices]].x;

                }

                if (!z_values.includes(geom.vertices[faces[faceIndex][indices]].z)) {
                    z_values.push(geom.vertices[faces[faceIndex][indices]].z);
                    z_sum += geom.vertices[faces[faceIndex][indices]].z;
                }

            });
            geom.verticesNeedUpdate = true;

            var target = new THREE.Vector3(x_sum / 2, 0, z_sum / 2);
            return target;
        }
    }


}