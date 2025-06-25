package com.camerabackgroundapp

import android.app.Service
import android.content.Intent
import android.os.IBinder

class CameraService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // You can add logging or logic here
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        // Cleanup if needed
    }
}
