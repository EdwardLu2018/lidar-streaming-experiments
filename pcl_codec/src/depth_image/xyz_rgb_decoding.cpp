#include <iostream>

#include <opencv2/core.hpp>
#include <opencv2/highgui.hpp>

// PCL lib for loading and processing point cloud
#include <pcl/io/pcd_io.h>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>
#include <pcl/visualization/pcl_visualizer.h>

#define IMAGE_PATH "../src/depth_image/image.jpg"

// LIDAR Beam Param
#define LIDAR_HOR_RES 2048
#define LIDAR_VER_RES 128
#define XYZ_BGR_HOR_RES LIDAR_HOR_RES*2
#define TOTAL_PIXEL_COUNT LIDAR_VER_RES*XYZ_BGR_HOR_RES*3

// Point Cloud Visualization Param
#define VISUALIZE_POINT_SIZE 3

using namespace std;

// OpenCV assumes unsigned char * type for data field in cv::MAT
// Converts from unsigned char * to uint8_t [0,255]
void convert_uint(unsigned char *image_array, uint8_t xyz_bgr_image[TOTAL_PIXEL_COUNT]) {
    for (unsigned int i = 0; i < TOTAL_PIXEL_COUNT; i++) {
        // cout << unsigned(image_array[i]) << endl;
        xyz_bgr_image[i] = uint8_t(image_array[i]);
    }
}

// Reshapes 1D MAT data array to 3D (3-channel) xyz and bgr image array
void xyz_bgr_decode(uint8_t *xyz_bgr_image,
                uint8_t xyz_image[LIDAR_VER_RES][LIDAR_HOR_RES][3],
                uint8_t bgr_image[LIDAR_VER_RES][LIDAR_HOR_RES][3]) {
    for (int i = 0; i < LIDAR_VER_RES; i++) {
        for (int j = 0; j < XYZ_BGR_HOR_RES; j++) {
            int index = i*XYZ_BGR_HOR_RES*3 + j*3;
            if (j < LIDAR_HOR_RES) {
                for (int k = 0; k < 3; k++) {
                    xyz_image[i][j][k] = xyz_bgr_image[index + k];
                }
            } else {
                for (int k = 0; k < 3; k++) {
                    bgr_image[i][j][k] = xyz_bgr_image[index + k];
                }
            }
        }
    }
}

// Decode xyz and bgr images and add all decoded points (XYZ+RGB) to cloud
void decode_xyz_rgb(uint8_t xyz_image[LIDAR_VER_RES][LIDAR_HOR_RES][3],
                    uint8_t bgr_image[LIDAR_VER_RES][LIDAR_HOR_RES][3],
                    pcl::PointCloud<pcl::PointXYZRGB>::Ptr cloud) {
    for (int i = 0; i < LIDAR_VER_RES; i++) {
        for (int j = 0; j < LIDAR_HOR_RES; j++) {
            float x = (xyz_image[i][j][0] - 128) / 9.0;
            float y = (xyz_image[i][j][1] - 128) / 9.0;
            float z = (xyz_image[i][j][2] - 128) / 9.0;

            uint8_t b = bgr_image[i][j][0];
            uint8_t g = bgr_image[i][j][1];
            uint8_t r = bgr_image[i][j][2];

            pcl::PointXYZRGB p;
            p.x = x;
            p.y = y;
            p.z = z;
            p.r = r;
            p.b = b;
            p.g = g;
            cloud->push_back(p);
        }
    }
}

// Init point cloud visualizer
pcl::visualization::PCLVisualizer::Ptr visualize_pcl(pcl::PointCloud<pcl::PointXYZRGB>::Ptr cloud) {
    pcl::visualization::PCLVisualizer::Ptr viewer(new pcl::visualization::PCLVisualizer ("3D Viewer"));
    viewer->setBackgroundColor(52.0/255.0, 58.0/255.0, 64.0/255.0);
    viewer->addPointCloud<pcl::PointXYZRGB>(cloud, "cloud");
    viewer->setPointCloudRenderingProperties(pcl::visualization::PCL_VISUALIZER_POINT_SIZE, VISUALIZE_POINT_SIZE, "cloud");
    viewer->addCoordinateSystem(1.0);
    viewer->initCameraParameters();

    return viewer;
}

int main(int argc, char** argv) {
    // OpenCV load image
    // use libjpeg as alternative
    cv::Mat image = cv::imread(IMAGE_PATH, -1);
    cout << image.size() << endl;
    cout << "is continuous: " << image.isContinuous() << endl;

    // Uncomment to show loaded image
    // cv::imshow("Display window", image);
    // cv::waitKey(0);

    // create pointer to point to loaded image array
    unsigned char *image_array;
    image_array = image.data;

    // allocate space for large xyz_bgr array
    uint8_t* xyz_bgr_image = new uint8_t[TOTAL_PIXEL_COUNT];
    // convert every pixel value to uint8_t [0,255]
    // OpenCV MAT defaults to unsigned char * type
    convert_uint(image_array, xyz_bgr_image);

    // allocate space for xyz and bgr image array
    auto xyz_image = new uint8_t[LIDAR_VER_RES][LIDAR_HOR_RES][3];
    auto bgr_image = new uint8_t[LIDAR_VER_RES][LIDAR_HOR_RES][3];
    // reshapes data from 1D xyz_bgr array to 3D image array
    xyz_bgr_decode(xyz_bgr_image, xyz_image, bgr_image);

    // PCL Library here for point cloud visualization
    pcl::PointCloud<pcl::PointXYZRGB>::Ptr cloud(new pcl::PointCloud<pcl::PointXYZRGB>);
    decode_xyz_rgb(xyz_image, bgr_image, cloud);
    // Pass null to last param to discard visualization step
    // decode_xyz_rgb(xyz_image, bgr_image, nullptr);

    // Uncomment to show xyz and bgr images
    // cv::Mat xyz = cv::Mat(LIDAR_VER_RES, LIDAR_HOR_RES, CV_8UC3, xyz_image);
    // cv::imshow("Display window", xyz);
    // cv::waitKey(0);

    // cv::Mat bgr = cv::Mat(LIDAR_VER_RES, LIDAR_HOR_RES, CV_8UC3, bgr_image);
    // cv::imshow("Display window", bgr);
    // cv::waitKey(0);

    // Uncomment to enable point cloud visualization
    pcl::visualization::PCLVisualizer::Ptr viewer;
    viewer = visualize_pcl(cloud);
    while(!viewer->wasStopped()) {
        viewer->spinOnce();
    }


    return 0;
}
