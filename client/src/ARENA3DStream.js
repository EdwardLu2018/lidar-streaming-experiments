import * as THREE from 'three';
import {PointCloudShaderMaterial} from './PointCloudShaderMaterial';
import {RenderingMode} from './constants'

export class ARENA3DStream
{
    constructor(streamSource)
    {
        this.streamSource = null;
        this.streamTexture = null;
        this.imgWidth = 4096;
        this.imgHeight = 128;
        this.imageObject = new THREE.Group();
        this.renderingMode = RenderingMode.POINTS;
        this.material = PointCloudShaderMaterial.create();
        this.setSource(streamSource);
    }

    setSource(streamSource)
    {
        if ( streamSource !== this.streamSource ) {
            this.streamSource = streamSource;
            this.onStreamChanged();
        }

        this.switchRenderingTo(this.renderingMode);
    }

    onStreamChanged()
    {
        let _this = this;
        this.streamSource.data_handler = function (data) {
            console.log("Updating texture...");

            const texture = new THREE.DataTexture( data, _this.imgWidth, _this.imgHeight, THREE.RGBFormat );
            texture.needsUpdate = true;

            _this.streamTexture = texture;

            // _this.imgWidth = texture.stream.width;
            // _this.imgHeight = texture.stream.height;

            _this.streamTexture.minFilter = THREE.LinearFilter;
            _this.streamTexture.magFilter = THREE.LinearFilter;
            _this.streamTexture.format = THREE.RGBFormat;

            _this.material.uniforms.texSize.value = [_this.imgWidth, _this.imgHeight];
            _this.material.uniforms.texImg.value = _this.streamTexture;

            _this.switchRenderingTo(_this.renderingMode);
            // console.log(_this.material.uniforms.texSize.value);
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

    removeImageObjectChildren() {
        while (this.imageObject.children.length > 0)
        {
            this.imageObject.remove(this.imageObject.children[0]);
        }
    }

    switchRenderingToPoints()
    {
        this.removeImageObjectChildren();

        let numPoints = this.imgWidth * this.imgHeight;

        this.buffIndices = new Uint32Array(numPoints);
        this.buffPointIndicesAttr = new Float32Array(numPoints);

        for ( let ptIdx = 0; ptIdx < numPoints; ptIdx++ )
        {
            this.buffIndices[ptIdx] = ptIdx;
            this.buffPointIndicesAttr[ptIdx] = parseFloat(ptIdx);
        }

        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('vertexIdx', new THREE.Float32BufferAttribute(this.buffPointIndicesAttr, 1));
        geometry.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(this.buffIndices), 1));

        let points = new THREE.Points(geometry, this.material);
        points.frustumCulled = false;
        this.imageObject.add(points);
    }

    switchRenderingToMesh()
    {
        this.removeImageObjectChildren();

        let numPoints = this.imgWidth * this.imgHeight;
        this.buffIndices = new Uint32Array( (this.imgWidth - 1) * (this.imgHeight - 1) * 6 );
        this.buffPointIndicesAttr = new Float32Array(numPoints);

        for ( let ptIdx = 0; ptIdx < numPoints; ptIdx++ )
        {
            this.buffPointIndicesAttr[ptIdx] = parseFloat(ptIdx);
        }

        var indicesIdx = 0;
        let numRows = this.imgWidth;
        let numCols = this.imgHeight;
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
        this.imageObject.add(mesh);
    }

    setScale(scale)
    {
        for (let stream of this.imageObject.children) {
            stream.material.uniforms.scale.value = scale;
        }
    }

    setPointSize(ptSize)
    {
        for (let stream of this.imageObject.children) {
            stream.material.uniforms.ptSize.value = ptSize;
        }
    }
}
