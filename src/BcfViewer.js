import BcfLoader from "../../bcf-utils/src/access/bcf-loader";
import Markers from "./Markers";
import Splitter from "./Splitter";

export default class BcfViewer {
    constructor(parent) {
        this.parent = parent;
        this.bcfPanel = document.getElementById('bcf-panel');
        this.topicsContainer = document.getElementById('bcf-topics');

        this.bcfSplitter = document.getElementById('bcf-splitter');
        this.splitter = new Splitter(this.bcfSplitter);
        this.splitter.onResize = () => {
            this.parent.resize();
        }

        this.hideBcfPanel();


        this.createBcfLoader();
    }

    resize() {
        this.splitter.resize();
    }

    hideBcfPanel() {
        this.splitter.hideLeft();
    }

    showBcfPanel() {
        this.splitter.showLeft();
    }

    createBcfLoader() {
        const bcfLoader = new BcfLoader();
        const inputBcf = document.getElementById("file-input-bcf");
        inputBcf.addEventListener(
            "change",
            (changed) => {
                const file = changed.target.files[0];
                bcfLoader.loadFile(file).then(bcf => {
                    this.showBcfPanel();
                    this.loadTopics(bcf)
                    this.addMarkers(bcf);
                });
            },
            false
        );
    }

    loadTopics(bcf) {
        while (this.topicsContainer.firstChild) {
            this.topicsContainer.removeChild(this.topicsContainer.firstChild);
        }

        for (let markup of bcf.markups.values()) {
            const topic = markup.Topic;
            const topicContainer = document.createElement('div');
            topicContainer.classList.add('snapshot-thumbs-container');
            topicContainer.style.marginBottom = "5px";
            this.topicsContainer.appendChild(topicContainer);

            const title = document.createElement('p');
            title.classList.add('snapshot-thumbs-title');
            title.innerHTML = topic.Title;
            topicContainer.appendChild(title);

            // this.addTopicAttribute('Guid', topic, topicContainer);
            // this.addTopicAttribute('TopicType', topic, topicContainer);
            // this.addTopicAttribute('TopicStatus', topic, topicContainer);
            // this.addTopicAttribute('CreationDate', topic, topicContainer);
            // this.addTopicAttribute('CreationAuthor', topic, topicContainer);
            // this.addTopicAttribute('Priority', topic, topicContainer);
            // this.addTopicAttribute('Index', topic, topicContainer);
            // this.addTopicAttribute('ModifiedDate', topic, topicContainer);
            // this.addTopicAttribute('ModifiedAuthor', topic, topicContainer);

            const snapshotsDiv = document.createElement('div');
            snapshotsDiv.classList.add('snapshot-thumbs');
            topicContainer.appendChild(snapshotsDiv);

            markup.Viewpoints.forEach(viewpoint => {
                this.addTopicViewpoint(viewpoint, markup, snapshotsDiv);
            });
        }
    }

    addTopicAttribute(attribute, topic, target) {
        const p = document.createElement('p');
        p.innerHTML = attribute + ': ' + topic[attribute];
        target.appendChild(p);
    }

    addTopicViewpoint(viewpoint, markup, target) {
        const snapshotDiv = document.createElement('div');
        snapshotDiv.classList.add('snapshot-thumb');
        snapshotDiv.addEventListener('click', (e) => {
            const vsInfo = markup.VisualizationInfos.get(viewpoint.Viewpoint);
            if (vsInfo == null) {
                console.log('no VisualizationInfo');
                return;
            }

            console.log(vsInfo);

            if (vsInfo.PerspectiveCamera != null) {
                const camera = vsInfo.PerspectiveCamera;
                const cameraViewPoint = camera.CameraViewPoint;
                const cameraDirection = camera.CameraDirection;

                this.parent.setCamera({
                    position: {
                        x: cameraViewPoint.X,
                        y: cameraViewPoint.Z,
                        z: -cameraViewPoint.Y,
                    },
                    target: {
                        x: cameraViewPoint.X + cameraDirection.X,
                        y: cameraViewPoint.Z + cameraDirection.Z,
                        z: cameraViewPoint.Y - cameraDirection.Y,
                    }
                })
            }

            const components = vsInfo.Components.Selection.Component;
            let removePrevious = true;
            components.forEach(component => {
                this.parent.selectionModel.selectObjectByGuid(component.IfcGuid, removePrevious);
                removePrevious = false;
            });
        })
        target.appendChild(snapshotDiv);

        const snapshot = markup.Snapshots.get(viewpoint.Snapshot);
        const img = document.createElement('img');
        img.src = snapshot;
        snapshotDiv.appendChild(img);

        // this.addComments(viewpoint, markup, snapshotDiv);
    }

    addComments(viewpoint, markup, target) {
        markup.Comment.forEach(comment => {
            if (comment.Viewpoint == null || comment.Viewpoint.Guid == null) {
                return;
            }

            if (comment.Viewpoint.Guid !== viewpoint.Guid) {
                return;
            }

            const commentDiv = document.createElement('div');
            commentDiv.style.border = "1px solid #000";
            commentDiv.style.padding = "5px";
            commentDiv.style.margin = "5px";
            target.appendChild(commentDiv);

            const authorP = document.createElement('p');
            authorP.innerHTML = 'Author: ' + comment.Author;
            commentDiv.appendChild(authorP);

            const dateP = document.createElement('p');
            dateP.innerHTML = 'Date: ' + comment.Date;
            commentDiv.appendChild(dateP);

            const commentP = document.createElement('p');
            commentP.innerHTML = 'Comment: ' + comment.Comment;
            commentDiv.appendChild(commentP);
        });
    }

    addMarkers(bcf) {
        for (let markup of bcf.markups.values()) {
            markup.Viewpoints.forEach(viewpoint => {
                const vsInfo = markup.VisualizationInfos.get(viewpoint.Viewpoint);
                if (vsInfo == null) {
                    return;
                }

                console.log(vsInfo);

                if (vsInfo.PerspectiveCamera != null) {
                    const camera = vsInfo.PerspectiveCamera;
                    const cameraViewPoint = camera.CameraViewPoint;
                    const cameraDirection = camera.CameraDirection;

                    const position = {
                        x: cameraViewPoint.X,
                        y: cameraViewPoint.Z,
                        z: -cameraViewPoint.Y,
                    }

                    this.parent.markers.addMarker(Markers.CAMERA, position);
                }
            });
        }
    }
}