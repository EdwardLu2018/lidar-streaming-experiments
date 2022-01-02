import open3d as o3d
import numpy as np
from PIL import Image

file_path = "/Users/Edward/Desktop/pcl_codec/2.pcd"

LIDAR_HOR_RES = 2048
LIDAR_VER_RES = 128

def pcl_to_depth(xyz_points, img_array):
    x = xyz_points[:,0]
    y = xyz_points[:,1]
    z = xyz_points[:,2]
    r = np.sqrt(x**2 + y**2 + z**2)


def main():
    # import point cloud from file
    pcd = o3d.io.read_point_cloud(file_path)
    print(pcd.colors)
    o3d.visualization.draw_geometries([pcd])

    # xyz_points = np.asarray(pcd.points)
    # print(xyz_points.shape)

    # print(np.max(xyz_points, axis=0))
    # print(np.min(xyz_points, axis=0))

    # image = np.loadtxt('../../build/data.txt', delimiter=',')
    # print(image.shape)

    # img = Image.fromarray(np.uint8(image))
    # img.show()

if __name__ == "__main__":
    main()
