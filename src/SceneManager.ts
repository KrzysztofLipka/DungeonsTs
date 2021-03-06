import * as THREE from 'three';
import { IGameModel } from './AssetsManager';
import { globals, cameraPosition } from './utils'

export class SceneManager {
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;

    public cameraVector: THREE.Vector3;

    public mount: HTMLDivElement;
    public raycaster: THREE.Raycaster;
    //public mouse: THREE.Vector2;
    public cube: THREE.Mesh;
    public assets: IGameModel[];

    private setupCamera = (clientWidth: number, clientHeight: number) => {
        this.camera = new THREE.PerspectiveCamera(25, clientWidth / clientHeight, 1, 1000);
        this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        this.camera.lookAt(0, 0, 0);
    }


    private setupRenderer = (clientWidth: number, clientHeight: number) => {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.physicallyCorrectLights = true;
        this.renderer.setSize(clientWidth, clientHeight);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 2;
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    private setupLights = () => {
        const light = new THREE.HemisphereLight(0xffeeb1, 0xffffff, 8);
        this.scene.add(light);

        const light2 = new THREE.PointLight(0xf08f35, 100);
        light2.position.set(140, -20, -55);
        this.scene.add(light2);

        /*var width = 100;
        var height = 100;
        var intensity = 1;
        var rectLight = new THREE.RectAreaLight(0xdba02a, intensity, width, height);
        rectLight.position.set(0, -80, 0);
        rectLight.rotateX(Math.PI / 3);
        //rectLight.lookAt(0, 0, 0);
        this.scene.add(rectLight)*/

    }

    private setupFog = () => {
        const color = 0x2d496b;
        const near = 175.6;
        const far = 300;
        this.scene.fog = new THREE.Fog(color, near, far);
    }

    resizeRendererToDisplaySize(renderer: THREE.Renderer) {
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    constructor(clientWidth: number, clientHeight: number) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('black');
        this.cameraVector = new THREE.Vector3(0, 0, 0);
        this.mount = document.createElement('div');


        this.setupCamera(clientWidth, clientHeight);
        this.setupRenderer(clientWidth, clientHeight);
        this.setupLights();
        //this.setupFog();


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
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.onWindowResize, false);
    }

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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

    private moveCamera = () => {
        const cameraTarget = new THREE.Vector3(
            globals.player.transform.position.x + cameraPosition.x,
            cameraPosition.y,
            globals.player.transform.position.z + cameraPosition.z);

        let delta = new THREE.Vector3();
        delta.subVectors(cameraTarget, this.camera.position);
        this.camera.position.addVectors(this.camera.position, delta);
    }

    public render() {
        this.renderer.render(this.scene, this.camera);
        if (globals.player?.transform?.position.distanceTo(globals.positionOfLastClick) > 0.5) {
            this.moveCamera();
        }
    }

}


