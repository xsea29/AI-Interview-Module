"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Clock, FileText, HelpCircle } from "lucide-react";

export default function InterviewCompletePage() {
  const { interviewToken } = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Interview Completed Successfully
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for completing your interview. Your responses have been submitted.
        </p>

        {/* Status Card */}
        <Card className="border-gray-200 shadow-lg mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Interview Status</span>
              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                Submitted
              </Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Recording</span>
              <Badge variant="secondary">Saved</Badge>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Evaluation</span>
              <Badge variant="outline">In Progress</Badge>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="border-gray-200 shadow-lg mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">What Happens Next?</h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">AI Evaluation</p>
                  <p className="text-xs text-gray-600">
                    Our AI will analyze your responses and generate a detailed report
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Recruiter Review</p>
                  <p className="text-xs text-gray-600">
                    The hiring team will review your interview within 2-3 business days
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Email Notification</p>
                  <p className="text-xs text-gray-600">
                    You'll receive an email with the next steps in the process
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <HelpCircle className="w-4 h-4" />
          <span>
            Questions? Contact{" "}
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              support@example.com
            </a>
          </span>
        </div>

        {/* Close Window */}
        <Button variant="outline" className="mt-6" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}