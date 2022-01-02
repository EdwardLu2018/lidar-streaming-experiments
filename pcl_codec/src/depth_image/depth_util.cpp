// PCL lib for loading and processing point cloud
#include <pcl/io/pcd_io.h>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>

using namespace std;

// Implementing std::rotate for 1D array with type float
void array_right_shift(float array[LIDAR_HOR_RES], int shift_amount, int array_length) {
    float temp, previous;
    for (int i = 0; i < shift_amount; i++) {
        previous = array[array_length - 1];
        for (int j = 0; j < array_length; j++) {
            temp = array[j];
            array[j] = previous;
            previous = temp;
        }
    }
}

// shift the row pixels given the lidar row offset
void shift_pixel_from_meta(float image_array[LIDAR_VER_RES][LIDAR_HOR_RES]) {
    for (int i = 0; i < LIDAR_VER_RES; i++) {
        int shift_num = PIXEL_SHIFT_BY_ROW_128[i];
        array_right_shift(image_array[i], shift_num, LIDAR_HOR_RES);
    }
}

// convert the point cloud data to range image
tuple<float, float> pcl_to_depth(pcl::PointCloud<pcl::PointXYZRGB>::Ptr cloud, 
                                    float image_array[LIDAR_VER_RES][LIDAR_HOR_RES]) {
    float min = 0.0;
    float max = 0.0;

    for (int i = 0; i < LIDAR_VER_RES; i++) {
        for (int j = 0; j < LIDAR_HOR_RES; j++) {
            float x = cloud->at(j, i).x;
            float y = cloud->at(j, i).y;
            float z = cloud->at(j, i).z;

            float r = sqrt(x * x + y * y + z * z);
            image_array[i][j] = r;

            // update min/max values
            if (min > r) {
                min = r;
            }
            if (max < r) {
                max = r;
            }
        }
    }
    return make_tuple(min, max);
}

// normalize the range image to [0,1]
void normalize(float image_array[LIDAR_VER_RES][LIDAR_HOR_RES], tuple<float, float> min_max) {
    float min = get<0>(min_max);
    float max = get<1>(min_max);

    for (int i = 0; i < LIDAR_VER_RES; i++) {
        for (int j = 0; j < LIDAR_HOR_RES; j++) {
            // change * 1.0 at the end to adjust normalization bound
            image_array[i][j] = (image_array[i][j] - min) / (max - min) * 1.0;
        }
    }
}