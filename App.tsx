import React, { useEffect, useRef, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { NativeModules } from 'react-native';

const { CameraService } = NativeModules;

export default function App() {
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(true);

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      const microphonePermission = await Camera.requestMicrophonePermission();

      if (Platform.OS === 'android') {
        const storagePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        const foregroundServicePermission = await PermissionsAndroid.request(
          'android.permission.FOREGROUND_SERVICE' as PermissionsAndroid.Permission
        );
        const backgroundCameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );

        if (
          cameraPermission === 'authorized' &&
          microphonePermission === 'authorized' &&
          storagePermission === PermissionsAndroid.RESULTS.GRANTED &&
          foregroundServicePermission === PermissionsAndroid.RESULTS.GRANTED &&
          backgroundCameraPermission === PermissionsAndroid.RESULTS.GRANTED
        ) {
          setHasPermission(true);
        }
      } else {
        setHasPermission(
          cameraPermission === 'authorized' &&
            microphonePermission === 'authorized'
        );
      }
    };

    requestPermissions();
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setIsCameraVisible(false); // hide foreground camera
      await CameraService.startService(); // start background camera service
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      await CameraService.stopService();
      setIsRecording(false);
      setIsCameraVisible(true); // show foreground camera
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  if (device == null || !hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isCameraVisible && (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isCameraVisible}
          video={true}
          audio={true}
        />
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    padding: 15,
    backgroundColor: '#ff5555',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
