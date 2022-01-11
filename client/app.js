let stats = new Stats();
stats.showPanel(0);
document.getElementById("stats").appendChild(stats.domElement);

let mqttStream = new POINTS.MQTTStreamedVideoSource(
    "arenaxr.org/mqtt/",
    function(msg) {
        console.log(msg);
    }
);
let stream = new POINTS.ARENA3DStream(mqttStream, stats);
let scene = new POINTS.PtCloudViewerScene(60, 1e-4, 1e5);
scene.runloop();
scene.addStream(stream);
