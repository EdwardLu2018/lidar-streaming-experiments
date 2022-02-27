import * as THREE from 'three';
import {ARENA3DStream} from './ARENA3DStream';

export class ARENA3DVideo extends ARENA3DStream {
    constructor(source, stats) {
        super(source, stats);
    }

    onSourceChanged() {
        let videoTag = this.source;

        this.videoTexture = new THREE.VideoTexture( videoTag );
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;

        // videoTag.play();

        this.width = 3840;
        this.height = 1080;
        this.material.uniforms.texSize.value = [this.width, this.height];
        this.material.uniforms.texImg.value = this.videoTexture;

        this.switchRenderingTo(this.renderingMode)
    }
}
