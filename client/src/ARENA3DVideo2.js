import * as THREE from 'three';
import {PointCloudShaderMaterial2} from './PointCloudShaderMaterial';
import {RenderingMode} from './constants'

export class ARENA3DVideo2 {
    constructor(source, source2, stats) {
        this.source = null;
        this.source2 = null;
        this.stats = stats;
        this.width = 1920;
        this.height = 1080;
        this.object3D = new THREE.Group();
        this.renderingMode = RenderingMode.POINTS;
        this.material = PointCloudShaderMaterial2.create();
        this.setSource(source, source2);
    }

    setSource(source, source2) {
        if ( source !== this.source || source2 !== this.source2 ) {
            this.source = source;
            this.source2 = source2;
            this.onSourceChanged();
        }

        this.switchRenderingTo(this.renderingMode);
    }

    onSourceChanged() {
        let videoTag1 = this.source;
        let videoTag2 = this.source2;

        this.videoTexture1 = new THREE.VideoTexture( videoTag1 );
        this.videoTexture1.minFilter = THREE.LinearFilter;
        this.videoTexture1.magFilter = THREE.LinearFilter;
        this.videoTexture1.format = THREE.RGBFormat;

        this.videoTexture2 = new THREE.VideoTexture( videoTag2 );
        this.videoTexture2.minFilter = THREE.LinearFilter;
        this.videoTexture2.magFilter = THREE.LinearFilter;
        this.videoTexture2.format = THREE.RGBFormat;

        // videoTag1.play();
        // videoTag2.play();

        this.material.uniforms.texSize.value = [this.width, this.height];
        this.material.uniforms.texImgRGB.value = this.videoTexture1;
        this.material.uniforms.texImgD.value = this.videoTexture2;

        this.switchRenderingTo(this.renderingMode)
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
