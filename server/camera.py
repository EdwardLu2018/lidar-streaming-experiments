import time
from base_camera import BaseCamera


class Camera(BaseCamera):
    """An emulated camera implementation that streams a repeated sequence of
    files 1.jpg, 2.jpg and 3.jpg at a rate of one frame per second."""
    imgs = [open(f + '.jpg', 'rb').read() for f in ['data/image0', 'data/image1']]

    @staticmethod
    def frames():
        i = 0
        while True:
            yield Camera.imgs[i % 2]
            time.sleep(0.05)
            i = i + 1
