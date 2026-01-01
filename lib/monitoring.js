import { publicFetch, sessionTokenUtils } from "./public-api";

/**
 * Interview Monitoring System
 * Tracks candidate behavior and security events
 */

const FACE_DETECTION_INTERVAL = 2000; // Check every 2 seconds
const FACE_MISSING_THRESHOLD = 10000; // Alert if face missing for 10 seconds
const AUDIO_SILENCE_THRESHOLD = 60000; // Alert if silent for 60 seconds

class InterviewMonitoring {
  constructor(interviewToken, sessionToken, onAlert) {
    this.interviewToken = interviewToken;
    this.sessionToken = sessionToken;
    this.onAlert = onAlert;
    
    this.tabSwitchCount = 0;
    this.faceMissingCount = 0;
    this.faceMissingDuration = 0;
    this.audioSilenceDuration = 0;
    
    this.isMonitoring = false;
    this.lastFaceDetectedTime = Date.now();
    this.lastAudioTime = Date.now();
    this.faceDetectionTimer = null;
    this.audioMonitoringTimer = null;
  }

  /**
   * Initialize all monitoring listeners
   */
  async initialize(videoElement, audioStream) {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Tab switch detection (lightweight)
    this.setupTabSwitchDetection();

    // Escape key blocker
    this.setupEscapeKeyBlocker();

    // Face detection (if video element provided)
    if (videoElement) {
      await this.startFaceDetection(videoElement);
    }

    // Audio monitoring (if audio stream provided)
    if (audioStream) {
      this.startAudioMonitoring(audioStream);
    }
  }

  /**
   * Setup tab switch detection
   */
  setupTabSwitchDetection() {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.tabSwitchCount++;
        // Report silently - don't block if API fails
        this.reportEvent("tab_switch", "warning").catch(() => {});

        if (this.onAlert) {
          this.onAlert({
            type: "tab_switch",
            title: "Tab Switch Detected",
            message: "You switched tabs during the interview.",
            severity: "warning",
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    this.visibilityChangeHandler = handleVisibilityChange;
  }

  /**
   * Setup fullscreen enforcement
   */
  setupFullscreenEnforcement() {
    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement && this.isMonitoring) {
        await this.reportEvent("fullscreen_exit", "critical");

        // Try to re-enter fullscreen
        try {
          await document.documentElement.requestFullscreen();
        } catch (err) {
          if (this.onAlert) {
            this.onAlert({
              type: "fullscreen_exit",
              title: "Fullscreen Required",
              message:
                "This interview requires fullscreen mode. Please enable fullscreen to continue.",
              severity: "critical",
            });
          }
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    this.fullscreenChangeHandler = handleFullscreenChange;
  }

  /**
   * Block Escape key to prevent fullscreen exit
   */
  setupEscapeKeyBlocker() {
    const handleKeyDown = async (e) => {
      if (e.key === "Escape" && document.fullscreenElement) {
        e.preventDefault();
        await this.reportEvent("fullscreen_exit_attempt", "warning");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    this.escapeKeyHandler = handleKeyDown;
  }

  /**
   * Detect if developer tools are open
   */
  setupDevToolsDetection() {
    // Check for devtools width
    const handleDevToolsCheck = async () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        // Report silently - don't block if API fails
        this.reportEvent("document_access", "critical", {
          accessType: "devtools",
        }).catch(() => {});

        if (this.onAlert) {
          this.onAlert({
            type: "document_access",
            title: "Developer Tools Detected",
            message:
              "Opening developer tools is not allowed during the interview.",
            severity: "critical",
          });
        }
      }
    };

    // Check periodically
    setInterval(handleDevToolsCheck, 5000);
  }

  /**
   * Start face detection monitoring
   */
  async startFaceDetection(videoElement) {
    // Note: This is a placeholder for actual face detection
    // In production, you would use TensorFlow.js with BlazeFace or similar
    // For now, we'll check if video is playing and has content

    const checkFacePresence = async () => {
      if (!this.isMonitoring) return;

      try {
        // Guard: check if video has loaded and has valid dimensions
        if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          return; // Video not ready yet, skip this check
        }

        // Simple check: if video element has content
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Double-check dimensions before setting
        if (canvas.width === 0 || canvas.height === 0) {
          canvas.width = Math.max(videoElement.videoWidth, 1);
          canvas.height = Math.max(videoElement.videoHeight, 1);
        } else {
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
        }

        // Guard again before drawImage
        if (canvas.width === 0 || canvas.height === 0) {
          return; // Still invalid, skip
        }

        ctx.drawImage(videoElement, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Check if there's significant content (not black)
        let nonBlackPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 30 || g > 30 || b > 30) {
            nonBlackPixels++;
          }
        }

        const contentPercentage = nonBlackPixels / (canvas.width * canvas.height);

        // If more than 10% content, consider face present
        if (contentPercentage > 0.1) {
          this.lastFaceDetectedTime = Date.now();
        } else {
          const faceMissingTime = Date.now() - this.lastFaceDetectedTime;
          this.faceMissingDuration += (faceMissingTime / 1000).toFixed(0);

          if (faceMissingTime > FACE_MISSING_THRESHOLD) {
            this.faceMissingCount++;
            // Report silently - don't block if API fails
            this.reportEvent("face_missing", "critical", {
              duration: Math.floor(faceMissingTime / 1000),
            }).catch(() => {});

            if (this.onAlert) {
              this.onAlert({
                type: "face_missing",
                title: "Face Not Detected",
                message: "Your face is not visible. Please adjust your camera.",
                severity: "critical",
              });
            }

            this.lastFaceDetectedTime = Date.now();
          }
        }
      } catch (error) {
        // Log face detection errors at warn level, not error
        // This is expected during video initialization
        if (error instanceof Error && error.name === 'IndexSizeError') {
          console.warn("[Monitoring] Face detection - canvas not ready (video dimensions still 0)");
        } else {
          console.warn("[Monitoring] Face detection error:", error?.message);
        }
      }
    };

    this.faceDetectionTimer = setInterval(checkFacePresence, FACE_DETECTION_INTERVAL);
  }

  /**
   * Start audio monitoring
   */
  startAudioMonitoring(audioStream) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(audioStream);
      microphone.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceStartTime = Date.now();

      const checkAudioLevel = async () => {
        if (!this.isMonitoring) return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // If average is very low, consider it silence
        if (average < 5) {
          const silenceTime = Date.now() - silenceStartTime;
          this.audioSilenceDuration = Math.floor(silenceTime / 1000);

          if (silenceTime > AUDIO_SILENCE_THRESHOLD) {
            // Report silently - don't block if API fails
            this.reportEvent("audio_silence", "warning", {
              duration: Math.floor(silenceTime / 1000),
            }).catch(() => {});

            if (this.onAlert) {
              this.onAlert({
                type: "audio_silence",
                title: "No Audio Detected",
                message: "Your microphone appears to be silent. Please check your audio.",
                severity: "warning",
              });
            }

            silenceStartTime = Date.now();
          }
        } else {
          // Audio detected, reset timer
          silenceStartTime = Date.now();
          this.audioSilenceDuration = 0;
        }
      };

      this.audioMonitoringTimer = setInterval(checkAudioLevel, 2000);
    } catch (error) {
      console.error("Audio monitoring setup error:", error);
    }
  }

  /**
   * Report monitoring event to backend
   */
  async reportEvent(eventType, severity = "warning", details = {}) {
    try {
      const response = await publicFetch(
        `/interviews/public/monitoring/${this.interviewToken}?sessionToken=${encodeURIComponent(
          this.sessionToken
        )}`,
        {
          method: "POST",
          headers: {
            "X-Interview-Session": this.sessionToken,
          },
          body: JSON.stringify({
            sessionToken: this.sessionToken,
            eventType,
            severity,
            details,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.success) {
        console.error("Failed to report monitoring event:", response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error reporting monitoring event:", error);
      return false;
    }
  }

  /**
   * Get monitoring summary
   */
  getSummary() {
    return {
      tabSwitchCount: this.tabSwitchCount,
      faceMissingCount: this.faceMissingCount,
      faceMissingDuration: this.faceMissingDuration,
      audioSilenceDuration: this.audioSilenceDuration,
    };
  }

  /**
   * Request fullscreen mode
   */
  async requestFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return true;
      }
      return true;
    } catch (error) {
      console.error("Fullscreen request failed:", error);
      return false;
    }
  }

  /**
   * Cleanup and stop monitoring
   */
  cleanup() {
    this.isMonitoring = false;

    // Remove event listeners
    if (this.visibilityChangeHandler) {
      document.removeEventListener("visibilitychange", this.visibilityChangeHandler);
    }
    if (this.fullscreenChangeHandler) {
      document.removeEventListener("fullscreenchange", this.fullscreenChangeHandler);
    }
    if (this.escapeKeyHandler) {
      document.removeEventListener("keydown", this.escapeKeyHandler);
    }

    // Clear timers
    if (this.faceDetectionTimer) {
      clearInterval(this.faceDetectionTimer);
    }
    if (this.audioMonitoringTimer) {
      clearInterval(this.audioMonitoringTimer);
    }

    // Exit fullscreen if we entered it
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen();
      } catch (err) {
        console.error("Could not exit fullscreen:", err);
      }
    }
  }
}

export default InterviewMonitoring;
