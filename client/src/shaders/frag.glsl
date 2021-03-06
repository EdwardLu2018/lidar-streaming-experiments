varying float vVertexIdx;
varying vec2 vPtPos;
varying float vShouldDiscard;

uniform ivec2 texSize;
uniform sampler2D texImgRGBD;

void main() {
    vec2 frameSizeF = vec2(texSize.x, texSize.y);
    ivec2 frameSize = ivec2(frameSizeF);

    int vertIdx = int(vVertexIdx);
    int actualNumPts = frameSize.x * frameSize.y;
    if ( vShouldDiscard != 0.0 || vertIdx >= actualNumPts ) {
        discard;
    }

    vec2 lookupPt = vec2(vPtPos.x, vPtPos.y) / vec2(texSize);
    vec3 currColor = texture2D(texImgRGBD, lookupPt).rgb;

    gl_FragColor = vec4(currColor, 1.0);
}
