import {
    TextureLoader,
    SpriteMaterial,
    Sprite,
} from "three";

export class Markers {
    static get LATE() {return 'LATE'}

    constructor(scene) {
        this.scene = scene;

        this.materials = new Map();
        this.materials.set(Markers.LATE, this.createMarkerMaterial('../res/images/warning.png'));
    }

    createMarkerMaterial(src) {
        const map = new TextureLoader().load(src);
        const material = new SpriteMaterial({ map: map, sizeAttenuation: false, depthTest: false });
        return material;
    }

    addMarker(type, position) {
        const sprite = new Sprite(this.materials.get(type));
        const spriteScale = 0.08;
        sprite.scale.set(spriteScale, spriteScale, spriteScale);
        this.scene.add(sprite);
    }
}