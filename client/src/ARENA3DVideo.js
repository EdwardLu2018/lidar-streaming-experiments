import * as THREE from 'three';
import {PointCloudShaderMaterial} from './PointCloudShaderMaterial';
import {RenderingMode} from './constants'

export class ARENA3DVideo {
    constructor(source, sourceDepth, position) {
        this.source = null;
        this.sourceDepth = null;

        this.object3D = new THREE.Group();
        this.object3D.position.set(position.x, position.y, position.z);

        this.width = 1920;
        this.height = 1080;

        this.renderingMode = RenderingMode.POINTS;
        this.material = PointCloudShaderMaterial.create();
        this.setSource(source, sourceDepth);
    }

    setSource(source, sourceDepth) {
        if ( source !== this.source || sourceDepth !== this.sourceDepth ) {
            this.source = source;
            this.sourceDepth = sourceDepth;
            this.onSourceChanged();
        }

        this.switchRenderingTo(this.renderingMode);
    }

    onSourceChanged() {
        let videoTagRGB = this.source;
        let videoTagD = this.sourceDepth;

        this.videoTextureRGB = new THREE.VideoTexture( videoTagRGB );
        this.videoTextureRGB.minFilter = THREE.LinearFilter;
        this.videoTextureRGB.magFilter = THREE.LinearFilter;
        this.videoTextureRGB.format = THREE.RGBAFormat;

        this.videoTextureD = new THREE.VideoTexture( videoTagD );
        this.videoTextureD.minFilter = THREE.LinearFilter;
        this.videoTextureD.magFilter = THREE.LinearFilter;
        this.videoTextureD.format = THREE.RGBAFormat;

        // videoTagRGB.play();
        // videoTagD.play();

        this.material.uniforms.texSize.value = [this.width, this.height];
        this.material.uniforms.texImgRGB.value = this.videoTextureRGB;
        this.material.uniforms.texImgD.value = this.videoTextureD;

        this.switchRenderingTo(this.renderingMode);
    }

    switchRenderingTo(renderingMode) {
        this.renderingMode = renderingMode;
        if ( this.renderingMode === RenderingMode.MESH ) {
            this.switchRenderingToMesh();

        } else if ( this.renderingMode === RenderingMode.POINTS ) {
            this.switchRenderingToPoints();

        } else {
            console.error('Invalid rendering mode.');
        }
    }

    removeObject3DChildren() {
        while (this.object3D.children.length > 0) {
            this.object3D.remove(this.object3D.children[0]);
        }
    }

    switchRenderingToPoints() {
        this.removeObject3DChildren();

        let numPoints = this.width * this.height;

        this.buffIndices = new Uint32Array(numPoints);
        this.buffPointIndicesAttr = new Float32Array(numPoints);

        for ( let ptIdx = 0; ptIdx < numPoints; ptIdx++ ) {
            this.buffIndices[ptIdx] = ptIdx;
            this.buffPointIndicesAttr[ptIdx] = parseFloat(ptIdx);
        }

        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('vertexIdx', new THREE.Float32BufferAttribute(this.buffPointIndicesAttr, 1));
        geometry.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(this.buffIndices), 1));

        let points = new THREE.Points(geometry, this.material);
        points.frustumCulled = false;
        this.object3D.add(points);
    }

    switchRenderingToMesh() {
        this.removeObject3DChildren();

        let numPoints = this.width * this.height;
        this.buffIndices = new Uint32Array( (this.width - 1) * (this.height - 1) * 6 );
        this.buffPointIndicesAttr = new Float32Array(numPoints);

        for ( let ptIdx = 0; ptIdx < numPoints; ptIdx++ ) {
            this.buffPointIndicesAttr[ptIdx] = parseFloat(ptIdx);
        }

        var indicesIdx = 0;
        let numRows = this.width;
        let numCols = this.height;
        for ( let row = 1; row < numRows; row++ ) {
            for ( let col = 0; col < numCols - 1; col++ ) {
                let tlIdx = (row - 1) * numCols + col;
                let trIdx = tlIdx + 1;

                let blIdx = row * numCols + col;
                let brIdx = blIdx + 1;

                this.buffIndices[indicesIdx++] = blIdx;
                this.buffIndices[indicesIdx++] = trIdx;
                this.buffIndices[indicesIdx++] = tlIdx;

                this.buffIndices[indicesIdx++] = blIdx;
                this.buffIndices[indicesIdx++] = brIdx;
                this.buffIndices[indicesIdx++] = trIdx;
            }
        }

        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('vertexIdx', new THREE.Float32BufferAttribute(this.buffPointIndicesAttr, 1));
        geometry.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(this.buffIndices), 1));

        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.frustumCulled = false;
        this.object3D.add(mesh);
    }

    setScale(scale) {
        for (let stream of this.object3D.children) {
            stream.material.uniforms.scale.value = scale;
        }
    }

    setPointSize(ptSize) {
        for (let stream of this.object3D.children) {
            stream.material.uniforms.ptSize.value = ptSize;
        }
    }
}
