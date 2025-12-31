"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  Camera, 
  Wifi, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Volume2,
  Sun,
  Users,
  Shield,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PreInterviewSetup = ({ params }) => {
  const router = useRouter();
  const { interviewToken } = params;
  const { toast } = useToast();
  const videoRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Environment checklist
  const [quietEnvironment, setQuietEnvironment] = useState(false);
  const [stableInternet, setStableInternet] = useState(false);
  const [properLighting, setProperLighting] = useState(false);
  const [noAssistance, setNoAssistance] = useState(false);
  const [acceptRecording, setAcceptRecording] = useState(false);

  // System checks
  const [systemChecks, setSystemChecks] = useState([
    { id: "camera", name: "Camera", status: "pending" },
    { id: "microphone", name: "Microphone", status: "pending" },
    { id: "network", name: "Network", status: "pending" },
  ]);

  const allChecklistComplete = quietEnvironment && stableInternet && properLighting && noAssistance && acceptRecording;
  const allSystemChecksPassed = systemChecks.every(check => check.status === "passed");
  const canProceed = allChecklistComplete && allSystemChecksPassed;

  // Run system checks on mount
  useEffect(() => {
    runSystemChecks();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
        audioContext.close();
      };
    } catch (error) {
      console.error("Audio context error:", error);
    }
  }, [stream]);

  const updateCheckStatus = (id, status, message) => {
    setSystemChecks(prev => 
      prev.map(check => 
        check.id === id ? { ...check, status, message } : check
      )
    );
  };

  const runSystemChecks = async () => {
    // Reset all checks
    setSystemChecks(prev => prev.map(check => ({ ...check, status: "checking" })));

    // Camera check
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      updateCheckStatus("camera", "passed", "Camera is working");
      updateCheckStatus("microphone", "passed", "Microphone detected");
    } catch (error) {
      if (error.name === "NotAllowedError") {
        updateCheckStatus("camera", "failed", "Permission denied");
        updateCheckStatus("microphone", "failed", "Permission denied");
      } else {
        updateCheckStatus("camera", "failed", "Camera not detected");
        updateCheckStatus("microphone", "failed", "Microphone not detected");
      }
    }

    // Network check
    try {
      const startTime = performance.now();
      await fetch("https://www.google.com/favicon.ico", { mode: "no-cors" });
      const latency = performance.now() - startTime;
      
      if (latency < 200) {
        updateCheckStatus("network", "passed", `Good connection (${Math.round(latency)}ms)`);
      } else if (latency < 500) {
        updateCheckStatus("network", "passed", `Fair connection (${Math.round(latency)}ms)`);
      } else {
        updateCheckStatus("network", "failed", "Slow connection detected");
      }
    } catch {
      updateCheckStatus("network", "failed", "Network error");
    }
  };

  const handleJoinInterview = () => {
    if (!canProceed) {
      toast({
        title: "Cannot Proceed",
        description: "Please complete all checks and accept all conditions.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Joining Interview",
      description: "Preparing your interview session...",
    });
    
    // Stop the preview stream before navigating
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    router.push(`/interview/${interviewToken}/start`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "checking":
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "passed":
        return <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Passed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "checking":
        return <Badge variant="secondary">Checking...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/interview/${interviewToken}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge variant="outline" className="text-sm">
            Step 2 of 3: Pre-Interview Setup
          </Badge>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pre-Interview Setup</h1>
          <p className="text-gray-600 mt-1">
            Complete all checks before starting your interview
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Video Preview & System Checks */}
          <div className="space-y-6">
            {/* Video Preview */}
            <Card className="border-gray-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500 text-sm">Camera preview loading...</p>
                    </div>
                  )}
                </div>

                {/* Audio Level */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Volume2 className="w-4 h-4" />
                      Microphone Level
                    </span>
                    <span className="text-xs text-gray-500">Speak to test</span>
                  </div>
                  <Progress value={audioLevel} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* System Checks */}
            <Card className="border-gray-200/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">System Checks</CardTitle>
                  <Button variant="ghost" size="sm" onClick={runSystemChecks}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Recheck
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {systemChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-medium text-sm text-gray-900">{check.name}</p>
                        {check.message && (
                          <p className="text-xs text-gray-500">{check.message}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Environment Checklist */}
          <div className="space-y-6">
            <Card className="border-gray-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Environment Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please confirm the following conditions before starting:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      id="quiet"
                      type="checkbox"
                      checked={quietEnvironment}
                      onChange={(e) => setQuietEnvironment(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <label htmlFor="quiet" className="cursor-pointer font-medium block">
                        <Volume2 className="w-4 h-4 inline mr-2" />
                        Quiet Environment
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        I am in a quiet space with minimal background noise
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      id="internet"
                      type="checkbox"
                      checked={stableInternet}
                      onChange={(e) => setStableInternet(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <label htmlFor="internet" className="cursor-pointer font-medium block">
                        <Wifi className="w-4 h-4 inline mr-2" />
                        Stable Internet
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        I have a stable internet connection for the interview
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      id="lighting"
                      type="checkbox"
                      checked={properLighting}
                      onChange={(e) => setProperLighting(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <label htmlFor="lighting" className="cursor-pointer font-medium block">
                        <Sun className="w-4 h-4 inline mr-2" />
                        Proper Lighting
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        My face is clearly visible with good lighting
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      id="assistance"
                      type="checkbox"
                      checked={noAssistance}
                      onChange={(e) => setNoAssistance(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <label htmlFor="assistance" className="cursor-pointer font-medium block">
                        <Users className="w-4 h-4 inline mr-2" />
                        No External Assistance
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        I will complete this interview independently without help
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      id="recording-consent"
                      type="checkbox"
                      checked={acceptRecording}
                      onChange={(e) => setAcceptRecording(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-blue-300"
                    />
                    <div className="flex-1">
                      <label htmlFor="recording-consent" className="cursor-pointer font-medium block text-blue-900">
                        <Camera className="w-4 h-4 inline mr-2" />
                        Recording Consent
                      </label>
                      <p className="text-xs text-blue-700 mt-1">
                        I understand this interview will be recorded and analyzed by AI for evaluation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Join Button */}
            <Card className="border-gray-200/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Checklist Progress</span>
                    <span className="font-medium text-gray-900">
                      {[quietEnvironment, stableInternet, properLighting, noAssistance, acceptRecording].filter(Boolean).length}/5
                    </span>
                  </div>
                  <Progress 
                    value={[quietEnvironment, stableInternet, properLighting, noAssistance, acceptRecording].filter(Boolean).length * 20} 
                    className="h-2"
                  />
                  
                  <Button
                    className="w-full h-12 text-base"
                    disabled={!canProceed}
                    onClick={handleJoinInterview}
                  >
                    {canProceed ? "Join Interview" : "Complete All Checks"}
                  </Button>
                  
                  {!canProceed && (
                    <p className="text-xs text-center text-gray-500">
                      Complete all environment checks and system validations to proceed
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreInterviewSetup;
