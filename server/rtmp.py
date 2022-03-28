import os
import time
import cv2
import subprocess

rtmp_url_rgb = "rtmp://localhost:1935/lidar_rgb/stream_rgb"
rtmp_url_d = "rtmp://localhost:1935/lidar_rgb/stream_d"

rgb_ims = []
for i in range(100):
    if i != 38:
        rgb_ims += [cv2.imread(f"rgb_d_images/{i}_rgb.png")]

d_ims = []
for i in range(100):
    if i != 38:
        d_ims += [cv2.imread(f"rgb_d_images/{i}_depth.png")]

# gather video info to ffmpeg
fps = 30
height, width, _ = rgb_ims[0].shape
print(width, height)

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
           rtmp_url_rgb]

# using subprocess and pipe to fetch frame data
process = subprocess.Popen(command, stdin=subprocess.PIPE)
command[-1] = rtmp_url_d
process2 = subprocess.Popen(command, stdin=subprocess.PIPE)

# process = (
#     ffmpeg
#     .input('pipe:', r='6')
#     .output(rtmp_url, vcodec='libx264', pix_fmt='yuv420p', preset='veryfast',
#     r='20', g='50', video_bitrate='1.4M', maxrate='2M', bufsize='2M', segment_time='6',
#     format='flv')
#     .run_async(pipe_stdin=True)
# )

i = 0
while True:
    frame_rgb = rgb_ims[i % len(rgb_ims)]
    frame_d = d_ims[i % len(d_ims)]

    # write to pipe
    process.stdin.write(frame_rgb.tobytes())
    process2.stdin.write(frame_d.tobytes())

    i += 1

    # time.sleep(1.0 / fps)
