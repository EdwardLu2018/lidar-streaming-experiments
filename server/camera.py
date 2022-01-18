import time
from base_camera import BaseCamera


class Camera(BaseCamera):
    imgs = [open(f + '.jpg', 'rb').read() for f in ['data/image0', 'data/image1']]

    @staticmethod
    def frames():
        i = 0
        while True:
            yield Camera.imgs[i % 2]
            time.sleep(0.05)
            i = i + 1
