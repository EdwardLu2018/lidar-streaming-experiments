import time
import ffmpeg
import cv2
import subprocess

rtmp_url = "rtmp://localhost:1935/lidar/stream"

im1 = cv2.imread("data/rgbd0.png")
im2 = cv2.imread("data/rgbd1.png")
im3 = cv2.imread("data/rgbd2.png")
im4 = cv2.imread("data/rgbd3.png")
ims = [im1, im2, im3, im4]

# gather video info to ffmpeg
fps = 30
height, width, _ = im1.shape
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
           rtmp_url]

# using subprocess and pipe to fetch frame data
process = subprocess.Popen(command, stdin=subprocess.PIPE)

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
    frame = ims[i % len(ims)]

    # write to pipe
    process.stdin.write(frame.tobytes())

    i += 1

    # time.sleep(1.0 / fps)
