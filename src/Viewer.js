import BcfView from "./bcf/BcfView";
import IfcView from "./ifc/IfcView";

export default class Viewer {
    constructor() {
        this.createIfcPanel();
        this.createBcfPanel();

        window.addEventListener("resize", () => {
            this.resize();
        });

        this.resize();
    }

    resize() {
        if (this.ifcView != null) {
            this.ifcView.resize();
        }

        if (this.bcfView != null) {
            this.bcfView.resize();
        }
    }

    createIfcPanel() {
        this.ifcView = new IfcView(this);
    }

    createBcfPanel() {
        this.bcfView = new BcfView(this);
    }
}