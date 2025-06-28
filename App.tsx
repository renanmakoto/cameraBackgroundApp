import React, { useEffect, useState } from 'react';
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

const { CameraServiceModule } = NativeModules;

export default function App(): React.JSX.Element {
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const cameraGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        const audioGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        const storageGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        const foregroundServiceGranted = await PermissionsAndroid.request(
          'android.permission.FOREGROUND_SERVICE' as any
        );

        setHasPermission(
          cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
          audioGranted === PermissionsAndroid.RESULTS.GRANTED &&
          storageGranted === PermissionsAndroid.RESULTS.GRANTED &&
          foregroundServiceGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then(granted => {
          setHasPermission(granted);
        });
      }
    });

    return () => subscription.remove();
  }, []);

  const toggleCamera = () => {
    const newCamera = cameraPosition === 'back' ? 'front' : 'back';
    setCameraPosition(newCamera);
  };

  const startRecording = async () => {
    try {
      await CameraServiceModule.startService(cameraPosition); // pass camera position
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      await CameraServiceModule.stopService();
    } catch (e) {
      console.error('Error stopping service:', e);
    } finally {
      setIsRecording(false);
    }
  };

  if (!hasPermission) return <Text>Permissions not granted</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleCamera} style={styles.flipButton}>
          <Text style={styles.buttonText}>Flip Camera ({cameraPosition})</Text>
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
    justifyContent: 'flex-end',
    backgroundColor: 'black',
  },
  controls: {
    padding: 20,
  },
  flipButton: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: 'blue',
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    padding: 15,
    backgroundColor: 'green',
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButton: {
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
