// const USE_MQTT = false;

// const MQTT_HOST = 'arenaxr.org/mqtt/';
// const HTTP_HOST = 'https://arena-dev1.conix.io:8001/image/lidarstream';

let stats = new Stats();
stats.showPanel(0);
document.getElementById("stats").appendChild(stats.domElement);

// if (USE_MQTT) {
//     let mqttStream = new POINTS.MQTTStreamedVideoSource(
//         MQTT_HOST,
//         function(msg) {
//             console.log(msg);
//         }
//     );
//     let stream = new POINTS.ARENA3DStream(mqttStream, stats);
//     let scene = new POINTS.PtCloudViewerScene(60, 1e-4, 1e5);
//     scene.runloop();
//     scene.addStream(stream);
// }
// else {
//     let image = new POINTS.ARENA3DImage(HTTP_HOST, stats);
//     let scene = new POINTS.PtCloudViewerScene(60, 1e-4, 1e5);
//     scene.runloop();
//     scene.addStream(image);
// }

var videoTag = document.getElementById('video');
var videoTag2 = document.getElementById('video2');
const URL_RGB = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_rgb.m3u8";
const URL_D = "https://arena-dev1.conix.io/dev/lidar_rgb/hls/stream_d.m3u8";
if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(URL_RGB);
    hls.attachMedia(videoTag);
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
    });

    var hls2 = new Hls();
    hls2.loadSource(URL_D);
    hls2.attachMedia(videoTag2);
    hls2.on(Hls.Events.MANIFEST_PARSED, function() {
    });
}
else if (videoTag.canPlayType("application/vnd.apple.mpegurl")) {
    videoTag.src = URL_RGB;
    videoTag.addEventListener("loadedmetadata", function() {
    });

    videoTag2.src = URL_D;
    videoTag2.addEventListener("loadedmetadata", function() {
    });
}

let video = new POINTS.ARENA3DVideo2(videoTag, videoTag2, stats);
let scene = new POINTS.PtCloudViewerScene(60, 1e-4, 1e5);
scene.runloop(stats);
scene.addStream(video);
