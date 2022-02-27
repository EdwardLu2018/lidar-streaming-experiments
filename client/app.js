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
if (Hls.isSupported()) {
    var hls = new Hls();
    // bind them together
    hls.attachMedia(videoTag);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        console.log("video and hls.js are now bound together!");
        hls.loadSource("https://arena-dev1.conix.io/dev/lidartest/hls/stream.m3u8");
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {  });
    });
}

let video = new POINTS.ARENA3DVideo(videoTag, stats);
let scene = new POINTS.PtCloudViewerScene(60, 1e-4, 1e5);
scene.runloop(stats);
scene.addStream(video);
