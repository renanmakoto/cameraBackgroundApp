package com.camerabackgroundapp

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CameraServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val context = reactContext

    override fun getName(): String = "CameraServiceModule"

    @ReactMethod
    fun stopService() {
        val context = reactApplicationContext
        val intent = Intent(context, CameraService::class.java)
        context.stopService(intent)
    }

}
