import {
    TextureLoader,
    SpriteMaterial,
    Sprite,
} from "three";

export default class Markers {
    static get LATE() {return 'LATE'}
    static get CAMERA() {return 'CAMERA'}

    constructor(scene) {
        this.scene = scene;

        this.materials = new Map();
        this.materials.set(Markers.LATE, this.createMarkerMaterial('../res/images/warning.png'));
        this.materials.set(Markers.CAMERA, this.createMarkerMaterial('../res/images/camera.png'));
    }

    createMarkerMaterial(src) {
        const map = new TextureLoader().load(src);
        const material = new SpriteMaterial({ map: map, sizeAttenuation: false, depthTest: false });
        return material;
    }

    addMarker(type, position) {
        const sprite = new Sprite(this.materials.get(type));
        sprite.position.set( position.x, position.y, position.z );
        const spriteScale = 0.08;
        sprite.scale.set(spriteScale, spriteScale, spriteScale);
        this.scene.add(sprite);
    }
}