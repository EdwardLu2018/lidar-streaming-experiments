import * as THREE from 'three';
import {ARENA3DStream} from './ARENA3DStream';

export class ARENA3DVideo extends ARENA3DStream {
    constructor(source) {
        super(source);
    }

    onSourceChanged() {
        let videoSource = this.videoSource;

        this.videoTexture = new THREE.VideoTexture( videoSource.videoTag );
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;

        videoSource.videoTag.play();

        let newVideoWidth = videoSource.videoTag.videoWidth;
        let newVideoHeight = videoSource.videoTag.videoHeight;
        this.material.uniforms.texSize.value = [newVideoWidth, newVideoHeight];
        this.material.uniforms.texImg.value = this.videoTexture;

        let intrinsicMatrix = videoSource.intrMat;
        let ifx = 1.0 / intrinsicMatrix.elements[0];
        let ify = 1.0 / intrinsicMatrix.elements[4];
        let itx = -intrinsicMatrix.elements[2] / intrinsicMatrix.elements[0];
        let ity = -intrinsicMatrix.elements[5] / intrinsicMatrix.elements[4];

        this.material.uniforms.iK.value = [ifx, ify, itx, ity];

        this.switchRenderingTo(this.renderingMode)
    }
}
