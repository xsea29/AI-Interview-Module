"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Send,
  Clock,
  AlertCircle,
  Bot,
  User,
  Loader2,
  Volume2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { publicFetch, sessionTokenUtils } from "@/lib/public-api";

export default function InterviewStartPage({ params }) {
  const router = useRouter();
  const { interviewToken } = params;
  const { toast } = useToast();
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Interview state
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [sessionExpired, setSessionExpired] = useState(false);

  const totalQuestions = questions.length || 5;
  const minInterviewTime = 5 * 60; // 5 minutes minimum

  // Initialize
  useEffect(() => {
    loadQuestions();
    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
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
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ensure video stream is attached to video element
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Audio level monitoring
  useEffect(() => {
    if (!stream) return;

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
        setAudioLevel(Math.min(100, average * 2));
        requestAnimationFrame(updateLevel);
      };
      
      updateLevel();

      return () => {
        try {
          audioContext.close();
        } catch (e) {
          console.error("Error closing audio context:", e);
        }
      };
    } catch (error) {
      console.error("Audio context error:", error);
    }
  }, [stream]);

  const loadQuestions = async () => {
    const sessionToken = sessionTokenUtils.get();

    if (!sessionToken) {
      setSessionExpired(true);
      setLoading(false);
      return;
    }

    try {
      const result = await publicFetch(
        `/interviews/public/questions/${interviewToken}?sessionToken=${encodeURIComponent(
          sessionToken
        )}`,
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
      setQuestions(loadedQuestions);

      // Start with first question
      if (loadedQuestions.length > 0) {
        const welcomeMessage = {
          id: "1",
          role: "ai",
          content: loadedQuestions[0].question?.text || "Let's begin the interview",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load interview questions",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const initializeMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setStream(mediaStream);
      
      // Ensure video ref is available before setting stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => console.error("Play error:", err));
        };
      }
    } catch (error) {
      console.error("Media error:", error);
      toast({
        title: "Media Error",
        description: "Could not access camera/microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const toggleMic = () => {
    if (stream) {
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
      }
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add candidate message
    const candidateMessage = {
      id: Date.now().toString(),
      role: "candidate",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, candidateMessage]);
    setInputMessage("");

    // Simulate AI response
    setIsAITyping(true);
    setTimeout(() => {
      const nextQuestionIndex = currentQuestionIndex + 1;

      if (nextQuestionIndex < questions.length) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content:
            questions[nextQuestionIndex].question?.text ||
            "Please continue...",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setCurrentQuestionIndex(nextQuestionIndex);
      } else {
        // All questions answered
        const completionMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content:
            "Thank you for completing all the interview questions! Your responses have been recorded. You may now end the interview.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, completionMessage]);
      }

      setIsAITyping(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndInterview = () => {
    const elapsedTime = 30 * 60 - timeRemaining;
    if (elapsedTime < minInterviewTime) {
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
    // Stop and cleanup media stream
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      setStream(null);
    }

    // Reset media state
    setIsMicOn(true);
    setIsCameraOn(true);
    setAudioLevel(0);

    const sessionToken = sessionTokenUtils.get();

    try {
      // Collect answers from messages (candidate responses)
      const answers = messages
        .filter((msg) => msg.role === "candidate")
        .reduce((acc, msg, index) => {
          acc[index] = msg.content;
          return acc;
        }, {});

      // Submit interview
      await publicFetch(
        `/interviews/public/submit/${interviewToken}?sessionToken=${encodeURIComponent(
          sessionToken
        )}`,
        {
          method: "POST",
          headers: {
            "X-Interview-Session": sessionToken,
          },
          body: JSON.stringify({
            answers: answers,
            completedAt: new Date().toISOString(),
            timeSpent: 30 * 60 - timeRemaining,
            sessionType: "ai-interview",
          }),
        }
      );

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

  if (sessionExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Session Expired
              </h2>
              <p className="text-gray-600 mb-4">
                Your interview session has expired. Please restart.
              </p>
              <Button
                onClick={() => router.push(`/interview/${interviewToken}`)}
                className="w-full"
              >
                Restart Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing interview...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / Math.max(questions.length, 1)) * 100;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Badge className="bg-red-100 text-red-700 animate-pulse">
            <span className="w-2 h-2 bg-red-700 rounded-full mr-2" />
            Recording
          </Badge>
          <Badge variant="outline">AI Interview</Badge>
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
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Video Feed */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 flex flex-col">
          {/* Candidate Video */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Recording Indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 rounded px-2 py-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white">REC</span>
            </div>

            {/* Camera Off Overlay */}
            {!isCameraOn && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <CameraOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={isMicOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleMic}
              className="h-10 w-10 rounded-full"
            >
              {isMicOn ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant={isCameraOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleCamera}
              className="h-10 w-10 rounded-full"
            >
              {isCameraOn ? (
                <Camera className="w-4 h-4" />
              ) : (
                <CameraOff className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Audio Level Indicator */}
          {isMicOn && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Microphone Level</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-600 transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {audioLevel > 70 ? "Good" : audioLevel > 40 ? "Moderate" : "Low"}
              </p>
            </div>
          )}

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* AI Monitoring Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-blue-900">AI Monitoring Active</p>
                  <p className="text-blue-700 mt-1">
                    Your interview is being recorded and analyzed in real-time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "candidate" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "ai"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {message.role === "ai" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === "ai"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <span
                      className={`text-xs opacity-60 mt-2 block ${
                        message.role === "ai" ? "text-gray-500" : "text-blue-100"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {isAITyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex gap-1 items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="max-w-3xl mx-auto flex gap-2">
              <Textarea
                placeholder="Type your response..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isAITyping}
              />
              <Button
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isAITyping}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* End Interview Confirmation */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your interview? This action cannot be
              undone. Your responses will be submitted for evaluation.
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
    </div>
  );
}