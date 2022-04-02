import {RenderingMode} from './constants'

export class PtCloudViewerScene {
    constructor() {
        let self = this;

        this.pointClouds = [];

        // Setup UI
        this.options = {
            modelScale: 1.0,
            modelPointSize: 1.0,
            // toggleMeshPoints: () => {
            //     for (let ptCloud of self.pointClouds) {
            //         let newRenderingMode = ptCloud.renderingMode === RenderingMode.MESH ?
            //                                     RenderingMode.POINTS : RenderingMode.MESH;
            //         ptCloud.switchRenderingTo(newRenderingMode);
            //     }
            // }
        };
        let gui = new dat.gui.GUI();
        gui.add(this.options, 'modelScale').min(1).max(20).step(0.1)
            .onChange(() => {
                for (let ptCloud of self.pointClouds)
                {
                    ptCloud.setScale(self.options.modelScale);
                }
            });

        gui.add(this.options, 'modelPointSize').min(0.1).max(20).step(0.1)
            .onChange(() => {
                for (let ptCloud of self.pointClouds)
                {
                    ptCloud.setPointSize(self.options.modelPointSize);
                }
            });

        // gui.add(this.options, 'toggleMeshPoints').name('Render points/mesh');
    }

    addStream(lidarStream) {
        this.pointClouds.push(lidarStream);
        var sceneEl = document.querySelector("a-scene");
        sceneEl.object3D.add(lidarStream.object3D);
        // var camera = document.getElementById("my-camera");
        // camera.object3D.add(lidarStream.object3D);
    }

    toggleSound() {
        for (let ptCloud of this.pointClouds) {
            ptCloud.toggleAudio();
        }
    }

    onWindowResize(event) {
    }
}
