import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  AppState,
} from 'react-native';
import { Camera, useCameraDevices, CameraPermissionRequestResult } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';

const { RNFetchBlob } = NativeModules;

const refreshGallery = (filePath: string) => {
  RNFetchBlob.fs
    .scanFile([{ path: filePath, mime: 'video/mp4' }])
    .then(() => console.log('Gallery refreshed:', filePath))
    .catch((err: unknown) => console.error('Error refreshing gallery:', err));
};

function App(): React.JSX.Element {
  const [hasPermission, setHasPermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === cameraPosition);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        const storageGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        const audioGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );

        setHasPermission(cameraGranted === PermissionsAndroid.RESULTS.GRANTED);
        setStoragePermission(storageGranted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const permission: CameraPermissionRequestResult = await Camera.requestCameraPermission();
        setHasPermission(permission === 'granted');
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        Camera.requestCameraPermission().then((permission: CameraPermissionRequestResult) => {
          setHasPermission(permission === 'granted');
        });
      }
    });

    return () => subscription.remove();
  }, []);

  const toggleCamera = () => {
    setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        await cameraRef.current.startRecording({
          flash: 'off',
          audio: true,
          onRecordingFinished: async video => {
            console.log('Saved video at:', video.path);

            const newPath = `${RNFS.ExternalStorageDirectoryPath}/DCIM/Camera/video_${Date.now()}.mp4`;
            await RNFS.moveFile(video.path, newPath);
            console.log('Video moved to:', newPath);

            refreshGallery(newPath);

            setIsRecording(false);
          },
          onRecordingError: error => {
            console.error('Recording error:', error);
            setIsRecording(false);
          },
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  }

  if (!device) return <Text>No Camera Found</Text>

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        video={true}
        audio={true}
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleCamera} style={styles.flipButton}>
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={isRecording ? styles.stopButton : styles.startButton}
        >
          <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'black',
  },
  flipButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  startButton: {
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 5,
  },
  stopButton: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})

export default App
