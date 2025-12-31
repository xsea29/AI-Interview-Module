"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, Building2, Briefcase, Shield, Video, 
  CheckCircle, AlertCircle, Loader2, Mail, Lock,
  ChevronRight, Check
} from "lucide-react";
import { publicFetch, maskEmail, sessionTokenUtils } from "@/lib/public-api";

export default function InterviewLandingPage({ params }) {
  const router = useRouter();
  const { interviewToken } = params;
  
  // State for different phases
  const [phase, setPhase] = useState("validating"); // validating → emailVerification → ready
  const [interview, setInterview] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [verificationMethod, setVerificationMethod] = useState(""); // "email" or "otp"
  const [enteredEmail, setEnteredEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionToken, setSessionToken] = useState(null);

  // PHASE 1: Validate interview token
  useEffect(() => {
    const validateToken = async () => {
      if (!interviewToken) {
        setError("Invalid interview link");
        setPhase("error");
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Check if we already have a valid session token
        const existingSessionToken = sessionTokenUtils.get();
        
        if (existingSessionToken) {
          // Verify session token is still valid
          try {
            const sessionResult = await publicFetch(`/interviews/public/verify-session/${interviewToken}`, {
              method: "POST",
              body: JSON.stringify({ sessionToken: existingSessionToken })
            });
            
            if (sessionResult.success) {
              setSessionToken(existingSessionToken);
              setPhase("ready");
              await loadInterviewDetails();
              return;
            }
          } catch {
            // Session invalid, clear and continue with validation
            sessionTokenUtils.clear();
          }
        }

        // Validate interview token
        const validateResult = await publicFetch(`/interviews/public/validate/${interviewToken}`);
        
        if (!validateResult.success) {
          throw new Error(validateResult.message || "Interview validation failed");
        }

        setInterview(validateResult.data);
        
        if (validateResult.data.candidateEmail) {
          setMaskedEmail(maskEmail(validateResult.data.candidateEmail));
        }

        // Check if email is already verified
        
        if (validateResult.data.emailVerified) {
          // Email already verified, try to generate session token
          setPhase("generatingSession");
          try {
            const sessionResult = await publicFetch(`/interviews/public/create-session/${interviewToken}`, {
              method: "POST"
            });

            if (sessionResult.success && sessionResult.data.sessionToken) {
              sessionTokenUtils.set(sessionResult.data.sessionToken);
              setSessionToken(sessionResult.data.sessionToken);
              setPhase("ready");
              await loadInterviewDetails();
              return;
            }
          } catch (err) {
            // If session creation fails, fall back to email verification
            console.error("Session creation failed, showing email verification:", err);
            setPhase("emailVerification");
          }
        } else {
          setPhase("emailVerification");
        }

        setError(null);
      } catch (err) {
        console.error("Error validating token:", err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack
        });
        
        if (err.message.includes("expired")) {
          setError("This interview link has expired. Please contact the recruiter.");
          setInterview(prev => ({ ...prev, isExpired: true }));
          setPhase("error");
        } else if (err.message.includes("Invalid") || err.message.includes("not found")) {
          setError("Invalid interview link. Please check the URL or contact the recruiter.");
          setPhase("error");
        } else {
          setError("Failed to load interview. Please try again.");
          setPhase("error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [interviewToken]);

  const loadInterviewDetails = async () => {
    try {
      const detailsResult = await publicFetch(`/interviews/public/access/${interviewToken}`);
      setInterview(prev => ({ ...prev, ...detailsResult.data }));
    } catch (err) {
      console.error("Error loading details:", err);
    }
  };

  // PHASE 2a: Send OTP
  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await publicFetch(`/interviews/public/send-otp/${interviewToken}`, {
        method: "POST"
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to send OTP");
      }

      setOtpSent(true);
      setVerificationMethod("otp");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // PHASE 2b: Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const result = await publicFetch(`/interviews/public/verify-otp/${interviewToken}`, {
        method: "POST",
        body: JSON.stringify({ otp: otpCode })
      });

      if (!result.success) {
        // Check if email is already verified
        if (result.message?.includes("already verified")) {
          // Email was already verified, proceed to session creation
          await generateSessionToken();
          return;
        }
        throw new Error(result.message || "Invalid OTP");
      }

      // Generate session token
      await generateSessionToken();
    } catch (err) {
      // Handle specific case where email is already verified
      if (err.message?.includes("already verified")) {
        // Try to generate session token directly
        try {
          await generateSessionToken();
          return;
        } catch (sessionErr) {
          setError(sessionErr.message || "Failed to proceed. Please try again.");
        }
      } else {
        setError(err.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // PHASE 2c: Verify Email Match
  const handleVerifyEmail = async () => {
    if (!enteredEmail) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const result = await publicFetch(`/interviews/public/verify-email/${interviewToken}`, {
        method: "POST",
        body: JSON.stringify({ email: enteredEmail })
      });

      if (!result.success) {
        // Check if email is already verified
        if (result.message?.includes("already verified")) {
          // Email was already verified, proceed to session creation
          await generateSessionToken();
          return;
        }
        throw new Error(result.message || "Email does not match");
      }

      // Generate session token
      await generateSessionToken();
    } catch (err) {
      // Handle specific case where email is already verified
      if (err.message?.includes("already verified")) {
        // Try to generate session token directly
        try {
          await generateSessionToken();
          return;
        } catch (sessionErr) {
          setError(sessionErr.message || "Failed to proceed. Please try again.");
        }
      } else {
        setError(err.message || "Email does not match. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // PHASE 3: Generate session token
  const generateSessionToken = async () => {
    try {
      setIsLoading(true);

      const result = await publicFetch(`/interviews/public/create-session/${interviewToken}`, {
        method: "POST"
      });

      if (!result.success || !result.data.sessionToken) {
        throw new Error("Failed to create interview session");
      }

      // Store session token
      sessionTokenUtils.set(result.data.sessionToken);
      setSessionToken(result.data.sessionToken);
      setPhase("ready");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to create interview session");
    } finally {
      setIsLoading(false);
    }
  };

  // PHASE 4: Start interview
  const handleStartInterview = async () => {
    try {
      setIsLoading(true);

      const result = await publicFetch(`/interviews/public/start/${interviewToken}`, {
        method: "POST",
        body: JSON.stringify({
          sessionToken,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (!result.success) {
        throw new Error("Failed to start interview");
      }

      // Navigate to pre-interview setup
      router.push(`/interview/${interviewToken}/setup`);
    } catch (err) {
      setError(err.message || "Failed to start interview");
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.split("").slice(0, 6);
      const newOtp = [...otp];
      pastedOtp.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setOtp(newOtp);
      
      // Focus next input
      if (pastedOtp.length === 6) {
        document.getElementById("otp-5")?.focus();
      } else {
        document.getElementById(`otp-${pastedOtp.length}`)?.focus();
      }
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Loading state
  if (isLoading && phase === "validating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your interview...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your session</p>
        </div>
      </div>
    );
  }

  // Error state
  if (phase === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Access Interview</h1>
            <p className="text-gray-600">{error}</p>
          </div>
          
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">What to do next?</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check if the interview link is correct</li>
                    <li>• Ensure you have a stable internet connection</li>
                    <li>• Try refreshing the page</li>
                    <li>• Contact the recruiter if the issue persists</li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Email Verification Phase
  if (phase === "emailVerification" && interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
            <p className="text-gray-600 mt-2">
              Interview for: <strong>{interview.job?.title || "Interview"}</strong>
            </p>
          </div>

          {/* Company Card */}
          <Card className="mb-6 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{interview.company || "Our Company"}</p>
                  <p className="text-sm text-gray-500">Secure interview session</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Verification Card */}
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6 space-y-6">
              {/* Masked Email Display */}
              {maskedEmail && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">We found interview access for:</p>
                  <p className="text-lg font-semibold text-gray-900">{maskedEmail}</p>
                  <p className="text-xs text-gray-500 mt-1">This is a masked version of your email</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Verification Options */}
              {!otpSent ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      Verify your identity to access the interview
                    </p>
                  </div>

                  {/* OTP Option */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Send OTP to Email</p>
                        <p className="text-xs text-gray-500">
                          We'll send a 6-digit code to your email inbox
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Send OTP
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Email Match Option */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Verify Email Match</p>
                        <p className="text-xs text-gray-500">
                          Enter the email address associated with this interview
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Your Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={enteredEmail}
                        onChange={(e) => setEnteredEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      onClick={handleVerifyEmail}
                      disabled={isLoading || !enteredEmail}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Verify Email
                    </Button>
                  </div>
                </div>
              ) : (
                // OTP Entry Form
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Enter OTP</h3>
                    <p className="text-sm text-gray-600">
                      We sent a 6-digit code to {maskedEmail}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Check your inbox and enter the code below
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="space-y-3">
                    <Label>One-Time Password</Label>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          pattern="\d*"
                          maxLength="1"
                          value={otp[index]}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otp[index] && index > 0) {
                              document.getElementById(`otp-${index - 1}`)?.focus();
                            }
                          }}
                          className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          autoComplete="one-time-code"
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.join("").length !== 6}
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Verify OTP
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp(["", "", "", "", "", ""]);
                        setError("");
                      }}
                      disabled={isLoading}
                      className="w-full text-sm"
                    >
                      ← Try another verification method
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Resend OTP
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-500">
                    This verification ensures only you can access your interview. 
                    Your email is protected and will not be shared.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Ready to Start Phase
  if (phase === "ready" && interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{interview.company || "Our Company"}</h1>
            <p className="text-gray-600 mt-2">You're ready to start your interview!</p>
            
            {/* Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">✓ Email Verified</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">Unable to proceed</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Interview Details Card */}
          <Card className="border-gray-200 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-8">
              {/* Role and Type */}
              <div className="text-center pb-6 border-b border-gray-100">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 mb-4 px-4 py-1.5 text-sm">
                  {interview.type || "AI Screening Interview"}
                </Badge>
                <h2 className="text-2xl font-bold text-gray-900">{interview.job?.title || "Interview"}</h2>
                {interview.job?.department && (
                  <p className="text-gray-600 mt-1">{interview.job.department}</p>
                )}
                <p className="text-gray-600 mt-2">Complete your screening interview at your convenience</p>
              </div>

              {/* Interview Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {interview.config?.duration ? `${interview.config.duration} minutes` : "30-45 minutes"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Format</p>
                    <p className="font-semibold text-gray-900">
                      {interview.config?.interviewMode === "video" ? "Video Interview" :
                       interview.config?.interviewMode === "audio" ? "Audio Interview" : "Text Interview"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="font-semibold text-gray-900">
                      {interview.config?.questionCount || "Multiple"} questions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Security</p>
                    <p className="font-semibold text-gray-900">AI Proctored</p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Secure & Proctored Interview</h4>
                    <p className="text-sm text-gray-700">
                      This interview uses AI proctoring to ensure fairness. Your video, audio, and screen activity 
                      will be monitored. Any suspicious activity may be flagged for review.
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Timer */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-green-700">Active Session</p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white">
                    Expires in 15 minutes
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Your interview session is active. Please complete the interview before it expires.
                </p>
              </div>

              {/* CTA Section */}
              <div className="space-y-4">
                <Button
                  className="w-full h-14 text-base bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                  onClick={handleStartInterview}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting Interview...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Start Interview Now
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500">
                    By clicking "Start Interview Now", you agree to our{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>,{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>, and{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Interview Recording Policy</a>.
                  </p>
                  <p className="text-xs text-gray-500">
                    Need help? Contact support@example.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Powered by</span> InterviewAI
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="text-sm text-gray-500">
                🔒 End-to-end encrypted
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              © {new Date().getFullYear()} {interview.company || "Our Company"}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default loading
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Preparing your interview session...</p>
      </div>
    </div>
  );
}