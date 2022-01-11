import * as THREE from 'three';
import {PointCloudShaderMaterial} from './PointCloudShaderMaterial';
import {RenderingMode} from './constants'

export class ARENA3DStream {
    constructor(source, stats) {
        this.source = null;
        this.stats = stats;
        this.texture = null;
        this.width = 4096;
        this.height = 128;
        this.object3D = new THREE.Group();
        this.renderingMode = RenderingMode.POINTS;
        this.material = PointCloudShaderMaterial.create();
        this.setSource(source);
    }

    setSource(source) {
        if ( source !== this.source ) {
            this.source = source;
            this.onSourceChanged();
        }

        this.switchRenderingTo(this.renderingMode);
    }

    onSourceChanged() {
        let _this = this;
        this.source.data_handler = function (data) {
            console.log("Updating texture...");

            const texture = new THREE.DataTexture( data, _this.width, _this.height, THREE.RGBFormat );
            texture.needsUpdate = true;

            _this.texture = texture;

            // _this.width = texture.image.width;
            // _this.height = texture.image.height;

            _this.texture.minFilter = THREE.LinearFilter;
            _this.texture.magFilter = THREE.LinearFilter;
            _this.texture.format = THREE.RGBFormat;

            _this.material.uniforms.texSize.value = [_this.width, _this.height];
            _this.material.uniforms.texImg.value = _this.texture;

            _this.switchRenderingTo(_this.renderingMode);
            // console.log(_this.material.uniforms.texSize.value);

            if (_this.stats) _this.stats.update();
        }
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
