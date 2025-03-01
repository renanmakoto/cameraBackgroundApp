import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

function App(): React.JSX.Element {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === 'back');

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const permission = await Camera.requestCameraPermission();
        setHasPermission(permission === 'granted');
      }
    };

    requestPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Camera Permission: {hasPermission ? 'Granted' : 'Denied'}</Text>
      {device && hasPermission ? (
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
        />
      ) : (
        <Text>No Camera Available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '80%',
  },
});

export default App;
