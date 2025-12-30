"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Eye,
  MoreVertical,
  Calendar,
  Timer,
  AlertTriangle,
  Bot,
  Activity,
  Send,
  RotateCcw,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Pause,
  ChevronRight,
  MonitorCheck,
  Users,
  Brain,
  Loader2,
  ExternalLink,
  Shield,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Download,
  Briefcase,
  Mail,
  Tag,
  Settings,
  CheckCircle,
  PauseCircle,
  User,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { API_BASE_URL } from "@/lib/api";
import { INTERVIEW_STATUS } from "@/constants/interviewStatus";

// Status constants matching backend - keeping these as fallback if constants not available
const INTERVIEW_STATUS_FALLBACK = {
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

const getStatusBadge = (status) => {
  const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
  
  switch (status) {
    case statusConst.SETUP:
    case statusConst.QUESTIONS_GENERATED:
      return <Badge variant="secondary"><Settings className="h-3 w-3 mr-1" />Setup</Badge>;
    case statusConst.READY:
      return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Ready</Badge>;
    case statusConst.SCHEDULED:
      return <Badge variant="info"><Calendar className="h-3 w-3 mr-1" />Scheduled</Badge>;
    case statusConst.IN_PROGRESS:
      return <Badge variant="warning"><Play className="h-3 w-3 mr-1" />In Progress</Badge>;
    case statusConst.COMPLETED:
      return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    case statusConst.CANCELLED:
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
    case statusConst.EXPIRED:
      return <Badge variant="destructive"><Timer className="h-3 w-3 mr-1" />Expired</Badge>;
    case statusConst.ABANDONED:
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Abandoned</Badge>;
    case statusConst.FAILED:
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
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

const getDecisionBadge = (decision) => {
  if (!decision || !decision.status) return null;
  
  switch (decision.status) {
    case DECISION_STATUS.SHORTLISTED:
      return <Badge variant="success" className="text-xs"><ThumbsUp className="h-3 w-3 mr-1" />Shortlisted</Badge>;
    case DECISION_STATUS.NEXT_ROUND:
      return <Badge variant="info" className="text-xs"><ChevronRight className="h-3 w-3 mr-1" />Next Round</Badge>;
    case DECISION_STATUS.ON_HOLD:
      return <Badge variant="warning" className="text-xs"><Pause className="h-3 w-3 mr-1" />On Hold</Badge>;
    case DECISION_STATUS.REJECTED:
      return <Badge variant="destructive" className="text-xs"><ThumbsDown className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return null;
  }
};

const getPrecheckIndicator = (preCheck) => {
  if (!preCheck || !preCheck.status) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Not Started</span>
      </div>
    );
  }
  
  switch (preCheck.status) {
    case "completed":
      return (
        <div className="flex items-center gap-1 text-xs text-success">
          <MonitorCheck className="h-3 w-3" />
          <span>Ready</span>
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <XCircle className="h-3 w-3" />
          <span>Failed</span>
        </div>
      );
    case "in_progress":
      return (
        <div className="flex items-center gap-1 text-xs text-warning">
          <Clock className="h-3 w-3" />
          <span>In Progress</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Pending</span>
        </div>
      );
  }
};

const getInterviewTypeIcon = (type) => {
  switch (type) {
    case "ai_screening":
      return <Brain className="h-3 w-3" />;
    case "video_interview":
      return <Play className="h-3 w-3" />;
    case "text_interview":
      return <FileText className="h-3 w-3" />;
    case "audio_interview":
      return <Activity className="h-3 w-3" />;
    default:
      return <Bot className="h-3 w-3" />;
  }
};

const getMonitoringIndicator = (monitoring) => {
  if (!monitoring) return null;
  
  const hasIssues = monitoring.tabSwitchCount > 0 || 
                   monitoring.faceMissingCount > 0 || 
                   monitoring.audioSilenceDuration > 60;
  
  if (hasIssues) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 rounded-md">
        <Shield className="h-3 w-3 text-warning" />
        <span className="text-xs text-warning font-medium">Issues Detected</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-md">
      <Shield className="h-3 w-3 text-success" />
      <span className="text-xs text-success font-medium">Normal</span>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "Not scheduled";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours < 48) {
      return "Yesterday";
    } else if (diffHours < 168) {
      const days = Math.floor(diffHours / 24);
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
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

const Interviews = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInterviews, setSelectedInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [stats, setStats] = useState({
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    needsDecision: 0,
    cancelled: 0,
    byStatus: {},
    scheduledToday: 0,
    completedThisWeek: 0
  });

  // Fetch interviews on component mount
  useEffect(() => {
    fetchInterviews();
    fetchUpcomingInterviews();
  }, []);

  // Fetch interviews when filters change
  useEffect(() => {
    if (!loading) {
      fetchInterviews();
    }
  }, [statusFilter, searchQuery]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Build query parameters matching backend
      let url = `${API_BASE_URL}/interviews?organizationId=${user.organizationId}&recruiterId=${user._id}&limit=50&sort=-createdAt&populate=candidateId,jobId,recruiterId`;
      
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const interviewsList = data.data?.interviews || [];
        setInterviews(interviewsList);
        calculateStats(interviewsList);
        
        // Update stats in real-time
        fetchInterviewStats();
      } else {
        throw new Error('Failed to fetch interviews');
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
      toast({
        title: "Error",
        description: "Failed to load interviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/stats?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setStats(prev => ({
            ...prev,
            byStatus: data.data.byStatus || {},
            scheduledToday: data.data.scheduledToday || 0,
            completedThisWeek: data.data.completedThisWeek || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUpcomingInterviews = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/upcoming?organizationId=${user.organizationId}&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUpcomingInterviews(data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching upcoming interviews:', error);
    }
  };

  const calculateStats = (interviewList) => {
    const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
    const newStats = {
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      needsDecision: 0,
      cancelled: 0
    };

    interviewList.forEach(interview => {
      switch (interview.status) {
        case statusConst.SETUP:
        case statusConst.QUESTIONS_GENERATED:
        case statusConst.READY:
        case statusConst.SCHEDULED:
          newStats.scheduled++;
          break;
        case statusConst.IN_PROGRESS:
          newStats.inProgress++;
          break;
        case statusConst.COMPLETED:
          newStats.completed++;
          if (!interview.decision?.status) {
            newStats.needsDecision++;
          }
          break;
        case statusConst.CANCELLED:
        case statusConst.EXPIRED:
        case statusConst.ABANDONED:
        case statusConst.FAILED:
          newStats.cancelled++;
          break;
      }
    });

    setStats(prev => ({ ...prev, ...newStats }));
  };

  const handleSendReminder = async (interviewId, candidateName) => {
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
          description: `Interview reminder sent to ${candidateName}.`,
        });
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

  const handleReschedule = (interviewId) => {
    router.push(`/recruiter/interviews/${interviewId}/reschedule`);
  };

  const handleCancelInterview = async (interviewId, candidateName, reason = "Cancelled by recruiter") => {
    if (!confirm(`Are you sure you want to cancel the interview with ${candidateName}?`)) {
      return;
    }

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
            reason
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Interview Cancelled",
          description: `Interview with ${candidateName} has been cancelled.`,
        });
        fetchInterviews(); // Refresh the list
        fetchUpcomingInterviews(); // Refresh upcoming interviews
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

  const handleStartInterview = (interviewId) => {
    router.push(`/recruiter/interviews/${interviewId}/monitor`);
  };

  const handleViewReport = (interviewId) => {
    router.push(`/recruiter/reports/interview/${interviewId}`);
  };

  const handleViewDetails = (interviewId) => {
    router.push(`/recruiter/interviews/${interviewId}`);
  };

  const handleMakeDecision = (interviewId) => {
    router.push(`/recruiter/interviews/${interviewId}/decision`);
  };

  const handleCopyInterviewLink = async (interviewId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const interviewLink = data.data?.interview?.access?.link;
        
        if (interviewLink) {
          await navigator.clipboard.writeText(interviewLink);
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
      }
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Error",
        description: "Failed to copy interview link",
        variant: "destructive",
      });
    }
  };

  const toggleInterviewSelection = (interviewId) => {
    setSelectedInterviews(prev => {
      if (prev.includes(interviewId)) {
        return prev.filter(id => id !== interviewId);
      } else {
        return [...prev, interviewId];
      }
    });
  };

  const handleBulkReminder = async () => {
    if (selectedInterviews.length === 0) {
      toast({
        title: "No Selection",
        description: "Select interviews first.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const interviewId of selectedInterviews) {
        const interview = interviews.find(i => i._id === interviewId);
        if (interview) {
          await handleSendReminder(interviewId, interview.candidateId?.personalInfo?.name || 'Candidate');
        }
      }
      
      toast({
        title: "Bulk Reminders Sent",
        description: `Sent reminders to ${selectedInterviews.length} candidates.`,
      });
      setSelectedInterviews([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send some reminders",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQuestions = async (interviewId, jobTitle) => {
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
          description: `Questions generated for ${jobTitle} interview.`,
        });
        fetchInterviews(); // Refresh to update status
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

  const handleMarkAsReady = async (interviewId, jobTitle) => {
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
          description: `${jobTitle} interview is now ready for candidate.`,
        });
        fetchInterviews(); // Refresh to update status
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

  const handleUpdateConfig = async (interviewId, config) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/config`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId: user.organizationId,
            config
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Config Updated",
          description: "Interview configuration updated successfully.",
        });
        fetchInterviews();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update config');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    }
  };

  const handleApproveAllQuestions = async (interviewId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/approve-all`,
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
          title: "Questions Approved",
          description: "All questions approved successfully.",
        });
        fetchInterviews();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve questions');
      }
    } catch (error) {
      console.error('Error approving questions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve questions",
        variant: "destructive",
      });
    }
  };

  // Filter interviews based on search and status
  const filteredInterviews = interviews.filter(interview => {
    const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
    
    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "needs_decision") {
        if (interview.status !== statusConst.COMPLETED || interview.decision?.status) {
          return false;
        }
      } else if (statusFilter === "pending") {
        if (![statusConst.SETUP, statusConst.QUESTIONS_GENERATED].includes(interview.status)) {
          return false;
        }
      } else if (statusFilter === "scheduled") {
        if (![statusConst.READY, statusConst.SCHEDULED].includes(interview.status)) {
          return false;
        }
      } else if (statusFilter === "in_progress") {
        if (interview.status !== statusConst.IN_PROGRESS) {
          return false;
        }
      } else if (statusFilter === "completed") {
        if (interview.status !== statusConst.COMPLETED) {
          return false;
        }
      } else if (statusFilter === "cancelled") {
        if (![
          statusConst.CANCELLED, 
          statusConst.EXPIRED, 
          statusConst.ABANDONED, 
          statusConst.FAILED
        ].includes(interview.status)) {
          return false;
        }
      }
    }
    
    // Apply search filter
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const candidateName = interview.candidateId?.personalInfo?.name || '';
    const candidateEmail = interview.candidateId?.personalInfo?.email || '';
    const jobTitle = interview.jobId?.title || '';
    const jobDepartment = interview.jobId?.department || '';
    const interviewerName = interview.recruiterId?.profile?.name || '';
    
    return (
      candidateName.toLowerCase().includes(searchLower) ||
      candidateEmail.toLowerCase().includes(searchLower) ||
      jobTitle.toLowerCase().includes(searchLower) ||
      jobDepartment.toLowerCase().includes(searchLower) ||
      interviewerName.toLowerCase().includes(searchLower) ||
      interview.status?.toLowerCase().includes(searchLower)
    );
  });

  // Group interviews for tabs
  const scheduledInterviews = filteredInterviews.filter(i => {
    const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
    return [statusConst.SCHEDULED, statusConst.READY].includes(i.status);
  });
  
  const inProgressInterviews = filteredInterviews.filter(i => {
    const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
    return i.status === statusConst.IN_PROGRESS;
  });
  
  const completedInterviews = filteredInterviews.filter(i => {
    const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
    return i.status === statusConst.COMPLETED;
  });
  
  const needsDecisionInterviews = filteredInterviews.filter(i => {
    const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
    return i.status === statusConst.COMPLETED && !i.decision?.status;
  });
  
  const cancelledInterviews = filteredInterviews.filter(i => {
    const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
    return [
      statusConst.CANCELLED, 
      statusConst.EXPIRED, 
      statusConst.ABANDONED, 
      statusConst.FAILED
    ].includes(i.status);
  });
  
  const setupInterviews = filteredInterviews.filter(i => {
    const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
    return [statusConst.SETUP, statusConst.QUESTIONS_GENERATED].includes(i.status);
  });

  if (loading && interviews.length === 0) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent mr-2" />
          <span>Loading interviews...</span>
        </div>
      </RecruiterLayout>
    );
  }

  const renderInterviewCard = (interview, index) => {
    const candidateName = interview.candidateId?.personalInfo?.name || 'Unknown Candidate';
    const candidateEmail = interview.candidateId?.personalInfo?.email || '';
    const jobTitle = interview.jobId?.title || 'Unknown Position';
    const jobDepartment = interview.jobId?.department || '';
    const recruiterName = interview.recruiterId?.profile?.name || 'Unknown Recruiter';
    const questionsCount = interview.config?.questionCount || 0;
    const attemptCount = interview.execution?.attemptCount || 0;
    const maxAttempts = interview.execution?.maxAttempts || 3;
    const score = interview.evaluation?.overallScore;
    
    const statusConst = INTERVIEW_STATUS || INTERVIEW_STATUS_FALLBACK;
    const progress = interview.status === statusConst.IN_PROGRESS ? 
      Math.round(((interview.execution?.answeredQuestions || 0) / questionsCount) * 100) : 
      0;
    
    const isSelectable = [statusConst.SCHEDULED, statusConst.READY].includes(interview.status);
    
    return (
      <motion.div
        key={interview._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <Card className="hover:shadow-md transition-shadow border border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Selection Checkbox */}
              {isSelectable && (
                <Checkbox 
                  checked={selectedInterviews.includes(interview._id)}
                  onCheckedChange={() => toggleInterviewSelection(interview._id)}
                />
              )}
              
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-accent">
                  {candidateName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              
              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-foreground">{candidateName}</h3>
                  {getStatusBadge(interview.status)}
                  {interview.type && (
                    <Badge variant="outline" className="text-xs">
                      {getInterviewTypeIcon(interview.type)}
                      <span className="ml-1 capitalize">
                        {interview.type.replace('_', ' ')}
                      </span>
                    </Badge>
                  )}
                  {score !== undefined && getRecommendationBadge(score)}
                  {getDecisionBadge(interview.decision)}
                </div>
                
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  <p className="text-sm text-muted-foreground">{jobTitle}</p>
                  {jobDepartment && (
                    <Badge variant="outline" className="text-xs">
                      {jobDepartment}
                    </Badge>
                  )}
                  
                  {/* Precheck Status */}
                  {[statusConst.SCHEDULED, statusConst.READY].includes(interview.status) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Precheck:</span>
                      {getPrecheckIndicator(interview.preCheck)}
                    </div>
                  )}
                  
                  {/* Recruiter */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{recruiterName}</span>
                  </div>
                </div>

                {/* Interview Config Info */}
                {[statusConst.SETUP, statusConst.QUESTIONS_GENERATED].includes(interview.status) && (
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span>{interview.experienceLevel || 'mid'} level</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>{questionsCount} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{interview.config?.duration || 45} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      <span>{interview.config?.interviewMode || 'text'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Monitoring (for in_progress) */}
              {interview.status === statusConst.IN_PROGRESS && (
                <div className="flex items-center gap-4">
                  {getMonitoringIndicator(interview.monitoring)}
                  
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                    <Activity className="h-3 w-3 text-primary animate-pulse" />
                    <div className="text-xs">
                      <span className="text-muted-foreground">Q: </span>
                      <span className="font-medium">
                        {interview.execution?.answeredQuestions || 0}/{questionsCount}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Score (for completed) */}
              {score !== undefined && interview.status === statusConst.COMPLETED && (
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    score >= 70 ? "text-success" : 
                    score >= 50 ? "text-warning" : "text-destructive"
                  }`}>
                    {score}%
                  </p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              )}

              {/* Time & Attempts */}
              <div className="text-right min-w-[140px]">
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                  <Clock className="h-3.5 w-3.5" />
                  {interview.scheduling?.scheduledAt ? 
                    formatDate(interview.scheduling.scheduledAt) : 
                    formatDate(interview.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {questionsCount} questions • Attempt {attemptCount}/{maxAttempts}
                </p>
                {interview.expiresAt && ![statusConst.COMPLETED, statusConst.CANCELLED, statusConst.EXPIRED, statusConst.ABANDONED].includes(interview.status) && (
                  <p className="text-xs text-warning mt-1 flex items-center gap-1 justify-end">
                    <Timer className="h-3 w-3" />
                    Expires {formatDate(interview.expiresAt)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleViewDetails(interview._id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  
                  {/* Setup Actions */}
                  {[statusConst.SETUP].includes(interview.status) && (
                    <>
                      <DropdownMenuItem onClick={() => handleGenerateQuestions(interview._id, jobTitle)}>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Questions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/recruiter/interviews/${interview._id}/edit`)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Configuration
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Questions Generated Actions */}
                  {[statusConst.QUESTIONS_GENERATED].includes(interview.status) && (
                    <>
                      <DropdownMenuItem onClick={() => router.push(`/recruiter/interviews/${interview._id}/questions`)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Review Questions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleApproveAllQuestions(interview._id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve All Questions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMarkAsReady(interview._id, jobTitle)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Ready
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Ready/Scheduled Actions */}
                  {[statusConst.READY, statusConst.SCHEDULED].includes(interview.status) && (
                    <>
                      <DropdownMenuItem onClick={() => handleSendReminder(interview._id, candidateName)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invite/Reminder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyInterviewLink(interview._id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReschedule(interview._id)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleCancelInterview(interview._id, candidateName)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Interview
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* In Progress Actions */}
                  {interview.status === statusConst.IN_PROGRESS && (
                    <DropdownMenuItem onClick={() => handleStartInterview(interview._id)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Go to Live Monitor
                    </DropdownMenuItem>
                  )}
                  
                  {/* Completed Actions */}
                  {interview.status === statusConst.COMPLETED && (
                    <>
                      <DropdownMenuItem onClick={() => handleViewReport(interview._id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Report
                      </DropdownMenuItem>
                      {!interview.decision?.status && (
                        <DropdownMenuItem onClick={() => handleMakeDecision(interview._id)}>
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Make Decision
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  
                  {/* General Actions */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/recruiter/interviews/${interview._id}/edit`)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Interviews</h1>
            <p className="text-muted-foreground mt-1">Manage and track all interview sessions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchInterviews}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/recruiter/interviews/new">
              <Button variant="accent">
                <Plus className="h-4 w-4 mr-2" />
                Create Interview
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, role, email, department..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Setup</SelectItem>
              <SelectItem value="scheduled">Scheduled/Ready</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="needs_decision">Needs Decision</SelectItem>
              <SelectItem value="cancelled">Cancelled/Failed</SelectItem>
            </SelectContent>
          </Select>
          {selectedInterviews.length > 0 && (
            <Button variant="outline" onClick={handleBulkReminder}>
              <Send className="h-4 w-4 mr-2" />
              Bulk Remind ({selectedInterviews.length})
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.scheduled}</p>
                  <p className="text-sm text-muted-foreground">Scheduled/Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Play className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.needsDecision}</p>
                  <p className="text-sm text-muted-foreground">Needs Decision</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.cancelled}</p>
                  <p className="text-sm text-muted-foreground">Cancelled/Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Interviews Section (NEW) */}
        {upcomingInterviews.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Upcoming Interviews</h3>
                </div>
                <Badge variant="outline">{upcomingInterviews.length} scheduled</Badge>
              </div>
              <div className="space-y-3">
                {upcomingInterviews.slice(0, 3).map((interview, index) => (
                  <div key={interview._id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-accent">
                          {interview.candidateId?.personalInfo?.name?.split(' ').map(n => n[0]).join('') || '??'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {interview.candidateId?.personalInfo?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {interview.jobId?.title || 'Unknown Role'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {interview.scheduling?.scheduledAt 
                          ? new Date(interview.scheduling.scheduledAt).toLocaleString()
                          : 'Not scheduled'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {interview.scheduling?.timezone || 'UTC'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interviews Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({filteredInterviews.length})</TabsTrigger>
            <TabsTrigger value="setup">Setup ({setupInterviews.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduledInterviews.length})</TabsTrigger>
            <TabsTrigger value="live">Live ({inProgressInterviews.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedInterviews.length})</TabsTrigger>
            <TabsTrigger value="needs_decision">Needs Decision ({needsDecisionInterviews.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledInterviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filteredInterviews.length > 0 ? (
              filteredInterviews.map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No interviews found</p>
                <Link href="/recruiter/interviews/new">
                  <Button variant="accent" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Interview
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="setup" className="space-y-3">
            {setupInterviews.length > 0 ? (
              setupInterviews.map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No interviews in setup phase.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-3">
            {scheduledInterviews.length > 0 ? (
              scheduledInterviews.map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No interviews currently scheduled.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="live" className="space-y-3">
            {inProgressInterviews.length > 0 ? (
              inProgressInterviews.map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No interviews currently in progress.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedInterviews.length > 0 ? (
              completedInterviews.map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed interviews.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="needs_decision" className="space-y-3">
            {needsDecisionInterviews.length > 0 ? (
              needsDecisionInterviews.map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>All completed interviews have decisions.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3">
            {cancelledInterviews.length > 0 ? (
              cancelledInterviews.map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No cancelled or failed interviews.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
};

export default Interviews;