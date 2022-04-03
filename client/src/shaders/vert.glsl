attribute float vertexIdx;

varying float vVertexIdx;
varying vec2 vPtPos;
varying float vShouldDiscard;

uniform ivec2 texSize;
uniform sampler2D texImgRGBD;
uniform float scale;
uniform float ptSize;

#define FILTER 0


// Filtering constants
const int filterSize = 1;
const float distThresholdFilter = 1.0;
const float s = 256.0; // 2^8


float getPixelDepth(ivec2 pixel) {
    vec2 lookupPt = vec2(pixel) / vec2(texSize);
    vec3 depthRGB = 255.0 * texture2D(texImgRGBD, lookupPt).rgb;

    float depth = (depthRGB.g * s) + depthRGB.b; // (g << 8) + b
    return depth * 0.001;
}

bool shouldDiscard(ivec2 currPixel) {
#if FILTER
    float avgDepth = getPixelDepth(currPixel);
    int num = 0;

    for ( int i = -filterSize; i <= filterSize; i++ )
        for ( int j = -filterSize; j <= filterSize; j++ ) {
            if ( i == 0 && j == 0 )
                continue;

            float currDepth = getPixelDepth(currPixel + ivec2(j, i));
            avgDepth += currDepth;
            num++;
        }

    if (avgDepth / float(num) > distThresholdFilter) {
        return true;
    }
#endif

    return false;
}

void main() {
    vShouldDiscard = 0.0;

    ivec2 frameSize = ivec2(texSize.x / 2, texSize.y);
    int vertIdx = int(vertexIdx);

    int actualNumPts = frameSize.x * frameSize.y;
    if ( vertIdx >= actualNumPts ) {
        vShouldDiscard = 1.0;
        gl_Position = vec4(0.0);
        return;
    }

    int ptY = vertIdx / int(frameSize.x);
    int ptX = vertIdx - ptY * int(frameSize.x);
    ivec2 pt = ivec2(ptX + frameSize.x, ptY);

    if ( shouldDiscard( pt ) ) {
        vShouldDiscard = 1.0;
        gl_Position = vec4(0.0);
        return;
    }

    float depth = 75.0 * getPixelDepth(pt);
    vec3 ptPos = 0.005 * scale * vec3(
        float(ptX) - float(frameSize.x / 2),
        float(ptY) - float(frameSize.y / 2),
        -depth
    );

    vec4 mvPos = modelViewMatrix * vec4(ptPos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    vPtPos = vec2( float(ptX), float(ptY) );
    vVertexIdx = vertexIdx;
    gl_PointSize = ptSize;
}
