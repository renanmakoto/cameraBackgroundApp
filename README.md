1. Clone the repository
git clone https://github.com/YOUR_USERNAME/cameraBackgroundApp.git
cd cameraBackgroundApp

2. Install dependencies
npm install

3. Navigate to the Android project directory
cd android

4. Build the release APK
./gradlew assembleRelease

5. Return to the root folder (optional)
cd ..

6. Install the APK on your connected Android device
adb install android/app/build/outputs/apk/release/app-release.apk
