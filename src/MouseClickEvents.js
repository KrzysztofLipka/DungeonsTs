import * as THREE from 'three';

const TWEEN = require('@tweenjs/tween.js');


export const calculatePositionFromClick = (clientX, clientY, mouse, raycaster, camera, scene) => {
    //let mouse: THREE.Vector2 
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);
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

        if (faceIndex % 2 == 0) {
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
        var cameratarget = new THREE.Vector3(target.x - 30, 80, target.z - 30);

        return [target, cameratarget];
    }





}
