import * as THREE from 'three';
import { IGameModel } from './AssetsManager'

export class SceneManager {
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;

    public mount: HTMLDivElement;
    public raycaster: THREE.Raycaster;
    //public mouse: THREE.Vector2;
    public cube: THREE.Mesh;
    public assets: IGameModel[];

    constructor(clientWidth: number, clientHeight: number) {
        //const canvas: | HTMLCanvasElement = document.querySelector('#c');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('black');
        //const canvas: any = document.querySelector('#c');
        this.renderer = new THREE.WebGLRenderer(/*{ canvas, alpha: true }*/);
        //this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
        this.renderer.physicallyCorrectLights = true;
        this.camera = new THREE.PerspectiveCamera(25, clientWidth / clientHeight, 1, 1000);
        this.camera.position.set(-50, 80, -50);
        this.camera.lookAt(0, 0, 0);

        this.renderer.setSize(clientWidth, clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.raycaster = new THREE.Raycaster();

        // this.mouse = new THREE.Vector2();


        const col = 0x9ba9b0
        const i = 9;
        const light = new THREE.AmbientLight(col, i);
        light.position.set(0, 20, 0);
        //light.intensity = 1;
        this.scene.add(light);

        const color = 0x2d496b;  // white
        const near = 85.6;
        const far = 140;
        this.scene.fog = new THREE.Fog(color, near, far);


        const light2 = new THREE.PointLight(0x9ba9b0, 1000);
        //light2.lookAt(180, -40, 0);
        light2.position.set(140, -20, -55);
        this.scene.add(light2);

        this.mount = document.createElement('div');

        var texture = new THREE.TextureLoader().load("tiles2.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);

        var woodTexture = new THREE.TextureLoader().load("bricks.jpg");
        woodTexture.wrapS = THREE.RepeatWrapping;
        woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(6, 2);

        var material2 = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });

        var woodMaterial = new THREE.MeshPhongMaterial({ map: woodTexture, side: THREE.DoubleSide });


        var geometry = new THREE.PlaneGeometry(100, 60, 50, 50);
        geometry.rotateX(-1.56);
        var plain = new THREE.Mesh(geometry, material2);
        this.scene.add(plain);

        var geometry3 = new THREE.PlaneGeometry(100, 90, 50, 50);
        geometry3.translate(137, 0, 0);
        geometry3.rotateX(-1.56);
        var plain2 = new THREE.Mesh(geometry3, material2);

        this.scene.add(plain2);

        var geometry2 = new THREE.PlaneGeometry(37, 30, 50, 20);
        geometry2.translate(68.5, 0, 0);

        geometry2.rotateX(-1.56);
        var bridge = new THREE.Mesh(geometry2, woodMaterial);
        this.scene.add(bridge);


        var worldTexture = new THREE.TextureLoader().load("background.jpg");
        var worldgeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
        worldgeometry.translate(0, -100, -100)
        worldgeometry.rotateX(-1.56);
        var worldmaterial = new THREE.MeshPhongMaterial({ map: worldTexture, side: THREE.DoubleSide });
        var worldplane = new THREE.Mesh(worldgeometry, worldmaterial);

        this.scene.add(worldplane);

        document.body.appendChild(this.renderer.domElement)

    }

    public render() {
        this.renderer.render(this.scene, this.camera);
    }

}


