import { MeshLambertMaterial } from 'three';

export default class SelectionModel {
    constructor(ifcManager, viewer) {
        this.ifcManager = ifcManager;
        this.viewer = viewer;

        this.selecetionMaterial = new MeshLambertMaterial({
            color: 0xf61e61,
            transparent: true,
            opacity: 0.8,
            depthTest: false
        });
    }

    selectObjectByGuid(guid, removePrevious=true) {
        for (const [modelID, guidMap] of this.viewer.guidMaps) {
            if(guidMap.has(guid) == false) {
                continue;
            }

            const expressID = guidMap.get(guid);

            this.selectObject(modelID, expressID, removePrevious);
            break;
        }
    }

    selectObject(modelID, expressID, removePrevious=true) {
        this.ifcManager.createSubset({
            modelID: modelID,
            scene: this.viewer.scene,
            ids: [expressID],
            removePrevious: removePrevious,
            material: this.selecetionMaterial,
        });
    }
}