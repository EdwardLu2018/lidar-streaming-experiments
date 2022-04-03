import os
import time
import cv2
import subprocess

rtmp_url_1080p = "rtmp://localhost:1935/lidar_rgb/stream_rgbd_1080p"
rtmp_url_720p = "rtmp://localhost:1935/lidar_rgb/stream_rgbd_720p"
rtmp_url_480p = "rtmp://localhost:1935/lidar_rgb/stream_rgbd_480p"

rgbd_ims_1080p = []
rgbd_ims_720p = []
rgbd_ims_480p = []
for i in range(100):
    if i != 10:
        im = cv2.imread(f"rgbd_images/{i}.png")
        rgbd_ims_1080p += [im]
        rgbd_ims_720p += [cv2.resize(im, (2*1280,720), fx=0, fy=0, interpolation=cv2.INTER_AREA)]
        rgbd_ims_480p += [cv2.resize(im, (2*854,480), fx=0, fy=0, interpolation=cv2.INTER_AREA)]

# gather video info to ffmpeg
fps = 30
height, width, _ = rgbd_ims_1080p[0].shape
# print(width, height)

# command and params for ffmpeg
command = ['ffmpeg',
           '-y',
           '-f', 'rawvideo',
           '-vcodec', 'rawvideo',
           '-pix_fmt', 'bgr24',
           '-s', "{}x{}".format(width, height),
           '-r', str(fps),
           '-i', '-',
           '-c:v', 'libx264',
           '-pix_fmt', 'yuv420p',
           '-preset', 'ultrafast',
           '-f', 'flv',
           rtmp_url_1080p]

# using subprocess and pipe to fetch frame data
process_1080p = subprocess.Popen(command, stdin=subprocess.PIPE)

height, width, _ = rgbd_ims_720p[0].shape
command[9] = "{}x{}".format(width, height)
command[-1] = rtmp_url_720p
process_720p = subprocess.Popen(command, stdin=subprocess.PIPE)

height, width, _ = rgbd_ims_480p[0].shape
command[9] = "{}x{}".format(width, height)
command[-1] = rtmp_url_480p
process_480p = subprocess.Popen(command, stdin=subprocess.PIPE)

i = 0
while True:
    frame_1080p = rgbd_ims_1080p[i % len(rgbd_ims_1080p)]
    # write to pipe
    process_1080p.stdin.write(frame_1080p.tobytes())

    frame_720p = rgbd_ims_720p[i % len(rgbd_ims_720p)]
    # write to pipe
    process_720p.stdin.write(frame_720p.tobytes())

    frame_480p = rgbd_ims_480p[i % len(rgbd_ims_480p)]
    # write to pipe
    process_480p.stdin.write(frame_480p.tobytes())

    i += 1

    # time.sleep(1.0 / fps)
