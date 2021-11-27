import { WebGLRenderTarget, Raycaster } from 'three';

export class Picker {
    constructor(canvas, scene, camera, renderer) {
        this.canvas = canvas;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        // create a 1x1 pixel render target
        this.pickingTexture = new WebGLRenderTarget(1, 1);
        this.pixelBuffer = new Uint8Array(4);
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;

        this.raycaster = new Raycaster();
    }

    getCanvasRelativePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * this.canvas.width / rect.width,
            y: (event.clientY - rect.top) * this.canvas.height / rect.height,
        };
    }

    getPickPosition(event) {
        const pos = this.getCanvasRelativePosition(event);

        return {
            x: (pos.x / this.canvas.width) * 2 - 1,
            y: (pos.y / this.canvas.height) * -2 + 1,
        };
    }

    async pick(event) {
        var position = this.getPickPosition(event);

        // restore the color if there is a picked object
        if (this.pickedObject) {
            // this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
            this.pickedObject = undefined;
        }

        // cast a ray through the frustum
        this.raycaster.setFromCamera(position, this.camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);
        if (intersectedObjects.length == 0) {
            return;
        }

        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0];
        this.pickedIfcObject = this.pickedObject.object;
        if(this.pickedIfcObject == null || this.pickedIfcObject.ifcManager == null) {
            return;
        }

        const ifcManager = this.pickedIfcObject.ifcManager;
        const expressID = ifcManager.getExpressId(this.pickedIfcObject.geometry, this.pickedObject.faceIndex);
        const modelID = this.pickedIfcObject.modelID;

        const props = await ifcManager.getItemProperties(modelID, expressID, true);
        props.psets = await ifcManager.getPropertySets(modelID, expressID, true);
        props.mats = await ifcManager.getMaterialsProperties(modelID, expressID, true);
        props.type = await ifcManager.getTypeProperties(modelID, expressID, true);

        return props;
    }
}