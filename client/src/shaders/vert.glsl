attribute float vertexIdx;

varying float vVertexIdx;
varying vec2 vPtPos;
varying float vShouldDiscard;

uniform ivec2 texSize;
uniform sampler2D texImg;
uniform float scale;
uniform float ptSize;

#define FILTER 0

// Filtering constants
const int filterSize = 1;
const float distThresholdFilter = 1.0;


vec3 getPixelXYZ(ivec2 pixel) {
    vec2 lookupPt = vec2(pixel) / vec2(texSize);
    vec3 rgb = texture2D(texImg, lookupPt).rgb;
    vec3 xyz = ((255.0 * rgb) - 128.0) / 9.0;

    return -xyz;
    // return vec3(xyz[0], xyz[1], xyz[2]);
}

bool shouldDiscard(ivec2 currPixel) {
#if FILTER
    vec3 pt3D = getPixelXYZ(currPixel);
    float avgDistance = 0.0;
    int num = 0;

    for ( int i = -filterSize; i <= filterSize; i++ )
        for ( int j = -filterSize; j <= filterSize; j++ ) {
            if ( i == 0 && j == 0 )
                continue;

            vec3 currPt3D = getPixelXYZ(currPixel + ivec2(j, i));
            avgDistance += distance(currPt3D, pt3D);
            num++;
        }

    if (avgDistance / float(num) > distThresholdFilter) {
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
    ivec2 pt = ivec2(ptX, ptY);

    if ( shouldDiscard( pt ) ) {
        vShouldDiscard = 1.0;
        gl_Position = vec4(0.0);
        return;
    }

    // vec3 ptPos = scale * getPixelXYZ(pt);
    vec3 ptPos = scale * vec3(
        0.01*float(ptX),
        0.01*float(ptY),
        -1.0
    );

    vec4 mvPos = modelViewMatrix * vec4(ptPos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    vPtPos = vec2( float(ptX), float(ptY) );
    vVertexIdx = vertexIdx;
    gl_PointSize = ptSize;
}
