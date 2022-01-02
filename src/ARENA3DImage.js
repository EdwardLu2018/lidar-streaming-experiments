import * as THREE from 'three';
import {PointCloudShaderMaterial} from './PointCloudShaderMaterial';
import {RenderingMode} from './constants'

export class ARENA3DImage
{
    constructor(imageSource)
    {
        this.imageSource = null;
        this.imageTexture = null;
        this.imageObject = new THREE.Group();
        this.renderingMode = RenderingMode.POINTS;
        this.material = PointCloudShaderMaterial.create();
        this.setImageSource(imageSource);
    }

    setImageSource(imageSource)
    {
        if ( imageSource !== this.imageSource ) {
            this.imageSource = imageSource;
            this.onImageChanged();
        }

        this.switchRenderingTo(this.renderingMode);
    }

    onImageChanged()
    {
        const self = this;
        const loader = new THREE.TextureLoader();
        loader.load(this.imageSource,
            // onLoad callback
            function (texture) {
                console.log("loaded texture!");
                self.imgTexture = texture;

                self.imgWidth = texture.image.width;
                self.imgHeight = texture.image.height;

                self.imgTexture.minFilter = THREE.LinearFilter;
                self.imgTexture.magFilter = THREE.LinearFilter;
                self.imgTexture.format = THREE.RGBFormat;

                self.material.uniforms.texSize.value = [self.imgWidth, self.imgHeight];
                self.material.uniforms.texImg.value = self.imgTexture;

                self.switchRenderingTo(self.renderingMode);
                console.log(self.material.uniforms.texSize.value);
            },

            // onProgress callback currently not supported
            undefined,

            // onError callback
            function (err) {
                console.error("failed to load texture!", err);
            });
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
        for (let image of this.imageObject.children) {
            image.material.uniforms.scale.value = scale;
        }
    }

    setPointSize(ptSize)
    {
        for (let image of this.imageObject.children) {
            image.material.uniforms.ptSize.value = ptSize;
        }
    }
}
