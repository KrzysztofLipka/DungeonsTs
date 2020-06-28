import * as THREE from 'three';
import { IGameModel } from './AssetsManager';

export class SceneManager {
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;

    public mount: HTMLDivElement;
    public raycaster: THREE.Raycaster;
    //public mouse: THREE.Vector2;
    public cube: THREE.Mesh;
    public assets: IGameModel[];

    private setupCamera = (clientWidth: number, clientHeight: number) => {
        this.camera = new THREE.PerspectiveCamera(25, clientWidth / clientHeight, 1, 1000);
        this.camera.position.set(-50, 80, -50);
        this.camera.lookAt(0, 0, 0);
    }

    private setupRenderer = (clientWidth: number, clientHeight: number) => {
        this.renderer = new THREE.WebGLRenderer(/*{ canvas, alpha: true }*/);
        this.renderer.gammaFactor = 2.2;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.setSize(clientWidth, clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    private setupLights = () => {
        const col = 0x9ba9b0
        const i = 9;
        const light = new THREE.AmbientLight(col, i);
        light.position.set(0, 20, 0);
        //light.intensity = 1;
        this.scene.add(light);

        const light2 = new THREE.PointLight(0x9ba9b0, 1000);
        //light2.lookAt(180, -40, 0);
        light2.position.set(140, -20, -55);
        this.scene.add(light2);
    }

    private setupFog = () => {
        const color = 0x2d496b;  // white
        const near = 85.6;
        const far = 140;
        this.scene.fog = new THREE.Fog(color, near, far);
    }

    constructor(clientWidth: number, clientHeight: number) {
        //const canvas: | HTMLCanvasElement = document.querySelector('#c');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('black');
        //const canvas: any = document.querySelector('#c');

        //this.renderer.gammaOutput = true;
        this.mount = document.createElement('div');


        this.setupCamera(clientWidth, clientHeight);
        this.setupRenderer(clientWidth, clientHeight);
        this.setupLights();
        this.setupFog();


        this.raycaster = new THREE.Raycaster();

        // todo use MaterialsRepository
        var tilesTexture = new THREE.TextureLoader().load("tiles2.jpg");
        tilesTexture.wrapS = THREE.RepeatWrapping;
        tilesTexture.wrapT = THREE.RepeatWrapping;
        tilesTexture.repeat.set(4, 4);

        var brickTexture = new THREE.TextureLoader().load("bricks.jpg");
        brickTexture.wrapS = THREE.RepeatWrapping;
        brickTexture.wrapT = THREE.RepeatWrapping;
        brickTexture.repeat.set(6, 2);

        var worldTexture = new THREE.TextureLoader().load("background.jpg");

        var tilesMaterial = new THREE.MeshPhongMaterial({ map: tilesTexture, side: THREE.DoubleSide });
        var brickMaterial = new THREE.MeshPhongMaterial({ map: brickTexture, side: THREE.DoubleSide });

        var worldmaterial = new THREE.MeshPhongMaterial({ map: worldTexture, side: THREE.DoubleSide });

        this.addArea(100, 60, 50, 50, tilesMaterial, 0, 0, 0, true);
        this.addArea(100, 90, 50, 50, tilesMaterial, 137, 0, 0, true);
        this.addArea(37, 30, 50, 50, brickMaterial, 68.5, 0, 0, true);

        this.addArea(1000, 1000, 1, 1, worldmaterial, 0, -100, -100, false);

        document.body.appendChild(this.renderer.domElement)

    }

    private addArea = (sizeX: number, sizeY: number,
        xSegments: number, ySegments: number, material: THREE.Material,
        translateX: number, translateY: number, translateZ: number, walkable: boolean) => {
        const plane = new THREE.PlaneGeometry(sizeX, sizeY, xSegments, ySegments);
        plane.rotateX(Math.PI / 2);
        plane.translate(translateX, translateY, translateZ);

        const mesh = new THREE.Mesh(plane, material);
        mesh.userData = {
            type: walkable ? 'walkable' : 'noWalkable'
        }

        this.scene.add(mesh);

    }

    public render() {
        this.renderer.render(this.scene, this.camera);
    }

}


