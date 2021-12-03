import { AmbientLight, AxesHelper, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import Markers from "./Markers";
import Picker from "./Picker";
import SelectionModel from "./SelectionModel";
import IfcPropertyViewer from "./IfcPropertyViewer";

export default class IfcView {
    constructor(parent) {
        this.parent = parent;

        this.globalTranslation = { x: 0, y: 0, z: 0 };

        this.canvas = document.getElementById("three-canvas");
        this.modelContainer = document.getElementById("model-panel");
        this.loadingContainer = document.getElementById("model-panel-loading");
        this.progressIndicator = document.getElementById('model-panel-loading-progress');

        this.createScene();
        this.createCamera();
        this.createLights();
        this.createAxes();
        this.createRenderer();
        this.createControls();

        this.createIfcLoader();

        this.animate();

        this.markers = new Markers(this.scene);
        this.ifcPropertyViewer = new IfcPropertyViewer(this);
    }

    createScene() {
        this.scene = new Scene();

        this.size = {
            width: this.modelContainer.clientWidth,
            height: this.modelContainer.clientHeight,
        };
    }

    createCamera() {
        const aspect = this.size.width / this.size.height;
        this.camera = new PerspectiveCamera(75, aspect);
        this.camera.position.z = 8;
        this.camera.position.y = 13;
        this.camera.position.x = 8;
    }

    createLights() {
        const lightColor = 0xffffff;
        const ambientLight = new AmbientLight(lightColor, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new DirectionalLight(lightColor, 1);
        directionalLight.position.set(0, 10, 0);
        directionalLight.target.position.set(-5, 0, 0);
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);
    }

    createAxes() {
        const axes = new AxesHelper();
        axes.material.depthTest = false;
        axes.renderOrder = 1;
        this.scene.add(axes);
    }

    createRenderer() {
        this.canvas = document.getElementById("three-canvas");
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            alpha: true
        });

        this.renderer.setSize(this.size.width, this.size.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    createControls() {
        // TODO: use pivot controls
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.target.set(-2, 0, 0);
    }

    createIfcLoader() {
        const ifcLoader = new IFCLoader();

        this.selectionModel = new SelectionModel(ifcLoader.ifcManager, this);

        this.guidMaps = new Map();
        this.models = [];

        const inputIfc = document.getElementById("file-input-ifc");
        inputIfc.addEventListener(
            "change",
            (changed) => {
                const file = changed.target.files[0];
                if (file == null) {
                    return;
                }

                this.showLoading();
                var ifcURL = URL.createObjectURL(file);
                ifcLoader.load(
                    ifcURL,
                    (ifcModel) => {
                        this.onModelCreated(ifcModel);
                        this.hideLoading();
                    },
                    (progressEvent) => {
                        const progress = 100 * progressEvent.loaded / progressEvent.total
                        this.setProgress(progress);
                    });
            },
            false
        );

        this.createPicker();
    }

    onModelCreated(ifcModel) {
        this.models.push(ifcModel);
        this.centerModels(ifcModel);

        this.scene.add(ifcModel);

        this.ifcManager = ifcModel.ifcManager;
        const modelID = ifcModel.modelID;
        this.ifcManager.state.api.CreateIfcGuidToExpressIdMapping(modelID);
        const expressToGuidMap = this.ifcManager.state.api.ifcGuidMap.get(modelID);
        const guidToExpressMap = new Map();

        for (const [eId, guid] of expressToGuidMap) {
            guidToExpressMap.set(guid, eId);
        }

        this.guidMaps.set(modelID, guidToExpressMap);
    }

    centerModels() {
        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;
        let maxZ = Number.MIN_VALUE;

        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let minZ = Number.MAX_VALUE;

        this.scene.position.x = 0;
        this.scene.position.y = 0;
        this.scene.position.z = 0;

        for (let model of this.models) {
            // model.position.x = 0;
            // model.position.y = 0;
            // model.position.z = 0;
            if(model.geometry.boundingBox == null) {
                model.geometry.computeBoundingBox();
            }

            maxX = Math.max(maxX, model.geometry.boundingBox.max.x);
            maxY = Math.max(maxY, model.geometry.boundingBox.max.y);
            maxZ = Math.max(maxZ, model.geometry.boundingBox.max.z);

            minX = Math.min(minX, model.geometry.boundingBox.min.x);
            minY = Math.min(minY, model.geometry.boundingBox.min.y);
            minZ = Math.min(minZ, model.geometry.boundingBox.min.z);
        }

        this.globalTranslation.x = (minX + maxX) / 2;
        this.globalTranslation.y = (minY + maxY) / 2;
        this.globalTranslation.z = (minZ + maxZ) / 2;

        // for (let model of this.models) {
        //     model.position.x = -this.globalTranslation.x;
        //     model.position.y = -this.globalTranslation.y;
        //     model.position.z = -this.globalTranslation.z;
        // }

        this.scene.position.x = -this.globalTranslation.x;
        this.scene.position.y = -this.globalTranslation.y;
        this.scene.position.z = -this.globalTranslation.z;
    }

    createPicker() {
        const picker = new Picker(this.selectionModel, this.canvas, this.scene, this.camera, this.renderer);

        let mousedownX = 0;
        let mousedownY = 0;

        this.canvas.addEventListener('mousedown', e => {
            mousedownX = e.x;
            mousedownY = e.y;
        });

        this.canvas.addEventListener('click', e => {
            if (Math.abs(e.x - mousedownX) > 10) {
                return;
            }

            if (Math.abs(e.y - mousedownY) > 10) {
                return;
            }

            picker.pick(e).then((props) => {
                if (props == null) {
                    return;
                }

                this.ifcPropertyViewer.displayProps(props);
            });
        });
    }

    animate() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate.bind(this));
    }

    resize() {
        this.size.width = this.modelContainer.clientWidth;
        this.size.height = this.modelContainer.clientHeight;
        this.camera.aspect = this.size.width / this.size.height;
        this.renderer.setSize(this.size.width, this.size.height);
        this.camera.updateProjectionMatrix();

        if (this.ifcPropertyViewer != null) {
            this.ifcPropertyViewer.resize();
        }
    }

    setCamera(props) {
        this.camera.position.z = props.position.z;
        this.camera.position.y = props.position.y;
        this.camera.position.x = props.position.x;

        this.camera.lookAt(props.target);

        this.camera.position.x = -this.globalTranslation.x;
        this.camera.position.y = -this.globalTranslation.y;
        this.camera.position.z = -this.globalTranslation.z;
    }

    setProgress(value) {
        this.progressIndicator.setAttribute('style', 'width:' + Number(value) + '%');
        this.progressIndicator.setAttribute('aria-valuenow', value);
    }

    showLoading() {
        this.setProgress(0);
        this.loadingContainer.style.display = 'flex';
    }

    hideLoading() {
        this.setProgress(0);
        this.loadingContainer.style.display = 'none';
    }
}
