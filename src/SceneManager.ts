import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;

    public mount: HTMLDivElement;


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
        this.camera = new THREE.PerspectiveCamera(25, clientWidth / clientHeight, 1, 100);
        this.camera.position.set(0, 20, 40);
        console.log(clientWidth, clientHeight);
        this.renderer.setSize(clientWidth, clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.target.set(0, 5, 0);
        controls.update();


        const col = 0x424f78;
        const i = 20;
        const light = new THREE.SpotLight(col, i);
        light.position.set(0, 10, 0);
        //light.intensity = 1;
        this.scene.add(light);

        this.mount = document.createElement('div');

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);


        document.body.appendChild(this.renderer.domElement)

    }

    public render() {
        this.renderer.render(this.scene, this.camera);
    }

}


