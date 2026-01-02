"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Clock,
  AlertCircle,
  Volume2,
  PhoneOff,
  Pause,
  Play,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { publicFetch, sessionTokenUtils } from "@/lib/public-api";
import { PUBLIC_INTERVIEW_ENDPOINTS } from "@/lib/apiConfig";
import InterviewMonitoring from "@/lib/monitoring";

export default function AudioInterviewPage({ params }) {
  const router = useRouter();
  const { interviewToken } = params;
  const { toast } = useToast();
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null);
  const monitoringRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Interview state
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [answerTime, setAnswerTime] = useState(0);
  const [maxAnswerTime, setMaxAnswerTime] = useState(120);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [aiState, setAiState] = useState("idle");
  const [interviewPhase, setInterviewPhase] = useState("intro");
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [silenceTimer, setSilenceTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [monitoringAlert, setMonitoringAlert] = useState(null);

  const totalQuestions = questions.length || 5;
  const minInterviewTime = 5 * 60;

  // Load questions
  useEffect(() => {
    loadQuestions();
  }, []);

  // Initialize media
  useEffect(() => {
    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start interview after media and questions ready
  useEffect(() => {
    if (loading || !stream || !questions.length) return;

    const sessionToken = sessionTokenUtils.get();
    if (!sessionToken) return;

    // Initialize monitoring
    const monitoring = new InterviewMonitoring(
      interviewToken,
      sessionToken,
      (alert) => {
        setMonitoringAlert(alert);
        setTimeout(() => setMonitoringAlert(null), 5000);
      }
    );

    monitoring.initialize(videoRef.current, stream);
    monitoring.requestFullscreen();
    monitoringRef.current = monitoring;

    // Start introduction after short delay
    const timer = setTimeout(() => {
      startIntroduction();
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (monitoringRef.current) {
        monitoringRef.current.cleanup();
      }
    };
  }, [loading, stream, questions.length, interviewToken]);

  // Main timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleInterviewEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Answer timer
  useEffect(() => {
    if (interviewPhase !== "answering" || isPaused) return;

    const timer = setInterval(() => {
      setAnswerTime((prev) => {
        if (prev >= maxAnswerTime) {
          handleAnswerComplete();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewPhase, isPaused, maxAnswerTime]);

  // Audio level monitoring
  useEffect(() => {
    if (!stream || interviewPhase !== "answering") return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);

        if (average < 10) {
          setSilenceTimer((prev) => prev + 1);
        } else {
          setSilenceTimer(0);
        }

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        try {
          audioContext.close();
        } catch (e) {
          console.error("Error closing audio context:", e);
        }
      };
    } catch (error) {
      console.error("Audio monitoring setup error:", error);
    }
  }, [stream, interviewPhase]);

  // Typewriter effect
  useEffect(() => {
    if (!currentQuestionText || aiState !== "speaking") return;

    let index = 0;
    setDisplayedText("");

    const typeInterval = setInterval(() => {
      if (index < currentQuestionText.length) {
        setDisplayedText(currentQuestionText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          // If we're in intro phase, ask first question
          if (interviewPhase === "intro") {
            askFirstQuestion();
          } else if (interviewPhase === "question") {
            // If we're asking a question, switch to listening mode
            setAiState("listening");
            setInterviewPhase("answering");
            setIsRecording(true);
            setAnswerTime(0);
            setCurrentAnswer("");
          }
        }, 1000);
      }
    }, 40);

    return () => clearInterval(typeInterval);
  }, [currentQuestionText, aiState, interviewPhase, askFirstQuestion]);

  const loadQuestions = async () => {
    const sessionToken = sessionTokenUtils.get();

    if (!sessionToken) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please restart the interview.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const endpoint = PUBLIC_INTERVIEW_ENDPOINTS.GET_QUESTIONS(interviewToken);
      const result = await publicFetch(
        endpoint,
        {
          headers: {
            "X-Interview-Session": sessionToken,
          },
        }
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to load questions");
      }

      const loadedQuestions = result.data?.data?.questions || [];
      console.log("[Audio Interview] Questions loaded:", {
        count: loadedQuestions.length,
        questions: loadedQuestions,
      });
      setQuestions(loadedQuestions);
      setLoading(false);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast({
        title: "Error",
        description: "Failed to load interview questions",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const initializeMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Media Error",
        description: "Could not access camera/microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const startIntroduction = () => {
    const intro =
      "Hello! Welcome to your voice-based AI interview. I'm your AI interviewer. Let's begin with your first question.";
    setAiState("speaking");
    setInterviewPhase("intro");
    setCurrentQuestionText(intro);
    // After intro finishes, askFirstQuestion will be called from typewriter effect
  };

  const askFirstQuestion = useCallback(() => {
    if (questions.length === 0) return;

    setCurrentQuestionIndex(0);
    setAiState("speaking");
    setInterviewPhase("question");
    setCurrentQuestionText(questions[0].question?.text || "First question");
    setMaxAnswerTime(questions[0].maxAnswerTime || 120);
    setIsRecording(false);
  }, [questions]);

  const askNextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      setInterviewPhase("complete");
      setAiState("speaking");
      setCurrentQuestionText(
        "Thank you for completing all the questions! Your voice interview has been recorded and will be evaluated. You may now end the interview."
      );
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    setAiState("speaking");
    setInterviewPhase("question");
    setCurrentQuestionText(questions[nextIndex].question?.text || "Next question");
    setMaxAnswerTime(questions[nextIndex].maxAnswerTime || 120);
    setIsRecording(false);
  }, [currentQuestionIndex, questions]);

  const handleAnswerComplete = () => {
    // Save current answer with proper indexing
    console.log("[Audio Interview] Recording answer:", {
      questionIndex: currentQuestionIndex,
      answer: currentAnswer,
      allAnswers: { ...answers, [currentQuestionIndex]: currentAnswer },
    });

    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: currentAnswer,
    }));

    setIsRecording(false);
    setAiState("thinking");
    setInterviewPhase("processing");

    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  };

  const toggleMic = () => {
    if (stream && interviewPhase === "answering") {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        if (!videoTrack.enabled) {
          toast({
            title: "Camera Disabled",
            description: "Please keep your camera on during the interview.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleEndInterview = async () => {
    const elapsedTime = 30 * 60 - timeRemaining;
    if (elapsedTime < minInterviewTime && interviewPhase !== "complete") {
      toast({
        title: "Cannot End Yet",
        description: "Please continue the interview for at least 5 minutes.",
        variant: "destructive",
      });
      return;
    }
    setShowEndDialog(true);
  };

  const handleInterviewEnd = async () => {
    // Cleanup monitoring
    if (monitoringRef.current) {
      monitoringRef.current.cleanup();
    }

    // Stop media
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      setStream(null);
    }

    const sessionToken = sessionTokenUtils.get();

    try {
      // Get monitoring summary
      const monitoringSummary = monitoringRef.current
        ? monitoringRef.current.getSummary()
        : {};

      console.log("[Audio Interview] Submitting with answers:", {
        answersCount: Object.keys(answers).length,
        questionsCount: questions.length,
        answers,
        timeSpent: 30 * 60 - timeRemaining,
      });

      // Submit interview
      const endpoint = PUBLIC_INTERVIEW_ENDPOINTS.SUBMIT_ANSWERS(interviewToken);
      const response = await publicFetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "X-Interview-Session": sessionToken,
          },
          body: JSON.stringify({
            answers: answers,
            completedAt: new Date().toISOString(),
            timeSpent: 30 * 60 - timeRemaining,
            sessionType: "audio-interview",
            monitoring: monitoringSummary,
          }),
        }
      );

      console.log("[Audio Interview] Submission response:", response);

      // Trigger report generation if backend didn't do it automatically
      if (response.success && response.data?.interviewId) {
        try {
          console.log("[Audio Interview] Triggering report generation for interview:", response.data.interviewId);
          const reportEndpoint = `/reports/from-interview/${response.data.interviewId}`;
          
          // Use publicFetch since we have the session token
          const reportResponse = await publicFetch(reportEndpoint, {
            method: "POST",
            headers: {
              "X-Interview-Session": sessionToken,
            },
            body: JSON.stringify({ interviewId: response.data.interviewId }),
          });
          
          console.log("[Audio Interview] Report generation response:", reportResponse);
        } catch (reportError) {
          console.warn("[Audio Interview] Report generation failed, but interview was submitted:", reportError);
          // Don't fail the interview - report can be generated later
        }
      }

      sessionTokenUtils.clear();
      router.push(`/interview/${interviewToken}/complete`);
    } catch (error) {
      console.error("Error submitting interview:", error);
      toast({
        title: "Error",
        description: "Failed to submit interview",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getAIAvatarStyles = () => {
    switch (aiState) {
      case "speaking":
        return "ring-4 ring-slate-700/60 animate-pulse";
      case "listening":
        return "ring-4 ring-green-500/60";
      case "thinking":
        return "ring-4 ring-blue-500/60";
      case "error":
        return "ring-4 ring-red-500/60";
      default:
        return "ring-2 ring-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing audio interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <Badge className="bg-red-100 text-red-700 animate-pulse">
            <span className="w-2 h-2 bg-red-700 rounded-full mr-2" />
            Recording
          </Badge>
          <Badge variant="outline">Voice Interview</Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span
              className={`font-mono ${
                timeRemaining < 300 ? "text-red-600" : "text-gray-900"
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>

          <Badge variant="secondary">
            Question {Math.min(currentQuestionIndex + 1, totalQuestions)} of{" "}
            {totalQuestions}
          </Badge>

          <Button variant="destructive" size="sm" onClick={handleEndInterview}>
            <PhoneOff className="w-4 h-4 mr-2" />
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Candidate Video (Top-Left) */}
        <div className="absolute top-4 left-4 z-20">
          <div className="relative w-48 h-36 bg-black rounded-xl overflow-hidden shadow-lg border border-gray-300">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Recording Indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 rounded-full px-2 py-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white">REC</span>
            </div>

            {/* Status badges */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex gap-1">
                <Badge
                  variant={isCameraOn ? "secondary" : "destructive"}
                  className="text-xs px-1.5 py-0.5"
                >
                  {isCameraOn ? "📷" : "📵"}
                </Badge>
                <Badge
                  variant={isMicOn ? "secondary" : "destructive"}
                  className="text-xs px-1.5 py-0.5"
                >
                  {isMicOn ? "🎤" : "🔇"}
                </Badge>
              </div>
              {interviewPhase === "answering" && (
                <div className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
                  <div
                    className="w-2 h-2 rounded-full bg-green-500 transition-transform"
                    style={{ transform: `scale(${0.5 + audioLevel})` }}
                  />
                </div>
              )}
            </div>

            {/* Camera Off Overlay */}
            {!isCameraOn && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <CameraOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Center - AI Interviewer */}
        <div className="h-full flex flex-col items-center justify-center px-8">
          {/* AI Avatar */}
          <div
            className={`relative w-40 h-40 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-8 ${getAIAvatarStyles()}`}
          >
            {/* Sound waves when speaking */}
            {aiState === "speaking" && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-slate-700/40 animate-ping" />
              </>
            )}

            {/* Listening glow */}
            {aiState === "listening" && (
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse" />
            )}

            {/* Thinking rotation */}
            {aiState === "thinking" && (
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
            )}

            {/* Bot icon */}
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <Volume2 className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* State Label */}
          <div className="mb-6">
            {aiState === "speaking" && (
              <Badge className="bg-slate-700/10 text-slate-700 border-slate-700/30">
                <Volume2 className="w-3 h-3 mr-1.5 animate-pulse" />
                AI Interviewer is asking...
              </Badge>
            )}
            {aiState === "listening" && (
              <Badge className="bg-green-500/10 text-green-700 border-green-500/30">
                <Mic className="w-3 h-3 mr-1.5" />
                Your turn to answer
              </Badge>
            )}
            {aiState === "thinking" && (
              <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                Processing your response...
              </Badge>
            )}
          </div>

          {/* Question Text Display */}
          <div className="max-w-2xl mx-auto text-center mb-8">
            <p className="text-lg leading-relaxed text-gray-900">
              {displayedText}
              {aiState === "speaking" && (
                <span className="inline-block w-0.5 h-5 bg-gray-900 ml-1 animate-pulse" />
              )}
            </p>
          </div>

          {/* Answer Recording UI */}
          {interviewPhase === "answering" && (
            <div className="flex flex-col items-center gap-4">
              {/* Waveform visualization */}
              <div className="flex items-center justify-center gap-1 h-12">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-slate-700 rounded-full transition-all duration-100"
                    style={{
                      height: `${
                        audioLevel > 0.1
                          ? Math.random() * 30 + 10 + audioLevel * 20
                          : 4
                      }px`,
                    }}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Answer time:</span>
                <span
                  className={`font-mono text-lg ${
                    answerTime > maxAnswerTime * 0.8
                      ? "text-orange-600"
                      : "text-gray-900"
                  }`}
                >
                  {formatTime(answerTime)} / {formatTime(maxAnswerTime)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-700 rounded-full transition-all duration-300"
                  style={{ width: `${(answerTime / maxAnswerTime) * 100}%` }}
                />
              </div>

              {/* Silence warning */}
              {silenceTimer > 180 && (
                <div className="flex items-center gap-2 text-orange-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  You can start speaking now
                </div>
              )}

              {/* Submit button */}
              <Button onClick={handleAnswerComplete} className="mt-2">
                Submit Answer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 border-t border-gray-200 bg-white flex items-center justify-between px-6">
        {/* Left - Recording status */}
        <div className="flex items-center gap-4">
          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-600">
                Recording your response
              </span>
            </div>
          )}
        </div>

        {/* Center - Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant={isMicOn ? "secondary" : "destructive"}
            size="icon"
            onClick={toggleMic}
            disabled={interviewPhase !== "answering"}
            className="h-12 w-12 rounded-full"
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          <Button
            variant={isCameraOn ? "secondary" : "destructive"}
            size="icon"
            onClick={toggleCamera}
            className="h-12 w-12 rounded-full"
          >
            {isCameraOn ? (
              <Camera className="w-5 h-5" />
            ) : (
              <CameraOff className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            className="h-12 w-12 rounded-full"
            disabled={interviewPhase === "answering"}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </Button>
        </div>

        {/* Right - Empty for alignment */}
        <div className="w-32" />
      </div>

      {/* End Interview Confirmation */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your interview? This action cannot be
              undone. Your voice responses have been recorded and will be submitted
              for evaluation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Interview</AlertDialogCancel>
            <AlertDialogAction onClick={handleInterviewEnd}>
              End & Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Monitoring Alert */}
      {monitoringAlert && (
        <div className="fixed inset-0 flex items-end justify-center pb-8 z-50 pointer-events-none">
          <div
            className={`w-96 pointer-events-auto rounded-lg border p-4 shadow-lg ${
              monitoringAlert.severity === "critical"
                ? "border-red-500 bg-red-50"
                : "border-yellow-500 bg-yellow-50"
            }`}
          >
            <div className="flex gap-3">
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  monitoringAlert.severity === "critical"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              />
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    monitoringAlert.severity === "critical"
                      ? "text-red-900"
                      : "text-yellow-900"
                  }`}
                >
                  {monitoringAlert.title}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    monitoringAlert.severity === "critical"
                      ? "text-red-700"
                      : "text-yellow-700"
                  }`}
                >
                  {monitoringAlert.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
