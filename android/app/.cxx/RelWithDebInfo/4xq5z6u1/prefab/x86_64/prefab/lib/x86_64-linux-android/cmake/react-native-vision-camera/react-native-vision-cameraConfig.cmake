if(NOT TARGET react-native-vision-camera::VisionCamera)
add_library(react-native-vision-camera::VisionCamera SHARED IMPORTED)
set_target_properties(react-native-vision-camera::VisionCamera PROPERTIES
    IMPORTED_LOCATION "/home/user/Desktop/cameraBackgroundApp/node_modules/react-native-vision-camera/android/build/intermediates/cxx/RelWithDebInfo/53n1e312/obj/x86_64/libVisionCamera.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/user/Desktop/cameraBackgroundApp/node_modules/react-native-vision-camera/android/build/headers/visioncamera"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

