#include <pcl/io/pcd_io.h>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>
#include <pcl/compression/octree_pointcloud_compression.h>
// #include <pcl/visualization/pcl_visualizer.h>

#include <iostream>
#include <fstream>

// #define VISUALIZE_POINT_SIZE 5

// void visualizer_init(pcl::visualization::PCLVisualizer::Ptr viewer) {
//     viewer->setBackgroundColor(0, 0, 0);
//     viewer->addCoordinateSystem(1.0);
//     viewer->initCameraParameters();
//     viewer->setPointCloudRenderingProperties(pcl::visualization::PCL_VISUALIZER_POINT_SIZE, VISUALIZE_POINT_SIZE, "cloud");
// }

// void visualization(pcl::visualization::PCLVisualizer::Ptr viewer,
//                     pcl::PointCloud<pcl::PointXYZ>::Ptr cloud) {
//     while(!viewer->wasStopped()) {
//         if (!viewer->updatePointCloud(cloud, "cloud")) {
//             viewer->addPointCloud(cloud, "cloud");
//             viewer->setPointCloudRenderingProperties(pcl::visualization::PCL_VISUALIZER_POINT_SIZE, VISUALIZE_POINT_SIZE, "cloud");
//         }

//         viewer->spinOnce(10);
//     }
// }

int main(int argc, char** argv) {
    if (argc != 2) {
        std::cerr << "Usage: ./decoding path_to_binary_directory" << std::endl;
        return 1;
    }

    std::string binary_file = argv[1];

    pcl::io::OctreePointCloudCompression<pcl::PointXYZ>* PointCloudDecoder;
    PointCloudDecoder = new pcl::io::OctreePointCloudCompression<pcl::PointXYZ>();

    std::stringstream compressedData;
    std::ifstream infile(binary_file, std::ifstream::binary);

    std::cout << "file loaded" << std::endl;

    pcl::PointCloud<pcl::PointXYZ>::Ptr cloud(new pcl::PointCloud<pcl::PointXYZ>);
    PointCloudDecoder->decodePointCloud(infile, cloud);

    std::cout << cloud->size() << std::endl;

    // Uncomment to enable visualization
    // pcl::visualization::PCLVisualizer::Ptr viewer(new pcl::visualization::PCLVisualizer ("3D Viewer"));
    // visualizer_init(viewer);
    // std::cout << "viewer initialized" << std::endl;

    // visualization(viewer, cloud);

    return 0;
}
