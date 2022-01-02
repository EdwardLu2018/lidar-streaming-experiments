#include <pcl/io/pcd_io.h>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>
#include <pcl/compression/octree_pointcloud_compression.h>

#include <iostream>
#include <filesystem>
#include <fstream>
#include <vector>

using namespace std;

namespace fs = std::filesystem;
vector<string> pcd_list;

void read_pcd_list(string directory) {
    cout << "Reading PCD files from directory: " << directory << endl;

    for (const auto & entry : fs::directory_iterator(directory)) {
        string filename = entry.path();
        // check file extension
        if (filename.substr(filename.find_last_of(".") + 1) == "pcd") {
            pcd_list.push_back(filename);
        }
    }
    sort(pcd_list.begin(), pcd_list.end());

    cout << "Number of PCD files: " << pcd_list.size() << endl;
}

int main(int argc, char** argv) {
    if (argc != 2) {
        cerr << "Usage: ./encoding path_to_pcd_directory" << endl;
        return 1;
    }

    string pcd_dir = argv[1];
    read_pcd_list(pcd_dir);

    pcl::io::compression_Profiles_e compressionProfile = pcl::io::HIGH_RES_ONLINE_COMPRESSION_WITHOUT_COLOR;
    pcl::io::OctreePointCloudCompression<pcl::PointXYZ>* PointCloudEncoder;

    bool showStatistics = true;
    PointCloudEncoder = new pcl::io::OctreePointCloudCompression<pcl::PointXYZ>(compressionProfile, showStatistics);

    for (int i = 0; i < pcd_list.size(); i++) {
        pcl::PointCloud<pcl::PointXYZ>::Ptr cloud(new pcl::PointCloud<pcl::PointXYZ>);
        pcl::io::loadPCDFile<pcl::PointXYZ>(pcd_list.at(i), *cloud);

        stringstream compressedData;
        ofstream outfile("compressed_" + std::to_string(i), ofstream::binary);

        PointCloudEncoder->encodePointCloud(cloud, outfile);
    }
    

    return 0;
}
