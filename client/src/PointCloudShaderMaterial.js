import * as THREE from 'three';

export class PointCloudShaderMaterial {
    static create() {
        const vertShaderProg = require('./shaders/vert.glsl');
        const fragShaderProg = require('./shaders/frag.glsl');;

        return new THREE.ShaderMaterial({
            uniforms: {
                texImgRGBD: { type: 't', value: new THREE.Texture() },
                texSize: { type: 'i2', value: [0, 0] },
                scale: { type: 'f', value: 1.0 },
                ptSize: { type: 'f', value: 1.0 },
            },
            side: THREE.DoubleSide,
            transparent: false,
            vertexShader: vertShaderProg,
            fragmentShader: fragShaderProg
        });
    }
}
