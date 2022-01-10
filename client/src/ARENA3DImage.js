import * as THREE from 'three';
import {ARENA3DStream} from './ARENA3DStream';

export class ARENA3DImage extends ARENA3DStream {
    constructor(source) {
        super(source);
    }

    onSourceChanged() {
        if (this.image === undefined) {
            this.image = new Image();
            this.image.crossOrigin = "";
            this.image.src = this.source;
        }

        let _this = this;
        this.image.onload = () => {
            console.log("Loaded texture!");
            var texture = new THREE.Texture(this.image);
            texture.needsUpdate = true;

            _this.texture = texture;

            _this.width = texture.image.width;
            _this.height = texture.image.height;

            _this.texture.minFilter = THREE.LinearFilter;
            _this.texture.magFilter = THREE.LinearFilter;
            _this.texture.format = THREE.RGBFormat;

            _this.material.uniforms.texSize.value = [_this.width, _this.height];
            _this.material.uniforms.texImg.value = _this.texture;


            _this.switchRenderingTo(_this.renderingMode);
        }
    }
}
