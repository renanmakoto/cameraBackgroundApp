package com.camerabackgroundapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.Environment
import android.os.IBinder
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry
import com.mrousavy.camera.CameraView
import com.mrousavy.camera.VideoCaptureOptions
import com.mrousavy.camera.RecordingSession
import java.io.File

class ForegroundCameraService : Service() {

    private var recordingSession: RecordingSession? = null
    private var cameraView: CameraView? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Log.d("CameraService", "Service created")
        startForegroundService()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("CameraService", "Service started")

        val outputPath = File(
            getExternalFilesDir(Environment.DIRECTORY_DCIM),
            "video_${System.currentTimeMillis()}.mp4"
        ).absolutePath

        cameraView = CameraView(this).apply {
            cameraId = "0" // back camera
            isMuted = false
            enableVideo = true
            enableAudio = true
        }

        val options = VideoCaptureOptions(outputPath)

        recordingSession = cameraView?.startRecording(options)

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("CameraService", "Service destroyed")
        recordingSession?.stopRecording()
        cameraView?.release()
    }

    private fun startForegroundService() {
        val channelId = "CameraServiceChannel"
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel(notificationManager, channelId)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Camera Running")
            .setContentText("Recording video in background")
            .setSmallIcon(R.mipmap.ic_launcher)
            .build()

        startForeground(1, notification)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createNotificationChannel(manager: NotificationManager, channelId: String) {
        val channel = NotificationChannel(
            channelId,
            "Camera Service Channel",
            NotificationManager.IMPORTANCE_DEFAULT
        )
        manager.createNotificationChannel(channel)
    }
}
