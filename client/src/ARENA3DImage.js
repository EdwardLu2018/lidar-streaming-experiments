import * as THREE from 'three';
import {ARENA3DStream} from './ARENA3DStream';

export class ARENA3DImage extends ARENA3DStream {
    constructor(source, stats) {
        super(source, stats);
    }

    onSourceChanged() {
        if (this.image === undefined) {
            this.image = new Image();
            this.image.crossOrigin = "";
            this.image.src = this.source;
            // document.body.appendChild(this.image);

            let _this = this;
            setInterval(() => {
                if (_this.texture) {
                    _this.texture.needsUpdate = true;
                    if (_this.stats) _this.stats.update();
                }
            }, 50);

            this.image.onload = () => {
                // console.log("Loaded texture!");
                var texture = new THREE.Texture(_this.image);
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
}
