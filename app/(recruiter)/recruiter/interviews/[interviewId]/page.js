"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, Link } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Calendar,
  User,
  Mail,
  Briefcase,
  AlertTriangle,
  Eye,
  FileText,
  Timer,
  Activity,
  Shield,
  RotateCcw,
  Send,
  ThumbsUp,
  ThumbsDown,
  Pause,
  ChevronRight,
  Bot,
  MonitorCheck,
  AlertCircle,
  Loader2,
  CheckCircle,
  Settings,
  Brain,
  Copy,
  ExternalLink,
  Users,
  Tag,
  RefreshCw,
  Download,
  MoreVertical,
  FileCheck,
  Mic,
  Video,
  Lock,
  Unlock,
  Trash2,
  Edit,
  AlertOctagon,
  Zap,
  Target,
  Award,
  BarChart,
  TrendingUp,
  Star,
  Hash
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_BASE_URL = "http://localhost:5000/api/v1";

// Status constants matching backend
const INTERVIEW_STATUS = {
  SETUP: 'setup',
  QUESTIONS_GENERATED: 'questions_generated',
  READY: 'ready',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  ABANDONED: 'abandoned',
  FAILED: 'failed'
};

const DECISION_STATUS = {
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold',
  NEXT_ROUND: 'next_round'
};

const PRECHECK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

const getStatusConfig = (status) => {
  switch (status) {
    case INTERVIEW_STATUS.SETUP:
      return { color: "secondary", icon: Settings, label: "Setup" };
    case INTERVIEW_STATUS.QUESTIONS_GENERATED:
      return { color: "secondary", icon: Brain, label: "Questions Generated" };
    case INTERVIEW_STATUS.READY:
      return { color: "success", icon: CheckCircle2, label: "Ready" };
    case INTERVIEW_STATUS.SCHEDULED:
      return { color: "info", icon: Calendar, label: "Scheduled" };
    case INTERVIEW_STATUS.IN_PROGRESS:
      return { color: "warning", icon: Play, label: "In Progress" };
    case INTERVIEW_STATUS.COMPLETED:
      return { color: "success", icon: CheckCircle, label: "Completed" };
    case INTERVIEW_STATUS.CANCELLED:
      return { color: "destructive", icon: XCircle, label: "Cancelled" };
    case INTERVIEW_STATUS.EXPIRED:
      return { color: "destructive", icon: Timer, label: "Expired" };
    case INTERVIEW_STATUS.ABANDONED:
      return { color: "destructive", icon: AlertTriangle, label: "Abandoned" };
    case INTERVIEW_STATUS.FAILED:
      return { color: "destructive", icon: XCircle, label: "Failed" };
    default:
      return { color: "secondary", icon: Clock, label: status };
  }
};

const getPrecheckBadge = (preCheck) => {
  if (!preCheck || !preCheck.status) {
    return <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />Not Started</Badge>;
  }
  
  switch (preCheck.status) {
    case PRECHECK_STATUS.COMPLETED:
      return <Badge variant="success" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Ready</Badge>;
    case PRECHECK_STATUS.FAILED:
      return <Badge variant="destructive" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    case PRECHECK_STATUS.IN_PROGRESS:
      return <Badge variant="warning" className="text-xs"><Activity className="h-3 w-3 mr-1" />In Progress</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  }
};

const getDecisionBadge = (decision) => {
  if (!decision || !decision.status) {
    return <Badge variant="secondary">Pending Decision</Badge>;
  }
  
  switch (decision.status) {
    case DECISION_STATUS.SHORTLISTED:
      return <Badge variant="success"><ThumbsUp className="h-3 w-3 mr-1" />Shortlisted</Badge>;
    case DECISION_STATUS.NEXT_ROUND:
      return <Badge variant="info"><ChevronRight className="h-3 w-3 mr-1" />Next Round</Badge>;
    case DECISION_STATUS.ON_HOLD:
      return <Badge variant="warning"><Pause className="h-3 w-3 mr-1" />On Hold</Badge>;
    case DECISION_STATUS.REJECTED:
      return <Badge variant="destructive"><ThumbsDown className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="secondary">{decision.status}</Badge>;
  }
};

const getRecommendationBadge = (score) => {
  if (score === null || score === undefined) return null;
  
  if (score >= 80) {
    return <Badge variant="success">Strong Hire</Badge>;
  } else if (score >= 60) {
    return <Badge variant="info">Hire</Badge>;
  } else if (score >= 40) {
    return <Badge variant="warning">Needs Review</Badge>;
  } else {
    return <Badge variant="destructive">No Hire</Badge>;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "Not scheduled";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return "Invalid date";
  }
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return "";
  }
};

const InterviewDetail = () => {
  const { interviewId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [readiness, setReadiness] = useState({
    isReady: false,
    blockers: [],
    completed: []
  });

  useEffect(() => {
    if (interviewId) {
      fetchInterviewDetails();
      fetchReadinessStatus();
      fetchTimeline();
    }
  }, [interviewId]);

  // Poll for report status updates when interview is completed and report is processing
  useEffect(() => {
    if (!interview || interview.status !== INTERVIEW_STATUS.COMPLETED) return;
    if (!report || report.status === 'completed' || report.status === 'failed') return;

    // Poll every 3 seconds
    const interval = setInterval(() => {
      fetchInterviewDetails();
    }, 3000);

    return () => clearInterval(interval);
  }, [interview?.status, report?.status, interviewId]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInterview(data.data?.interview || null);
        setQuestions(data.data?.questions || []);
        setReport(data.data?.report || null);
        
        // Set decision state if exists
        if (data.data?.interview?.decision?.status) {
          setDecision(data.data.interview.decision.status);
          setDecisionNotes(data.data.interview.decision.notes || "");
        }
      } else {
        throw new Error('Failed to fetch interview details');
      }
    } catch (err) {
      console.error('Error fetching interview details:', err);
      toast({
        title: "Error",
        description: "Failed to load interview details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReadinessStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/readiness?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReadiness(data.data || {
          isReady: false,
          blockers: [],
          completed: []
        });
      }
    } catch (error) {
      console.error('Error fetching readiness status:', error);
    }
  };

  const fetchTimeline = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/timeline?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTimeline(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  const handleSendReminder = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/send-invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId: user.organizationId,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Reminder Sent",
          description: "Interview reminder sent to candidate.",
        });
        fetchInterviewDetails();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder",
        variant: "destructive",
      });
    }
  };

  const handleCancelInterview = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId: user.organizationId,
            reason: "Cancelled by recruiter from details page"
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Interview Cancelled",
          description: "The interview has been cancelled.",
          variant: "destructive",
        });
        fetchInterviewDetails();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel interview');
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel interview",
        variant: "destructive",
      });
    }
  };

  const handleMakeDecision = async () => {
    if (!decision) {
      toast({
        title: "Select Decision",
        description: "Please select a decision before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if interview has a report ID
      if (!interview?.reportId) {
        // Try to create/fetch report first
        try {
          const reportResponse = await fetch(
            `${API_BASE_URL}/reports/from-interview/${interviewId}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ interviewId }),
            }
          );
          
          if (!reportResponse.ok) {
            throw new Error('Could not create/fetch report');
          }
          
          const reportData = await reportResponse.json();
          console.log("Report created/fetched:", reportData);
        } catch (reportError) {
          console.warn("Report creation attempt failed:", reportError);
          // Continue anyway - try to use the interview ID
        }
      }

      const reportIdToUse = interview?.reportId || interviewId;
      
      // Make decision on the report using addReview endpoint
      const response = await fetch(
        `${API_BASE_URL}/reports/${reportIdToUse}/reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            decision: decision,
            notes: decisionNotes,
            reviewerRole: user.role || 'recruiter'
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Decision Saved",
          description: `Candidate marked as ${decision.replace("_", " ")}.`,
        });
        fetchInterviewDetails();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save decision');
      }
    } catch (error) {
      console.error('Error saving decision:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save decision",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/generate-questions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId: user.organizationId,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Questions Generated",
          description: "Interview questions have been generated successfully.",
        });
        fetchInterviewDetails();
        fetchReadinessStatus();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate questions",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsReady = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/mark-ready`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId: user.organizationId,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Interview Ready",
          description: "Interview is now ready for candidate.",
        });
        fetchInterviewDetails();
        fetchReadinessStatus();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark interview as ready');
      }
    } catch (error) {
      console.error('Error marking as ready:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark interview as ready",
        variant: "destructive",
      });
    }
  };

  const handleReschedule = () => {
    router.push(`/recruiter/interviews/${interviewId}/reschedule`);
  };

  const handleCopyInterviewLink = async () => {
    if (interview?.access?.link) {
      await navigator.clipboard.writeText(interview.access.link);
      toast({
        title: "Link Copied",
        description: "Interview link copied to clipboard",
      });
    } else {
      toast({
        title: "No Link Available",
        description: "Interview link is not generated yet",
        variant: "destructive",
      });
    }
  };

  const handleViewReport = () => {
    router.push(`/recruiter/reports/interview/${interviewId}`);
  };

  const handleViewQuestions = () => {
    router.push(`/recruiter/interviews/${interviewId}/questions`);
  };

  const handleStartMonitoring = () => {
    router.push(`/recruiter/interviews/${interviewId}/monitor`);
  };

  const handleEditConfig = () => {
    router.push(`/recruiter/interviews/${interviewId}/edit`);
  };

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent mr-2" />
          <span>Loading interview details...</span>
        </div>
      </RecruiterLayout>
    );
  }

  if (!interview) {
    return (
      <RecruiterLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Interview not found</p>
          <Button onClick={() => router.push("/recruiter/interviews")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviews
          </Button>
        </div>
      </RecruiterLayout>
    );
  }

  const statusConfig = getStatusConfig(interview.status);
  const StatusIcon = statusConfig.icon;
  
  const candidateName = interview.candidateId?.personalInfo?.name || 'Unknown Candidate';
  const candidateEmail = interview.candidateId?.personalInfo?.email || '';
  const jobTitle = interview.jobId?.title || 'Unknown Position';
  const jobDepartment = interview.jobId?.department || '';
  const recruiterName = interview.recruiterId?.profile?.name || 'Unknown Recruiter';
  const questionsCount = interview.config?.questionCount || 0;
  const attemptCount = interview.execution?.attemptCount || 0;
  const maxAttempts = interview.execution?.maxAttempts || 3;
  const score = interview.evaluation?.overallScore;
  const progress = interview.status === INTERVIEW_STATUS.IN_PROGRESS ? 
    Math.round(((interview.execution?.answeredQuestions || 0) / questionsCount) * 100) : 
    0;

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/recruiter/interviews")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{candidateName}</h1>
              <Badge variant={statusConfig.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {interview.type && (
                <Badge variant="outline" className="capitalize">
                  {getInterviewTypeIcon(interview.type)}
                  <span className="ml-1">{interview.type.replace('_', ' ')}</span>
                </Badge>
              )}
              {score !== undefined && getRecommendationBadge(score)}
              {interview.decision && getDecisionBadge(interview.decision)}
            </div>
            <p className="text-muted-foreground mt-1">{jobTitle}</p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/recruiter/interviews/${interviewId}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Interview
                </DropdownMenuItem>
                {interview.status === INTERVIEW_STATUS.COMPLETED && (
                  <DropdownMenuItem onClick={handleViewReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Report
                  </DropdownMenuItem>
                )}
                {[INTERVIEW_STATUS.SETUP, INTERVIEW_STATUS.QUESTIONS_GENERATED].includes(interview.status) && (
                  <DropdownMenuItem onClick={handleViewQuestions}>
                    <Brain className="h-4 w-4 mr-2" />
                    Review Questions
                  </DropdownMenuItem>
                )}
                {[INTERVIEW_STATUS.READY, INTERVIEW_STATUS.SCHEDULED].includes(interview.status) && (
                  <DropdownMenuItem onClick={handleCopyInterviewLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Interview Link
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {![INTERVIEW_STATUS.COMPLETED, INTERVIEW_STATUS.CANCELLED, INTERVIEW_STATUS.EXPIRED, INTERVIEW_STATUS.ABANDONED].includes(interview.status) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel Interview
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Interview?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel the interview for {candidateName}. 
                          The candidate will be notified.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Interview</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelInterview} className="bg-destructive text-destructive-foreground">
                          Cancel Interview
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {interview.status === INTERVIEW_STATUS.COMPLETED && score !== undefined && (
              <Button variant="accent" onClick={handleViewReport}>
                <FileText className="h-4 w-4 mr-2" />
                View Report
              </Button>
            )}
            {[INTERVIEW_STATUS.SCHEDULED, INTERVIEW_STATUS.READY].includes(interview.status) && (
              <>
                <Button variant="outline" onClick={handleSendReminder}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </>
            )}
            {interview.status === INTERVIEW_STATUS.IN_PROGRESS && (
              <Button variant="accent" onClick={handleStartMonitoring}>
                <Activity className="h-4 w-4 mr-2" />
                Live Monitor
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Readiness Blockers (for setup interviews) */}
            {[INTERVIEW_STATUS.SETUP, INTERVIEW_STATUS.QUESTIONS_GENERATED].includes(interview.status) && readiness.blockers.length > 0 && (
              <Card className="border-warning/50 bg-warning/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    Interview Not Ready
                  </CardTitle>
                  <CardDescription>
                    {readiness.isReady ? "Interview is ready" : `Complete ${readiness.blockers.length} more step(s) to start`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Questions Generated */}
                    <div className="flex items-center gap-2">
                      {readiness.completed.includes('questions_generated') ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">Questions Generated</span>
                      {!readiness.completed.includes('questions_generated') && (
                        <Badge variant="outline" className="text-xs ml-2">{questions.length}/{questionsCount}</Badge>
                      )}
                    </div>
                    
                    {/* Questions Approved */}
                    <div className="flex items-center gap-2">
                      {readiness.completed.includes('questions_approved') ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">All Questions Approved</span>
                    </div>
                    
                    {/* Candidate Invited */}
                    <div className="flex items-center gap-2">
                      {readiness.completed.includes('candidate_invited') ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">Candidate Invited</span>
                    </div>
                    
                    {/* Not Expired */}
                    <div className="flex items-center gap-2">
                      {readiness.completed.includes('not_expired') ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">Link Not Expired</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    {readiness.blockers.some(b => b.id === 'questions_not_generated') && (
                      <Button size="sm" variant="accent" onClick={handleGenerateQuestions}>
                        <Brain className="h-4 w-4 mr-1" />
                        Generate Questions
                      </Button>
                    )}
                    {readiness.blockers.some(b => b.id === 'questions_not_approved') && (
                      <Button size="sm" variant="outline" onClick={handleViewQuestions}>
                        <FileCheck className="h-4 w-4 mr-1" />
                        Review Questions
                      </Button>
                    )}
                    {readiness.blockers.some(b => b.id === 'candidate_not_invited') && (
                      <Button size="sm" variant="outline" onClick={handleSendReminder}>
                        <Send className="h-4 w-4 mr-1" />
                        Send Invitation
                      </Button>
                    )}
                    {readiness.isReady && interview.status === INTERVIEW_STATUS.QUESTIONS_GENERATED && (
                      <Button size="sm" variant="accent" onClick={handleMarkAsReady}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark as Ready
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Monitoring Panel (for in-progress interviews) */}
            {interview.status === INTERVIEW_STATUS.IN_PROGRESS && interview.monitoring && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                    Live Interview Monitoring
                  </CardTitle>
                  <CardDescription>
                    Real-time tracking of candidate interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-background rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{interview.execution?.answeredQuestions || 0}/{questionsCount}</p>
                      <p className="text-xs text-muted-foreground">Questions Answered</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{interview.monitoring.tabSwitchCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Tab Switches</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{interview.monitoring.faceMissingCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Face Detection Lost</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{interview.monitoring.audioSilenceDuration || 0}s</p>
                      <p className="text-xs text-muted-foreground">Audio Silence</p>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Interview Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Alerts */}
                  {interview.monitoring.alerts && interview.monitoring.alerts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                      {interview.monitoring.alerts.map((alert, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-warning bg-warning/10 rounded px-3 py-2">
                          <AlertCircle className="h-4 w-4" />
                          {alert}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleStartMonitoring} className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to Live Monitor Dashboard
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Interview Details Tabs */}
            <Card>
              <Tabs defaultValue="overview" className="p-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  {interview.status === INTERVIEW_STATUS.COMPLETED && <TabsTrigger value="decision">Decision</TabsTrigger>}
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Candidate Info */}
                  <div>
                    <h3 className="font-semibold mb-3">Candidate Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{candidateName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{candidateEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Role:</span>
                        <span className="font-medium">{jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Department:</span>
                        <span className="font-medium">{jobDepartment}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Scheduled:</span>
                        <span className="font-medium">{formatDate(interview.scheduling?.scheduledAt || interview.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Recruiter:</span>
                        <span className="font-medium">{recruiterName}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Interview Config */}
                  <div>
                    <h3 className="font-semibold mb-3">Interview Configuration</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {interview.type?.replace('_', ' ') || 'ai_screening'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Questions:</span>
                        <span className="font-medium">{questionsCount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{interview.config?.duration || 45} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Experience:</span>
                        <span className="font-medium capitalize">{interview.experienceLevel || 'mid'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Attempts:</span>
                        <span className="font-medium">{attemptCount}/{maxAttempts}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Mode:</span>
                        <span className="font-medium capitalize">{interview.config?.interviewMode || 'text'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MonitorCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Precheck:</span>
                        {getPrecheckBadge(interview.preCheck)}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Monitoring:</span>
                        <Badge variant="outline">{interview.config?.recordInterview ? "Enabled" : "Disabled"}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Warning */}
                  {interview.expiresAt && ![INTERVIEW_STATUS.COMPLETED, INTERVIEW_STATUS.CANCELLED, INTERVIEW_STATUS.EXPIRED, INTERVIEW_STATUS.ABANDONED].includes(interview.status) && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                        <Timer className="h-5 w-5 text-warning" />
                        <div>
                          <p className="text-sm font-medium">Interview Expiry</p>
                          <p className="text-xs text-muted-foreground">
                            This interview link expires on {formatDate(interview.expiresAt)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Additional Context */}
                  {interview.additionalContext && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Additional Context</h3>
                        <p className="text-sm text-muted-foreground">{interview.additionalContext}</p>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="timeline">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {timeline.length > 0 ? (
                        timeline.map((entry, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-primary" />
                              {index < timeline.length - 1 && (
                                <div className="w-0.5 h-full bg-border flex-1 my-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="font-medium text-sm">{entry.eventType}</p>
                              <p className="text-xs text-muted-foreground">
                                by {entry.actor?.userId?.profile?.name || entry.actor?.system || 'System'} • {formatDate(entry.createdAt)}
                              </p>
                              {entry.data && Object.keys(entry.data).length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                                  {Object.entries(entry.data).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">{key}:</span> {String(value)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No timeline events recorded yet.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {interview.status === INTERVIEW_STATUS.COMPLETED && (
                  <TabsContent value="decision" className="space-y-4">
                    {interview.decision?.status ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Current Decision</h3>
                          {getDecisionBadge(interview.decision)}
                        </div>
                        {interview.decision.decidedAt && (
                          <p className="text-sm text-muted-foreground">
                            Decided on {formatDate(interview.decision.decidedAt)}
                            {interview.decision.decidedBy && ` by ${interview.decision.decidedBy}`}
                          </p>
                        )}
                        {interview.decision.reason && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Reason</h4>
                            <p className="text-sm text-muted-foreground">{interview.decision.reason}</p>
                          </div>
                        )}
                        {interview.decision.notes && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Notes</h4>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{interview.decision.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Make Decision</h3>
                        <Select value={decision} onValueChange={(v) => setDecision(v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select decision" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shortlisted">
                              <div className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-success" />
                                Shortlist
                              </div>
                            </SelectItem>
                            <SelectItem value="next_round">
                              <div className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-info" />
                                Move to Next Round
                              </div>
                            </SelectItem>
                            <SelectItem value="on_hold">
                              <div className="flex items-center gap-2">
                                <Pause className="h-4 w-4 text-warning" />
                                Put On Hold
                              </div>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <div className="flex items-center gap-2">
                                <ThumbsDown className="h-4 w-4 text-destructive" />
                                Reject
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Reason</h4>
                          <Textarea
                            placeholder="Why are you making this decision? (Optional)"
                            value={decisionNotes}
                            onChange={(e) => setDecisionNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleMakeDecision} className="w-full">
                          Submit Decision
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Stats & Quick Info */}
          <div className="space-y-6">
            {/* Score Card (if completed) */}
            {interview.status === INTERVIEW_STATUS.COMPLETED && score !== undefined && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Interview Score
                  </CardTitle>
                  <CardDescription>
                    Overall performance evaluation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${
                      (score || 0) >= 70 ? "text-success" : 
                      (score || 0) >= 50 ? "text-warning" : "text-destructive"
                    }`}>
                      {score}%
                    </div>
                    {getRecommendationBadge(score)}
                  </div>
                  
                  {/* Breakdown if available */}
                  {report?.breakdown && (
                    <div className="mt-4 space-y-2">
                      <Separator />
                      <h4 className="text-sm font-medium mt-3">Score Breakdown</h4>
                      {Object.entries(report.breakdown).map(([category, catScore]) => (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{category.replace('_', ' ')}</span>
                          <span className="font-medium">{catScore}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Attempt Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Attempt Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Attempt</span>
                  <span className="font-medium">{attemptCount}/{maxAttempts}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Can Resume</span>
                  <Badge variant={interview.execution?.canResume ? "success" : "secondary"}>
                    {interview.execution?.canResume ? "Yes" : "No"}
                  </Badge>
                </div>
                {interview.execution?.startedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Started</span>
                    <span className="font-medium">{formatTime(interview.execution.startedAt)}</span>
                  </div>
                )}
                {interview.execution?.completedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">{formatTime(interview.execution.completedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidate Precheck */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MonitorCheck className="h-4 w-4" />
                  Candidate Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Precheck Status</span>
                  {getPrecheckBadge(interview.preCheck)}
                </div>
                
                {/* Precheck Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {interview.preCheck?.micCheck ? (
                      <CheckCircle2 className="h-3 w-3 text-success" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span>Mic</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {interview.preCheck?.cameraCheck ? (
                      <CheckCircle2 className="h-3 w-3 text-success" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span>Camera</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {interview.preCheck?.consentGiven ? (
                      <CheckCircle2 className="h-3 w-3 text-success" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span>Consent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {interview.preCheck?.environmentConfirmed ? (
                      <CheckCircle2 className="h-3 w-3 text-success" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span>Environment</span>
                  </div>
                </div>
                
                {interview.preCheck?.completedAt && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Completed: {formatDate(interview.preCheck.completedAt)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Evaluation Status */}
            {interview.status === INTERVIEW_STATUS.COMPLETED && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      AI Evaluation
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {report?.status === 'processing' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={fetchInterviewDetails}
                          disabled
                        >
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Checking...
                        </Button>
                      )}
                      {report?.status && report.status !== 'processing' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={fetchInterviewDetails}
                          title="Refresh evaluation status"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            report.status === 'completed' ? "success" :
                            report.status === 'processing' ? "warning" :
                            report.status === 'failed' ? "destructive" : "secondary"
                          }
                        >
                          {report.status === 'processing' ? 'Processing' :
                           report.status === 'completed' ? 'Completed' :
                           report.status === 'failed' ? 'Failed' : 'Pending'}
                        </Badge>
                      </div>
                      
                      {report.status === 'processing' && (
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2 border border-muted-foreground/20">
                          <p>📊 Report is being generated. This will auto-refresh every 3 seconds.</p>
                        </div>
                      )}
                      
                      {report.generatedAt && (
                        <p className="text-xs text-muted-foreground">
                          Generated: {formatDate(report.generatedAt)}
                        </p>
                      )}
                      
                      {report.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => {
                            // Handle view report action
                            toast({
                              title: "Report",
                              description: "Opening detailed evaluation report...",
                            });
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Detailed Report
                        </Button>
                      )}
                      
                      {report.status === 'failed' && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2 border border-destructive/20">
                          ⚠️ Report generation failed. Please try again.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground py-4">
                      <p>⏳ Generating AI evaluation report...</p>
                      <p className="text-xs mt-1">This may take a few moments.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Interview Link Card (for ready/scheduled) */}
            {[INTERVIEW_STATUS.READY, INTERVIEW_STATUS.SCHEDULED].includes(interview.status) && interview.access?.link && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Interview Link
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground break-all bg-muted p-2 rounded">
                      {interview.access.link}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={handleCopyInterviewLink}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Link
                      </Button>
                      <Button size="sm" variant="accent" className="flex-1" asChild>
                        <a href={interview.access.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open Link
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">{questionsCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Time/Question</span>
                  <span className="font-medium">{interview.config?.timePerQuestion || 5} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Question Flow</span>
                  <span className="font-medium capitalize">{interview.config?.questionFlow || 'linear'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-medium capitalize">{interview.config?.difficultyLevel || 'adaptive'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recorded</span>
                  <Badge variant={interview.config?.recordInterview ? "success" : "secondary"}>
                    {interview.config?.recordInterview ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
};

// Helper function for interview type icon
const getInterviewTypeIcon = (type) => {
  switch (type) {
    case "ai_screening":
      return <Bot className="h-3 w-3" />;
    case "video_interview":
      return <Video className="h-3 w-3" />;
    case "text_interview":
      return <FileText className="h-3 w-3" />;
    case "audio_interview":
      return <Mic className="h-3 w-3" />;
    default:
      return <Bot className="h-3 w-3" />;
  }
};

export default InterviewDetail;