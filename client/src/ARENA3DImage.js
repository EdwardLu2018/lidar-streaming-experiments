import * as THREE from 'three';
import {ARENA3DStream} from './ARENA3DStream';

export class ARENA3DImage extends ARENA3DStream {
    constructor(source) {
        super(source);
    }

    onSourceChanged() {
        let _this = this;
        const loader = new THREE.TextureLoader();
        loader.load(this.source,
            // onLoad callback
            function (texture) {
                console.log("Loaded texture!");
                _this.texture = texture;

                _this.width = texture.image.width;
                _this.height = texture.image.height;

                _this.texture.minFilter = THREE.LinearFilter;
                _this.texture.magFilter = THREE.LinearFilter;
                _this.texture.format = THREE.RGBFormat;

                _this.material.uniforms.texSize.value = [_this.width, _this.height];
                _this.material.uniforms.texImg.value = _this.texture;

                _this.switchRenderingTo(_this.renderingMode);
            },

            // onProgress callback currently not supported
            undefined,

            // onError callback
            function (err) {
                console.error("failed to load texture!", err);
            });
    }
}
