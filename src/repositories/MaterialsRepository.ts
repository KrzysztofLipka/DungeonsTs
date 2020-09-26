import * as THREE from 'three';
import { Material } from 'three';

export class MaterialsRepository {

    private textures: Map<string, THREE.Texture>;
    public materials: Map<string, THREE.Material>;
    constructor() {
        this.textures = new Map<string, THREE.Texture>();
        this.materials = new Map<string, THREE.Material>();

    }
    private addWrappingTexture = (title: string, url: string, repeatX: number, repeatY: number): void => {
        let texture = new THREE.TextureLoader().load(url);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
        this.textures.set(title, texture);
    }

    getTexture = (title: string): THREE.Texture => {
        return this.textures.get(title)
    }

    //todo make generic for other types of materials
    private addPhongMaterial = (title: string, textureTitle: string) => {
        this.materials.set(title, new THREE.MeshPhongMaterial({ map: this.getTexture(textureTitle), side: THREE.DoubleSide }))

    }

    initTextures = () => {
        this.addWrappingTexture('tiles', "tiles2.jpg", 4, 4);
        this.addWrappingTexture('bricks', "bricks.jpg", 6, 2);
    };

    initMaterials = () => {
        this.addPhongMaterial('tilesMaterial', 'tiles');
    }

}
