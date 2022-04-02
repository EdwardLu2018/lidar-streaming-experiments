const URL_RGBD_1080p = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_rgbd_1080p.m3u8";
const URL_RGBD_720p = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_rgbd_720p.m3u8";

const width = 2 * 1920;
const height = 1080;

// const width = 2 * 1280;
// const height = 720;

var supportsHLS = false;
var readyCntr = 0;
const startEvent = new CustomEvent('start', {
    detail: {}
});

var videoTagRGBD = document.createElement("video");
videoTagRGBD.setAttribute("width", "240");
videoTagRGBD.setAttribute("id", "video_rgbd");
videoTagRGBD.setAttribute("controls", "true");
videoTagRGBD.setAttribute("autoplay", "true");
videoTagRGBD.setAttribute("crossorigin", "anonymous");
videoTagRGBD.setAttribute("playsinline", "true");
videoTagRGBD.setAttribute("muted", "true");
videoTagRGBD.setAttribute("type", "application/x-mpegURL");
videoTagRGBD.style.display = "none";
videoTagRGBD.style.position = "fixed";
videoTagRGBD.style.left = "0px";
videoTagRGBD.style.zIndex = "10000";
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
        var video = new POINTS.ARENA3DVideo(videoTagRGBD, width, height, new THREE.Vector3(0, 2, -5));
        var scene = new POINTS.PtCloudViewerScene();
        scene.addStream(video);
    }, 100);
});
