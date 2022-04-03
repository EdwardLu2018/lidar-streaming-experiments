const URL_RGBD_1080p = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_rgbd_1080p.m3u8";
const URL_RGBD_720p = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_rgbd_720p.m3u8";
const URL_RGBD_480p = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_rgbd_480p.m3u8";

var ptCloudVideo = null;
var ptCloudScene = null;

var hlsRGBD = null;
if (Hls.isSupported()) {
    hlsRGBD = new Hls();
}

function createVideo() {
    var videoEl = document.createElement("video");
    videoEl.setAttribute("controls", "");
    videoEl.setAttribute("playsinline", "");
    videoEl.setAttribute("type", "application/x-mpegURL");
    videoEl.id = "video-rgbd";
    videoEl.autoplay = true;
    videoEl.loop = true;
    videoEl.muted = true;
    videoEl.crossOrigin = "anonymous";
    videoEl.addEventListener("error", function () {
        console.warn("Unable to create video from stream!!!");
    }, true);

    videoEl.style.width = "480px"
    videoEl.style.display = "block";
    videoEl.style.position = "absolute";
    videoEl.style.zIndex = "9999";

    return videoEl;
}

function setURL(url) {
    return new Promise((resolve) => {
        if (Hls.isSupported()) {
            hlsRGBD.loadSource(url);
            hlsRGBD.attachMedia(videoElRGBD);
            hlsRGBD.on(Hls.Events.MANIFEST_PARSED, function() {
                videoElRGBD.onloadedmetadata = function() {
                    resolve();
                }
            });
        }
        else {
            videoElRGBD.src = url;
            videoElRGBD.onloadedmetadata = function() {
                resolve();
            }
        }
    });
}

var videoElRGBD = createVideo();
document.body.appendChild(videoElRGBD);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const res = urlParams.get("res");

var url = URL_RGBD_1080p;
if (res == "720p") url = URL_RGBD_720p;
if (res == "480p") url = URL_RGBD_480p;

setURL(url)
.then(() => {
    setTimeout(() => {
        console.log("Started!");

        if (!document.getElementById("aframe-video-rgbd")) {
            var videoObjRGBD = document.createElement("a-video");
            videoObjRGBD.setAttribute("id", "aframe-video-rgbd");
            videoObjRGBD.setAttribute("scale", "8 2.25 0.01");
            videoObjRGBD.setAttribute("position", "0 7 -5");
            videoObjRGBD.setAttribute("material", "src", "#video-rgbd");

            var sceneEl = document.querySelector("a-scene");
            sceneEl.appendChild(videoObjRGBD);
        }

        ptCloudVideo = new POINTS.ARENA3DVideo(videoElRGBD, new THREE.Vector3(0, 2, -5));
        ptCloudScene = new POINTS.PtCloudViewerScene();
        ptCloudScene.addStream(ptCloudVideo);
    }, 100);
});
