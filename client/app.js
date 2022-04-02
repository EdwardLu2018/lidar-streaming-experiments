const URL_RGBD_1080p = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_rgbd_1080p.m3u8";
const URL_RGBD_720p = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_rgbd_720p.m3u8";

const width_1080p = 2 * 1920;
const height_1080p = 1080;

// const width_720p = 2 * 1280;
// const height_720p = 720;

var supportsHLS = false;
var readyCntr = 0;
const startEvent = new CustomEvent('start', {
    detail: {}
});

function createVideo() {
    var videoTag = document.createElement("video");
    videoTag.setAttribute("width", "240");
    videoTag.setAttribute("id", "video_rgbd");
    videoTag.setAttribute("controls", "true");
    videoTag.setAttribute("autoplay", "true");
    videoTag.setAttribute("crossorigin", "anonymous");
    videoTag.setAttribute("playsinline", "true");
    videoTag.setAttribute("muted", "true");
    videoTag.setAttribute("type", "application/x-mpegURL");
    videoTag.style.display = "none";
    videoTag.style.position = "fixed";
    videoTag.style.left = "0px";
    videoTag.style.zIndex = "10000";

    return videoTag;
}

var videoTagRGBD = createVideo();
document.body.appendChild(videoTagRGBD);

if (Hls.isSupported()) {
    var hlsRGBD = new Hls();
    hlsRGBD.loadSource(URL_RGBD_1080p);
    hlsRGBD.attachMedia(videoTagRGBD);
    hlsRGBD.on(Hls.Events.MANIFEST_PARSED, function() {
        window.dispatchEvent(startEvent);
    });

    videoTagRGBD.onloadedmetadata = function() {
        window.dispatchEvent(startEvent);
    }

    supportsHLS = true;
}
else if (videoTagRGBD.canPlayType("application/vnd.apple.mpegurl")) {
    videoTagRGBD.src = URL_RGBD_1080p;
    videoTagRGBD.addEventListener("loadedmetadata", function() {
        window.dispatchEvent(startEvent);
    });

    supportsHLS = false;
}

window.addEventListener("start", function() {
    readyCntr++;
    if (supportsHLS && readyCntr < 2) return;
    if (!supportsHLS && readyCntr < 1) return;
    console.log("Started!");

    var sceneEl = document.querySelector("a-scene");

    var videoElRGBD = document.createElement("a-entity");
    videoElRGBD.setAttribute("geometry", "primitive", "plane");
    videoElRGBD.setAttribute("rotation.order", "YXZ");
    videoElRGBD.setAttribute("id", "rgb");
    videoElRGBD.setAttribute("scale", "8 2.25 0.01");
    videoElRGBD.setAttribute("position", "0 7 -5");
    videoElRGBD.setAttribute("material", "shader: flat; side: double");
    videoElRGBD.setAttribute("muted", "true");
    videoElRGBD.setAttribute("autoplay", "true");
    videoElRGBD.setAttribute("playsinline", "true");
    videoElRGBD.setAttribute("material", "src", "#video_rgbd");
    sceneEl.appendChild(videoElRGBD);

    setTimeout(() => {
        var video = new POINTS.ARENA3DVideo(videoTagRGBD, width_1080p, height_1080p, new THREE.Vector3(0, 2, -5));
        var scene = new POINTS.PtCloudViewerScene();
        scene.addStream(video);
    }, 100);
});
