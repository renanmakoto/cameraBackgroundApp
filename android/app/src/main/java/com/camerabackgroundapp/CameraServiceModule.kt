package com.camerabackgroundapp

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CameraServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "CameraService"

    @ReactMethod
    fun startService() {
        val intent = Intent(reactApplicationContext, ForegroundCameraService::class.java)
        reactApplicationContext.startForegroundService(intent)
    }

    @ReactMethod
    fun stopService() {
        val intent = Intent(reactApplicationContext, ForegroundCameraService::class.java)
        reactApplicationContext.stopService(intent)
    }
}
