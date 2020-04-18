import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Raycaster, CubeCamera } from 'three';
import { calculatePositionFromClick } from './MouseClickEvents';
import { globals } from './utils'

export class SceneManager {
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;

    public mount: HTMLDivElement;
    public raycaster: THREE.Raycaster;
    public mouse: THREE.Vector2;
    public cube: THREE.Mesh;


    /**
     *
     */
    constructor(clientWidth: number, clientHeight: number) {
        //const canvas: | HTMLCanvasElement = document.querySelector('#c');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('white');
        this.renderer = new THREE.WebGLRenderer();
        //this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
        this.renderer.physicallyCorrectLights = true;
        this.camera = new THREE.PerspectiveCamera(25, clientWidth / clientHeight, 1, 1000);
        this.camera.position.set(-30, 80, -30);
        this.camera.lookAt(0, 0, 0);

        this.renderer.setSize(clientWidth, clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        //const controls = new OrbitControls(this.camera, this.renderer.domElement);
        //controls.target.set(0, 5, 0);
        //controls.update();


        const col = 0x424f78;
        const i = 20;
        const light = new THREE.SpotLight(col, i);
        light.position.set(0, 10, 0);
        //light.intensity = 1;
        this.scene.add(light);

        this.mount = document.createElement('div');

        var geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        geometry.rotateX(-1.56);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var plain = new THREE.Mesh(geometry, material);
        this.scene.add(plain);


        var geometry2 = new THREE.BoxGeometry(2, 2, 2);
        var material = new THREE.MeshBasicMaterial({ color: 0x00bb00 });
        //this.cube = new THREE.Mesh(geometry2, material);
        //cube.position.set
        //this.scene.add(this.cube);

        //this.camera.lookAt(plain.position);


        document.body.appendChild(this.renderer.domElement)

    }

    public calculate = (e) => {
        const rr = calculatePositionFromClick(e.clientX, e.clientY, this.mouse, this.raycaster, this.camera, this.scene);

        //this.cube.lookAt(rr[0]);
        //const kForward = new THREE.Vector3(0, 0, 1);
        //this.cube.position.set(rr[0][0], rr[0][1], rr[0][2])
        //var distance = this.cube.position.distanceTo(rr[0]);
        globals.setPositonOfLastClickVector(rr[0]);
        //this.cube.translateOnAxis(kForward, distance);
    }

    public calculate2 = (clientX: number, clientY: number) => {
        const rr = calculatePositionFromClick(clientX, clientY, this.mouse, this.raycaster, this.camera, this.scene);
        globals.setPositonOfLastClickVector(rr[0]);
    }

    /*public calculatePositionFromClick = (e: MouseEvent) => {
        //let mouse: THREE.Vector2 
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children);
        if (!!intersects && intersects.length !== 0) {
            let faceIndex = intersects[0].faceIndex;


            let obj = intersects[0].object;
            console.log(obj);
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
        }



    }*/

    public render() {
        this.renderer.render(this.scene, this.camera);
    }

}


