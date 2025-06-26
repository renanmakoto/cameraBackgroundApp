package com.camerabackgroundapp

import android.app.*
import android.content.Context
import android.content.Intent
import android.hardware.camera2.*
import android.media.MediaRecorder
import android.os.*
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class ForegroundCameraService : Service() {

    private var cameraDevice: CameraDevice? = null
    private var mediaRecorder: MediaRecorder? = null
    private var cameraSession: CameraCaptureSession? = null
    private var cameraId: String = "0"
    private lateinit var handlerThread: HandlerThread
    private lateinit var cameraHandler: Handler

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startForegroundService()
        handlerThread = HandlerThread("CameraBackgroundThread")
        handlerThread.start()
        cameraHandler = Handler(handlerThread.looper)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        openCamera()
        return START_STICKY
    }

    private fun startForegroundService() {
        val channelId = "CameraServiceChannel"
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Camera Service Channel",
                NotificationManager.IMPORTANCE_LOW
            )
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Background Camera")
            .setContentText("Recording in the background")
            .setSmallIcon(R.mipmap.ic_launcher)
            .build()

        startForeground(1, notification)
    }

    private fun openCamera() {
        try {
            val manager = getSystemService(Context.CAMERA_SERVICE) as CameraManager
            cameraId = manager.cameraIdList[0]

            val stateCallback = object : CameraDevice.StateCallback() {
                override fun onOpened(device: CameraDevice) {
                    cameraDevice = device
                    startRecording()
                }

                override fun onDisconnected(device: CameraDevice) {
                    device.close()
                }

                override fun onError(device: CameraDevice, error: Int) {
                    device.close()
                    Log.e("CameraService", "Camera error: $error")
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                manager.openCamera(cameraId, stateCallback, cameraHandler)
            }
        } catch (e: Exception) {
            Log.e("CameraService", "Failed to open camera: ${e.message}")
        }
    }

    private fun startRecording() {
        try {
            val outputDir = getExternalFilesDir(Environment.DIRECTORY_DCIM)
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val videoFile = File(outputDir, "VID_$timeStamp.mp4")

            mediaRecorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setVideoSource(MediaRecorder.VideoSource.SURFACE)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setOutputFile(videoFile.absolutePath)
                setVideoEncoder(MediaRecorder.VideoEncoder.H264)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setVideoEncodingBitRate(10000000)
                setVideoFrameRate(30)
                setVideoSize(1280, 720)
                prepare()
            }

            val surface = mediaRecorder!!.surface
            val requestBuilder = cameraDevice!!.createCaptureRequest(CameraDevice.TEMPLATE_RECORD).apply {
                addTarget(surface)
            }

            cameraDevice!!.createCaptureSession(
                listOf(surface),
                object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(session: CameraCaptureSession) {
                        cameraSession = session
                        session.setRepeatingRequest(requestBuilder.build(), null, cameraHandler)
                        mediaRecorder?.start()
                        Log.d("CameraService", "Recording started")
                    }

                    override fun onConfigureFailed(session: CameraCaptureSession) {
                        Log.e("CameraService", "Session config failed")
                    }
                },
                cameraHandler
            )

        } catch (e: Exception) {
            Log.e("CameraService", "Failed to start recording: ${e.message}")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopRecording()
        handlerThread.quitSafely()
    }

    private fun stopRecording() {
        try {
            cameraSession?.close()
            cameraDevice?.close()
            mediaRecorder?.apply {
                stop()
                reset()
                release()
            }
            Log.d("CameraService", "Recording stopped and resources released")
        } catch (e: Exception) {
            Log.e("CameraService", "Failed to stop recording: ${e.message}")
        }
    }
}
