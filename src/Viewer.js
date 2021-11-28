import {
    AmbientLight,
    AxesHelper,
    DirectionalLight,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import BcfLoader from "bcf-utils/src/access/bcf-loader";
import Picker from "./Picker";
import Markers from "./Markers";
import BcfViewer from "./BcfViewer";
import IfcPropertyViewer from "./IfcPropertyViewer";
import SelectionModel from "./SelectionModel";

export default class Viewer {
    constructor() {
        this.canvas = document.getElementById("three-canvas");
        this.modelContainer = document.getElementById("model-panel");

        this.createScene();
        this.createCamera();
        this.createLights();
        this.createAxes();
        this.createRenderer();
        this.createControls();

        window.addEventListener("resize", () => {
            this.resize();
        });

        this.createIfcViewer();

        this.markers = new Markers(this.scene);
        // markers.addMarker(Markers.LATE);

        this.animate();

        this.createBcfPanel();

        this.ifcPropertyViewer = new IfcPropertyViewer(this);

        this.resize();
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
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.target.set(-2, 0, 0);
    }

    createIfcViewer() {
        const ifcLoader = new IFCLoader();

        this.selectionModel = new SelectionModel(ifcLoader.ifcManager, this);

        this.guidMaps = new Map();

        const inputIfc = document.getElementById("file-input-ifc");
        inputIfc.addEventListener(
            "change",
            (changed) => {
                const file = changed.target.files[0];
                var ifcURL = URL.createObjectURL(file);
                ifcLoader.load(
                    ifcURL,
                    (ifcModel) => this.onModelCreated(ifcModel));
            },
            false
        );

        this.createPicker();
    }

    onModelCreated(ifcModel) {
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

    selectObject(modelID, expressID) {
        this.ifcManager.createSubset({
            modelID: modelID,
            scene: this.scene,
            ids: [expressID],
            removePrevious: true,
            material: this.selecetionMaterial,
        });
    }

    createPicker() {
        const picker = new Picker(this.selectionModel, this.canvas, this.scene, this.camera, this.renderer);

        let mousedownTimestamp = 0;
        let mousedownX = 0;
        let mousedownY = 0;

        this.canvas.addEventListener('mousedown', e => {
            mousedownTimestamp = e.timeStamp;
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

    createBcfPanel() {
        this.bcfViewer = new BcfViewer(this);
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

        if (this.bcfViewer != null) {
            this.bcfViewer.resize();
        }

        if (this.ifcPropertyViewer != null) {
            this.ifcPropertyViewer.resize();
        }
    }

    setCamera(props) {
        this.camera.position.z = props.position.z;
        this.camera.position.y = props.position.y;
        this.camera.position.x = props.position.x;

        this.camera.lookAt(props.target);
    }
}