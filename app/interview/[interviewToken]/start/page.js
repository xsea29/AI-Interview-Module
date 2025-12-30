"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { publicFetch } from "@/lib/public-api";

export default function InterviewStartPage({ params }) {
  const router = useRouter();
  const { interviewToken } = params;
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuestions();
  }, [interviewToken]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const result = await publicFetch(`/interviews/public/questions/${interviewToken}`);
      setQuestions(result.data?.questions || []);
      setError(null);
    } catch (err) {
      console.error("Error loading questions:", err);
      setError("Failed to load interview questions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // Submit answers to backend
      await publicFetch(`/interviews/public/submit/${interviewToken}`, {
        method: 'POST',
        body: JSON.stringify({
          answers: answers,
          completedAt: new Date().toISOString()
        })
      });
      
      // Redirect to completion page
      router.push(`/interview/${interviewToken}/complete`);
    } catch (err) {
      console.error("Error submitting interview:", err);
      setError("Failed to submit interview: " + err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading interview questions...</p>
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
            <Button onClick={() => router.back()}>Go Back</Button>
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
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Interview</h1>
            <Badge variant="outline" className="text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {currentQuestion.timeLimit || 5} minutes per question
                </span>
              </div>
              
              <div className="flex items-start gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  {currentQuestion.category || "General"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.difficulty || "Medium"}
                </Badge>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentQuestion.text || "Question " + (currentQuestionIndex + 1)}
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
                placeholder="Type your answer here..."
                className="min-h-[200px] text-base"
              />
              <p className="text-xs text-gray-500">
                Be specific and provide examples where possible
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
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
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Instructions Footer */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-medium text-gray-900 mb-2">Interview Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Read each question carefully before answering</li>
            <li>• Be concise but thorough in your responses</li>
            <li>• Use specific examples to support your answers</li>
            <li>• Review your answer before moving to the next question</li>
          </ul>
        </div>
      </div>
    </div>
  );
}