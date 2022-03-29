
const URL_RGB = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_rgb.m3u8";
const URL_D = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_d.m3u8";

var readyCntr = 0;
const startEvent = new CustomEvent('start', {
    detail: {}
});

var videoTagRGB = document.createElement("video");
videoTagRGB.setAttribute("width", "240px");
videoTagRGB.setAttribute("id", "video_rgb");
videoTagRGB.setAttribute("controls", "1");
videoTagRGB.setAttribute("autoplay", "1");
videoTagRGB.setAttribute("crossorigin", "anonymous");
videoTagRGB.setAttribute("playsinline", "1");
videoTagRGB.setAttribute("muted", "muted");
videoTagRGB.setAttribute("type", "application/x-mpegURL");
videoTagRGB.style.display = "none";
videoTagRGB.style.position = "fixed";
videoTagRGB.style.left = "0px";
videoTagRGB.style.zIndex = "10000";
document.body.appendChild(videoTagRGB);

var videoTagD = document.createElement("video");
videoTagD.setAttribute("width", "240px");
videoTagD.setAttribute("id", "video_d");
videoTagD.setAttribute("controls", "1");
videoTagD.setAttribute("autoplay", "1");
videoTagD.setAttribute("crossorigin", "anonymous");
videoTagD.setAttribute("playsinline", "1");
videoTagD.setAttribute("muted", "muted");
videoTagD.setAttribute("type", "application/x-mpegURL");
videoTagD.style.display = "none";
videoTagD.style.position = "fixed";
videoTagD.style.left = "240px";
videoTagD.style.zIndex = "10000";
document.body.appendChild(videoTagD);

if (Hls.isSupported()) {
    var hlsRGB = new Hls();
    hlsRGB.loadSource(URL_RGB);
    hlsRGB.attachMedia(videoTagRGB);
    hlsRGB.on(Hls.Events.MANIFEST_PARSED, function() {
        window.dispatchEvent(startEvent);
        videoTagRGB.pause();
    });

    var hlsD = new Hls();
    hlsD.loadSource(URL_D);
    hlsD.attachMedia(videoTagD);
    hlsD.on(Hls.Events.MANIFEST_PARSED, function() {
        window.dispatchEvent(startEvent);
        videoTagD.pause();
    });

    videoTagRGB.onloadedmetadata = function() {
        window.dispatchEvent(startEvent);
    }

    videoTagD.onloadedmetadata = function() {
        window.dispatchEvent(startEvent);
    }
}
else if (videoTagRGB.canPlayType("application/vnd.apple.mpegurl")) {
    videoTagRGB.src = URL_RGB;
    videoTagRGB.addEventListener("loadedmetadata", function() {
        window.dispatchEvent(startEvent);
    });

    videoTagD.src = URL_D;
    videoTagD.addEventListener("loadedmetadata", function() {
        window.dispatchEvent(startEvent);
    });
}

window.addEventListener("start", function() {
    readyCntr++;
    if (readyCntr < 4) return;
    console.log("Started!");

    setTimeout(() => {
        videoTagRGB.play();
        videoTagD.play();

        const sceneEl = document.querySelector("a-scene");

        const videoElRGB = document.createElement("a-entity");
        videoElRGB.setAttribute("geometry", "primitive", "plane");
        videoElRGB.setAttribute("rotation.order", "YXZ");
        videoElRGB.setAttribute("id", "rgb");
        videoElRGB.setAttribute("scale", "4 2.25 0.01");
        videoElRGB.setAttribute("position", "-8 5 -6");
        videoElRGB.setAttribute("material", "shader: flat; side: double");
        videoElRGB.setAttribute("muted", "false");
        videoElRGB.setAttribute("autoplay", "true");
        videoElRGB.setAttribute("playsinline", "true");
        videoElRGB.setAttribute("material", "src", "#video_rgb");
        sceneEl.appendChild(videoElRGB);

        const videoElD = document.createElement("a-entity");
        videoElD.setAttribute("geometry", "primitive", "plane");
        videoElD.setAttribute("rotation.order", "YXZ");
        videoElD.setAttribute("id", "depth");
        videoElD.setAttribute("scale", "4 2.25 0.01");
        videoElD.setAttribute("position", "8 5 -6");
        videoElD.setAttribute("material", "shader: flat; side: double");
        videoElD.setAttribute("muted", "false");
        videoElD.setAttribute("autoplay", "true");
        videoElD.setAttribute("playsinline", "true");
        videoElD.setAttribute("material", "src", "#video_d");
        sceneEl.appendChild(videoElD);

        let video = new POINTS.ARENA3DVideo(videoTagRGB, videoTagD, new THREE.Vector3(0, 2, -5));
        let scene = new POINTS.PtCloudViewerScene();
        scene.addStream(video);

    }, 100);
});

// videoTagRGB.addEventListener('timeupdate', (event) => {
//     videoTagD.currentTime = videoTagRGB.currentTime;
// });
