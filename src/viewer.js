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
import { Picker } from "./picker";
import { Markers } from "./markers";
import { Splitter } from "./splitter";

export class Viewer {
    constructor() {
        this.canvas = document.getElementById("three-canvas");
        this.container = document.getElementById("ifc-panel");

        this.createSplitters();

        this.createScene();
        this.createCamera();
        this.createLights();
        this.createAxes();
        this.createRenderer();
        this.createControls();
        
        window.addEventListener("resize", () => {
            this.resize();
        });
        
        this.createIfcLoader();
        this.createBcfLoader();
        
        this.createPicker();
        
        const markers = new Markers(this.scene);
        markers.addMarker(Markers.LATE);

        this.animate();
    }

    createScene() {
        this.scene = new Scene();

        this.size = {
            width: this.container.clientWidth,
            height: window.innerHeight,
        };
    }

    createCamera() {
        const aspect = this.size.width / this.size.height;
        this.camera = new PerspectiveCamera(75, aspect);
        this.camera.position.z = 15;
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

    createIfcLoader() {
        const ifcLoader = new IFCLoader();

        const inputIfc = document.getElementById("file-input-ifc");
        inputIfc.addEventListener(
            "change",
            (changed) => {
                const file = changed.target.files[0];
                var ifcURL = URL.createObjectURL(file);
                ifcLoader.load(
                    ifcURL,
                    (ifcModel) => this.scene.add(ifcModel));
            },
            false
        );
    }

    createBcfLoader() {
        const inputBcf = document.getElementById("file-input-bcf");
        inputBcf.addEventListener(
            "change",
            (changed) => {
                const file = changed.target.files[0];
                bcfLoader.loadFile(file).then(bcf => {
                    debugger;
                });
            },
            false
        );
    }

    createPicker() {
        const picker = new Picker(this.canvas, this.scene, this.camera, this.renderer);

        window.addEventListener('mouseup', e => {
            picker.pick(e);
        });
    }

    createBcfPanel() {
        const bcfPanel = document.getElementById('bcf-panel');
    }

    createSplitters() {
        const splitters = document.getElementsByClassName('splitter');
        for (let splitterElement of splitters) {
            const splitter = new Splitter(splitterElement);
            splitter.onResize = () => {
                this.resize();
            }
        }
    }

    animate() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate.bind(this));
    }

    resize() {
        this.size.width = this.container.clientWidth;
        this.size.height = window.innerHeight;
        this.camera.aspect = this.size.width / this.size.height;
        this.renderer.setSize(this.size.width, this.size.height);
        this.camera.updateProjectionMatrix();
    }
}