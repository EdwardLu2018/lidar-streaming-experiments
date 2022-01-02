set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

cmake_minimum_required(VERSION 3.0 FATAL_ERROR)
project(pcl_codec)

find_package(PCL 1.12.1 REQUIRED COMPONENTS common io VISUALIZATION)
find_package(OpenCV REQUIRED)

include_directories(${PCL_INCLUDE_DIRS} ${OpenCV_INCLUDE_DIRS})
link_directories(${PCL_LIBRARY_DIRS})
add_definitions(${PCL_DEFINITIONS})

add_executable(octree_encoding
  src/octree/octree_encoding.cpp
)

target_link_libraries(octree_encoding
                      ${PCL_LIBRARIES} 
                      ${PCL_COMMON_LIBRARIES} 
                      ${PCL_IO_LIBRARIES} 
                      ${PCL_VISUALIZATION_LIBRARIES}
                      )

add_executable(octree_decoding
                src/octree/octree_decoding.cpp
)

target_link_libraries(octree_decoding
                      ${PCL_LIBRARIES} 
                      ${PCL_COMMON_LIBRARIES} 
                      ${PCL_IO_LIBRARIES} 
                      ${PCL_VISUALIZATION_LIBRARIES}
                      )

add_executable(xyz_rgb_encoding
                src/depth_image/xyz_rgb_encoding.cpp
)
      
target_link_libraries(xyz_rgb_encoding
                      ${PCL_LIBRARIES} 
                      ${PCL_COMMON_LIBRARIES} 
                      ${PCL_IO_LIBRARIES} 
                      ${PCL_VISUALIZATION_LIBRARIES}
                      ${OpenCV_LIBS}
                      )

add_executable(xyz_rgb_decoding
                src/depth_image/xyz_rgb_decoding.cpp
)
      
target_link_libraries(xyz_rgb_decoding
                      ${PCL_LIBRARIES} 
                      ${PCL_COMMON_LIBRARIES} 
                      ${PCL_IO_LIBRARIES} 
                      ${PCL_VISUALIZATION_LIBRARIES}
                      ${OpenCV_LIBS}
                      )
