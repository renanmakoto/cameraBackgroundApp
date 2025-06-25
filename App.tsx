import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  AppState,
  NativeModules,
} from 'react-native';
import { Camera, useCameraDevices, CameraPermissionRequestResult } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

const { RNFetchBlob, CameraServiceModule } = NativeModules;

const refreshGallery = (filePath: string) => {
  RNFetchBlob.fs
    .scanFile([{ path: filePath, mime: 'video/mp4' }])
    .then(() => console.log('Gallery refreshed:', filePath))
    .catch((err: unknown) => console.error('Error refreshing gallery:', err));
};

export default function App(): React.JSX.Element {
  const [hasPermission, setHasPermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(true);

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === cameraPosition);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const cameraGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        const storageGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        const audioGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        const foregroundServiceGranted = await PermissionsAndroid.request(
          'android.permission.FOREGROUND_SERVICE' as any
        );

        setHasPermission(cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
          audioGranted === PermissionsAndroid.RESULTS.GRANTED &&
          foregroundServiceGranted === PermissionsAndroid.RESULTS.GRANTED);
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
      setIsCameraVisible(false); // unmounts Camera
      await CameraServiceModule.startService(); // background service
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setIsCameraVisible(true); // bring it back if failed
    }
  }
};








const stopRecording = async () => {
  try {
    if (CameraServiceModule?.stopService) {
      await CameraServiceModule.stopService();
    } else {
      console.warn('stopService not implemented in CameraServiceModule');
    }
  } catch (e) {
    console.error('Error stopping service:', e);
  } finally {
    setIsCameraVisible(true); // show camera again
    setIsRecording(false);
  }
};





  if (!device) return <Text>No Camera Found</Text>;

  return (
    <View style={styles.container}>
    {isCameraVisible && (
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        video={true}
        audio={true}
      />
    )}

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
  );
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
});
