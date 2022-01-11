let stats = new Stats();
stats.showPanel(0);
document.getElementById("stats").appendChild(stats.domElement);

let image = new POINTS.ARENA3DImage('http://192.168.1.157:5000/lidarstream', stats);
let scene = new POINTS.PtCloudViewerScene(60, 1e-4, 1e5);
scene.runloop();
scene.addStream(image);
