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
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useCameraPermission } from 'react-native-vision-camera';
import { captureScreen } from 'react-native-view-shot';
import RNFS from 'react-native-fs';

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
        setHasPermission(cameraGranted === PermissionsAndroid.RESULTS.GRANTED);
        setStoragePermission(storageGranted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const permission = await Camera.requestCameraPermission();
        setHasPermission(permission === 'granted');
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        Camera.requestCameraPermission().then((permission) => {
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
        const videoPath = `${RNFS.ExternalStorageDirectoryPath}/Movies/video_${Date.now()}.mp4`;

        await cameraRef.current.startRecording({
          flash: 'off',
          filePath: videoPath, 
          onRecordingFinished: video => {
            console.log('Saved video:', video);
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
  };

  if (!device) return <Text>No Camera Found</Text>;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        video={true}
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleCamera} style={[styles.button, styles.flipButton]}>
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.button, isRecording ? styles.stopButton : styles.startButton]}
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
  camera: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'black',
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  flipButton: {
    backgroundColor: 'blue',
  },
  startButton: {
    backgroundColor: 'green',
  },
  stopButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
