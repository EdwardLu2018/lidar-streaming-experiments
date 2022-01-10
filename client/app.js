let image = new POINTS.ARENA3DImage('http://192.168.1.157:5000/lidarstream');
let scene = new POINTS.PtCloudViewerScene(60, 1e-4, 1e5);
scene.runloop();
scene.addStream(image);
