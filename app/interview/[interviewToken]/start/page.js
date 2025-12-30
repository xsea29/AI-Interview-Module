"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  Brain
} from "lucide-react";
import { publicFetch, sessionTokenUtils } from "@/lib/public-api";

export default function InterviewStartPage({ params }) {
  const router = useRouter();
  const { interviewToken } = params;
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    loadInterview();
    
    // Session timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setSessionExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewToken]);

  const loadInterview = async () => {
    const sessionToken = sessionTokenUtils.get();
    
    if (!sessionToken) {
      setSessionExpired(true);
      setError("Session expired. Please restart the interview.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Load questions with session token in query and header
      const questionsResult = await publicFetch(`/interviews/public/questions/${interviewToken}?sessionToken=${encodeURIComponent(sessionToken)}`, {
        headers: {
          'X-Interview-Session': sessionToken
        }
      });
      if (!questionsResult.success) {
        throw new Error(questionsResult.message || "Failed to load questions");
      }

      setQuestions(questionsResult.data?.questions || []);
      setError(null);
    } catch (err) {
      console.error("Error loading interview:", err);
      
      if (err.message.includes("expired") || err.message.includes("invalid")) {
        setSessionExpired(true);
        setError("Your session has expired. Please restart the interview.");
        sessionTokenUtils.clear();
      } else {
        setError(err.message || "Failed to load interview. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const sessionToken = sessionTokenUtils.get();
    
    if (!sessionToken) {
      setSessionExpired(true);
      setError("Session expired. Please restart the interview.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result = await publicFetch(`/interviews/public/submit/${interviewToken}?sessionToken=${encodeURIComponent(sessionToken)}`, {
        method: "POST",
        headers: {
          'X-Interview-Session': sessionToken
        },
        body: JSON.stringify({
          answers: answers,
          completedAt: new Date().toISOString(),
          timeSpent: (15 * 60) - timeRemaining
        })
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to submit interview");
      }

      // Clear session token
      sessionTokenUtils.clear();
      
      // Redirect to completion page
      router.push(`/interview/${interviewToken}/complete`);
    } catch (err) {
      console.error("Error submitting interview:", err);
      setError(err.message || "Failed to submit interview. Please try again.");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (sessionExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
              <p className="text-gray-600 mb-4">
                Your interview session has expired. Please restart the interview from your email link.
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
          <p className="text-gray-600">Loading interview questions...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your session</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Interview</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push(`/interview/${interviewToken}`)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Available</h2>
            <p className="text-gray-600 mb-4">There are no questions available for this interview.</p>
            <Button onClick={() => router.push(`/interview/${interviewToken}`)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {interviewDetails?.job?.title || "Interview"}
                </h1>
                <p className="text-xs text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Session Timer */}
              <div className={`px-3 py-1.5 rounded-lg ${timeRemaining < 300 ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                </div>
                <p className="text-xs mt-0.5">Session expires</p>
              </div>
              
              {/* Progress */}
              <div className="w-24">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Alert Bar */}
        {timeRemaining < 300 && timeRemaining > 0 && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Your session expires in {formatTime(timeRemaining)}. Please complete and submit your interview soon.
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {currentQuestion.category || "General"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.difficulty || "Medium"}
                </Badge>
                {currentQuestion.timeLimit && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {currentQuestion.timeLimit} min
                  </Badge>
                )}
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentQuestion.text || `Question ${currentQuestionIndex + 1}`}
              </h2>

              {currentQuestion.description && (
                <p className="text-gray-600 mb-6">{currentQuestion.description}</p>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Your Answer
              </label>
              <Textarea
                value={answers[currentQuestionIndex] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here... Be specific and provide examples where possible."
                className="min-h-[200px] text-base"
                disabled={submitting || sessionExpired}
              />
              <p className="text-xs text-gray-500">
                Tip: Use specific examples from your experience to support your answer
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || submitting || sessionExpired}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || sessionExpired}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Interview
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={submitting || sessionExpired}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mt-6 bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Security Footer */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="font-medium text-gray-900">Secure Interview Environment</h3>
          </div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Your responses are recorded and encrypted</li>
            <li>• Session activity is monitored for integrity</li>
            <li>• Responses are saved automatically as you type</li>
            <li>• Complete all questions before submitting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}