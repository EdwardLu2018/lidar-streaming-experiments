#include <cmath>    // for coordinate transform (e.g. atan2, asin, etc.)

// OpenCV for loading image, extracting image color and visualization 
// Use libjpeg as alternative
// PCL Visualizer for point cloud visualization only
#include <opencv2/core.hpp>
#include <opencv2/highgui.hpp>
// #include <pcl/visualization/pcl_visualizer.h>

// PCL lib for loading and processing point cloud
#include <pcl/io/pcd_io.h>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>

// LIDAR Beam Param
#define LIDAR_HOR_RES 2048
#define LIDAR_VER_RES 128
#define XYZ_BGR_HOR_RES LIDAR_HOR_RES*2

// 360 Camera Image Params
#define PI 3.14159265
#define R 6720/(2*PI)
#define PANO_H_RES 6720
#define PANO_V_RES 3360

// Point Cloud Visualization Param
#define VISUALIZE_POINT_SIZE 5

#define PCD_FILE_PATH "../2.pcd"
#define IMAGE_PATH "../2.JPG"


using namespace std;
using namespace cv; // OpenCV for image color extraction and visualization

// LIDAR intrinsic pixel shift depending on beam config
int PIXEL_SHIFT_BY_ROW_128[128] = {130,88,47,7,127,87,48,9,125,86,48,11,123,86,49,12,121,85,49,13,120,84,49,14,119,84,49,15,118,83,49,16,116,83,50,16,116,83,50,17,115,82,50,17,114,82,50,17,114,82,50,18,113,81,50,18,113,81,49,18,113,81,49,18,113,81,49,17,113,81,49,17,113,81,49,17,113,81,49,16,113,81,48,16,113,81,48,15,113,81,48,14,114,80,47,14,114,81,47,13,115,81,46,12,116,81,46,10,116,81,45,9,118,81,44,7,119,81,43,5,120,82,43,3,122,82,42,0};
int PIXEL_SHIFT_BY_ROW_64[64] = {86,6,85,8,84,9,84,11,83,12,83,13,82,14,82,15,81,15,81,16,81,16,81,17,80,17,80,17,80,17,80,17,80,17,80,17,80,16,80,16,80,15,80,15,80,14,80,13,80,12,80,11,80,10,80,9,81,7,81,5,81,3,82,0};


// convert the point cloud data to range image
void pcl_to_image(pcl::PointCloud<pcl::PointXYZRGB>::Ptr cloud, 
                uint8_t xyz_rgb_image[LIDAR_VER_RES][LIDAR_HOR_RES][3], bool is_xyz) {
    if (is_xyz) {
        // put xyz coordinates into left half of image
        for (int i = 0; i < LIDAR_VER_RES; i++) {
            for (int j = 0; j < LIDAR_HOR_RES; j++) {
                float x = cloud->at(j, i).x * 9 + 128;    // 9 is the multiplier so that after multiplication
                float y = cloud->at(j, i).y * 9 + 128;    // the largest value stays just below abs(255/2)
                float z = cloud->at(j, i).z * 9 + 128;    // add 128 to use [0,256] range to support both positive and negative

                // if (x > 255 || y > 255 || z > 255 || x < 0 || y < 0 || z < 0)
                // std::cout << x << " " << y << " " << z << std::endl;

                xyz_rgb_image[i][j][0] = uint8_t(x);
                xyz_rgb_image[i][j][1] = uint8_t(y);
                xyz_rgb_image[i][j][2] = uint8_t(z);

                cout << "x: " << unsigned(xyz_rgb_image[i][j][0]) <<
                " y: " << unsigned(xyz_rgb_image[i][j][1]) <<
                " z: " << unsigned(xyz_rgb_image[i][j][2]) << endl;
            }
        }
    } else {
        // put rgb into right half of image
        for (int i = 0; i < LIDAR_VER_RES; i++) {
            for (int j = 0; j < LIDAR_HOR_RES; j++) {
                xyz_rgb_image[i][j][0] = uint8_t(cloud->at(j, i).b);
                xyz_rgb_image[i][j][1] = uint8_t(cloud->at(j, i).g);
                xyz_rgb_image[i][j][2] = uint8_t(cloud->at(j, i).r);
            }
        }
    }
}

// Implementing std::rotate for 3-channel image with type uint_8
void array_right_shift(uint8_t array[LIDAR_HOR_RES][3], int shift_amount, int array_length) {
    uint8_t temp, previous;
    for (int channel = 0; channel < 3; channel++) {
        for (int i = 0; i < shift_amount; i++) {
            previous = array[array_length - 1][channel];
            for (int j = 0; j < array_length; j++) {
                temp = array[j][channel];
                array[j][channel] = previous;
                previous = temp;
            }
        }
    }
}

// Shift point cloud pixel based on lidar intrinsic beam configuration
void shift_pixel(uint8_t image[LIDAR_VER_RES][LIDAR_HOR_RES][3]) {
    for (int i = 0; i < LIDAR_VER_RES; i++) {
        int shift_num = PIXEL_SHIFT_BY_ROW_128[i];
        array_right_shift(image[i], shift_num, LIDAR_HOR_RES);
    }
}

// Horizontally stitch the xyz and bgr image
void stitch_image(uint8_t xyz_image[LIDAR_VER_RES][LIDAR_HOR_RES][3], 
                    uint8_t bgr_image[LIDAR_VER_RES][LIDAR_HOR_RES][3], 
                    uint8_t xyz_bgr_image[LIDAR_VER_RES][XYZ_BGR_HOR_RES][3]) {
    for (int i = 0; i < LIDAR_VER_RES; i++) {
        for (int j = 0; j < LIDAR_HOR_RES; j++) {
            for (int k = 0; k < 3; k++) {
                xyz_bgr_image[i][j][k] = xyz_image[i][j][k];
            }
        }

        for (int j = LIDAR_HOR_RES; j < XYZ_BGR_HOR_RES; j++) {
            for (int k = 0; k < 3; k++) {
                xyz_bgr_image[i][j][k] = bgr_image[i][j][k];
            }
        }
    }
}

// Convert cartesian coordinates into spherical coordinates
void cartesian_to_spherical(float point_xyz[3], float point_spherical[3]) {
    float x = point_xyz[0];
    float y = point_xyz[1];
    float z = -point_xyz[2];

    float r = sqrt(x * x + y * y + z * z);
    float theta = -atan2(y, x);
    float phi = (90.0 * PI / 180.0) - acos(z / r);

    point_spherical[0] = theta;
    point_spherical[1] = phi;
    point_spherical[2] = r;
}

// Map spherical coordinates into camera equirectangular image uv coordinates
void spherical_to_equirectangular(float point_spherical[3], int pixel[2]) {
    int x = floor(R * point_spherical[0] * cos(point_spherical[1]));
    int y = floor(R * point_spherical[1]);

    pixel[0] = x;
    pixel[1] = y;
}

// Assign color to point cloud based on point coordinate matching with 360 image
void color_pcl(pcl::PointCloud<pcl::PointXYZRGB>::Ptr cloud, Mat rgb_image) {
    // Check if point lies in the camera FOV
    for(pcl::PointCloud<pcl::PointXYZRGB>::iterator it = cloud->begin(); it != cloud->end(); it++) {
        float point_xyz[3] = {it->x, it->y, it->z};

        // skip for points too close
        if (sqrt(point_xyz[0] * point_xyz[0] + point_xyz[1] * point_xyz[1] + point_xyz[2] * point_xyz[2]) < 0.3) {
            continue;
        }

        // convert to spherical coordinate and then to equirectangular coordinate
        float point_spherical[3];
        cartesian_to_spherical(point_xyz, point_spherical);
        int pixel[2];
        spherical_to_equirectangular(point_spherical, pixel);

        // find corresponding image pixel
        int image_pixel[2] = {pixel[0] + PANO_H_RES / 2, pixel[1] + PANO_V_RES / 2};

        // extract color from camera image based on point cloud coordinate
        // use libjpeg as alternative
        cv::Vec3b pixel_color = rgb_image.at<cv::Vec3b>(image_pixel[1], image_pixel[0]);

        it->r = pixel_color[2];
        it->g = pixel_color[1];
        it->b = pixel_color[0];
    }
}

// Init point cloud visualizer
// pcl::visualization::PCLVisualizer::Ptr visualize_pcl(pcl::PointCloud<pcl::PointXYZRGB>::Ptr cloud) {
//     pcl::visualization::PCLVisualizer::Ptr viewer(new pcl::visualization::PCLVisualizer ("3D Viewer"));
//     viewer->setBackgroundColor(0, 0, 0);
//     viewer->addPointCloud<pcl::PointXYZRGB>(cloud, "cloud");
//     viewer->setPointCloudRenderingProperties(pcl::visualization::PCL_VISUALIZER_POINT_SIZE, VISUALIZE_POINT_SIZE, "cloud");
//     viewer->addCoordinateSystem(1.0);
//     viewer->initCameraParameters();

//     return viewer;
// }

int main(int argc, char **argv) {
    pcl::PointCloud<pcl::PointXYZRGB>::Ptr cloud(new pcl::PointCloud<pcl::PointXYZRGB>);
    pcl::io::loadPCDFile<pcl::PointXYZRGB>(PCD_FILE_PATH, *cloud);

    // load RGB image and assign color to point cloud
    // use libjpeg as alternative
    Mat rgb_image = imread(IMAGE_PATH);
    color_pcl(cloud, rgb_image);

    // //Uncomment to enable point cloud visualization
    // pcl::visualization::PCLVisualizer::Ptr viewer;
    // viewer = visualize_pcl(cloud);
    // while(!viewer->wasStopped()) {
    //     viewer->spinOnce();
    // }

    ////////////////////////////////////////////
    // Image Channel    xyz_image   bgr_image //
    //      0               x           b     //
    //      1               y           g     //
    //      2               z           r     //
    ////////////////////////////////////////////

    //////////////////////////////////////////////
    //    Image Resolution (height x width)     //
    //  xyz_image   bgr_image   xyz_bgr_image   //
    //   128x2048    128x2048     128x4096      //
    //////////////////////////////////////////////

    // xyz encoding: coordinate * 9 + 128
    // fits positive and negative coordinates to [0,255]
    // for this specific dataset, point largest coordinate is 13.4m and minimum is -12.5m

    // Use uint_8 type to store value [0-255]
    uint8_t xyz_image[LIDAR_VER_RES][LIDAR_HOR_RES][3];
    uint8_t bgr_image[LIDAR_VER_RES][LIDAR_HOR_RES][3];
    // convert point xyz into 2d image (3 channel)
    pcl_to_image(cloud, xyz_image, true);
    // convert point bgr into 2d image (3 channel)
    pcl_to_image(cloud, bgr_image, false);
    // shift pixels according to lidar intrinsic beam config
    shift_pixel(xyz_image);
    shift_pixel(bgr_image);

    // horizontally stitch xyz and bgr images
    // stitched image is 128 x 4096
    uint8_t xyz_bgr_image[LIDAR_VER_RES][XYZ_BGR_HOR_RES][3];
    stitch_image(xyz_image, bgr_image, xyz_bgr_image);

    // Uncomment to visualize stitched image and store as jpg
    Mat xyzrgb_img = Mat(LIDAR_VER_RES, XYZ_BGR_HOR_RES, CV_8UC3, xyz_bgr_image);
    imshow("image", xyzrgb_img);
    waitKey(0);
    imwrite("image.jpg", xyzrgb_img);

    return 0;
}
