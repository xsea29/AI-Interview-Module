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
  Loader2,
  Users,
  Briefcase,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { API_BASE_URL } from "@/lib/api";
import { INTERVIEW_STATUS } from "@/constants/interviewStatus";

const getStatusBadge = (status) => {
  switch (status) {
    case INTERVIEW_STATUS.SCHEDULED:
      return <Badge variant="info"><Calendar className="h-3 w-3 mr-1" />Scheduled</Badge>;
    case INTERVIEW_STATUS.READY:
      return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Ready</Badge>;
    case INTERVIEW_STATUS.IN_PROGRESS:
      return <Badge variant="warning"><Play className="h-3 w-3 mr-1" />In Progress</Badge>;
    case INTERVIEW_STATUS.COMPLETED:
      return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    case INTERVIEW_STATUS.CANCELLED:
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
    case INTERVIEW_STATUS.EXPIRED:
      return <Badge variant="destructive"><Timer className="h-3 w-3 mr-1" />Expired</Badge>;
    case INTERVIEW_STATUS.SETUP:
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Setup</Badge>;
    case INTERVIEW_STATUS.QUESTIONS_GENERATED:
      return <Badge variant="secondary"><FileText className="h-3 w-3 mr-1" />Questions Generated</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getRecommendationBadge = (recommendation) => {
  if (!recommendation) return null;
  
  switch (recommendation) {
    case "strong_hire":
      return <Badge variant="success">Strong Hire</Badge>;
    case "hire":
      return <Badge variant="info">Hire</Badge>;
    case "no_hire":
      return <Badge variant="destructive">No Hire</Badge>;
    case "needs_review":
      return <Badge variant="warning">Needs Review</Badge>;
    default:
      return null;
  }
};

const getDecisionBadge = (decision) => {
  if (!decision) return null;
  
  switch (decision) {
    case "shortlisted":
      return <Badge variant="success" className="text-xs"><ThumbsUp className="h-3 w-3 mr-1" />Shortlisted</Badge>;
    case "next_round":
      return <Badge variant="info" className="text-xs"><ChevronRight className="h-3 w-3 mr-1" />Next Round</Badge>;
    case "on_hold":
      return <Badge variant="warning" className="text-xs"><Pause className="h-3 w-3 mr-1" />On Hold</Badge>;
    case "rejected":
      return <Badge variant="destructive" className="text-xs"><ThumbsDown className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return null;
  }
};

const getPrecheckIndicator = (precheck) => {
  if (!precheck || !precheck.status) return null;
  
  switch (precheck.status) {
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
          <Activity className="h-3 w-3" />
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

const Interviews = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    byStatus: {},
    scheduledToday: 0,
    completedThisWeek: 0
  });
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  // Fetch interviews and stats
  useEffect(() => {
    fetchInterviews();
    fetchInterviewStats();
    fetchUpcomingInterviews();
  }, [statusFilter, searchQuery]);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      let url = `${API_BASE_URL}/interviews?organizationId=${user.organizationId}`;
      
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }

      const data = await response.json();
      setInterviews(data?.data?.interviews || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast({
        title: "Error",
        description: "Failed to load interviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        setStats(data?.data || { byStatus: {}, scheduledToday: 0, completedThisWeek: 0 });
      }
    } catch (error) {
      console.error('Error fetching interview stats:', error);
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

  const handleSendReminder = async (interviewId, candidateName) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/send-invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }

      toast({
        title: "Reminder Sent",
        description: `Interview reminder sent to ${candidateName}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelInterview = async (interviewId, reason) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel interview');
      }

      toast({
        title: "Interview Cancelled",
        description: "Interview has been cancelled successfully.",
      });
      
      // Refresh data
      fetchInterviews();
      fetchInterviewStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartInterview = (interviewId) => {
    router.push(`/recruiter/interviews/${interviewId}/live`);
  };

  const handleViewReport = (interviewId) => {
    router.push(`/recruiter/interviews/${interviewId}/report`);
  };

  const handleViewDetails = (interviewId) => {
    router.push(`/recruiter/interviews/${interviewId}`);
  };

  // Calculate stats for display
  const scheduledCount = interviews.filter(i => 
    [INTERVIEW_STATUS.SCHEDULED, INTERVIEW_STATUS.READY, INTERVIEW_STATUS.SETUP, INTERVIEW_STATUS.QUESTIONS_GENERATED].includes(i.status)
  ).length;
  
  const inProgressCount = interviews.filter(i => 
    i.status === INTERVIEW_STATUS.IN_PROGRESS
  ).length;
  
  const completedCount = interviews.filter(i => 
    i.status === INTERVIEW_STATUS.COMPLETED
  ).length;
  
  const needsDecisionCount = interviews.filter(i => 
    i.status === INTERVIEW_STATUS.COMPLETED && !i.decision?.status
  ).length;
  
  const cancelledCount = interviews.filter(i => 
    [INTERVIEW_STATUS.CANCELLED, INTERVIEW_STATUS.EXPIRED].includes(i.status)
  ).length;

  const renderInterviewCard = (interview, index) => (
    <motion.div
      key={interview._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card variant="interactive" className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold text-accent">
                {interview.candidateId?.personalInfo?.name?.split(' ').map(n => n[0]).join('') || '??'}
              </span>
            </div>
            
            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">
                  {interview.candidateId?.personalInfo?.name || 'Unknown Candidate'}
                </h3>
                {getStatusBadge(interview.status)}
                {interview.config?.interviewMode === 'ai' && (
                  <Badge variant="outline" className="text-xs"><Bot className="h-3 w-3 mr-1" />AI</Badge>
                )}
                {getDecisionBadge(interview.decision?.status)}
              </div>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-muted-foreground">
                  {interview.jobId?.title || 'Unknown Role'}
                </p>
                {/* Precheck Status */}
                {interview.preCheck && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Precheck:</span>
                    {getPrecheckIndicator(interview.preCheck)}
                  </div>
                )}
              </div>
            </div>

            {/* Live Monitoring (for in_progress) */}
            {interview.status === INTERVIEW_STATUS.IN_PROGRESS && interview.monitoring && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                  <Activity className="h-3 w-3 text-primary animate-pulse" />
                  <div className="text-xs">
                    <span className="font-medium">Live</span>
                    {interview.monitoring.tabSwitchCount > 0 && (
                      <span className="ml-2 text-warning">⚠ {interview.monitoring.tabSwitchCount} tabs</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Time & Attempts */}
            <div className="text-right min-w-[120px]">
              {interview.scheduling?.scheduledAt ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(interview.scheduling.scheduledAt).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(interview.createdAt).toLocaleDateString()}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                {interview.config?.questionCount || 0} questions
              </p>
              
              {interview.expiresAt && 
               interview.status !== INTERVIEW_STATUS.COMPLETED && 
               interview.status !== INTERVIEW_STATUS.CANCELLED && (
                <p className="text-xs text-warning mt-1 flex items-center gap-1 justify-end">
                  <Timer className="h-3 w-3" />
                  Expires: {new Date(interview.expiresAt).toLocaleDateString()}
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewDetails(interview._id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                
                {interview.status === INTERVIEW_STATUS.COMPLETED && (
                  <DropdownMenuItem onClick={() => handleViewReport(interview._id)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </DropdownMenuItem>
                )}
                
                {[INTERVIEW_STATUS.SCHEDULED, INTERVIEW_STATUS.READY].includes(interview.status) && (
                  <>
                    <DropdownMenuItem onClick={() => handleSendReminder(interview._id, interview.candidateId?.personalInfo?.name)}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Reminder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleCancelInterview(interview._id, "Cancelled by recruiter")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Interview
                    </DropdownMenuItem>
                  </>
                )}
                
                {interview.status === INTERVIEW_STATUS.READY && interview.access?.link && (
                  <DropdownMenuItem onClick={() => window.open(interview.access.link, '_blank')}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Interview
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Interviews</h1>
            <p className="text-muted-foreground mt-1">Manage and track all interview sessions</p>
          </div>
          <Button variant="accent" onClick={() => router.push("/recruiter/interviews/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Interview
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by candidate name, job title..." 
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
              <SelectItem value={INTERVIEW_STATUS.SETUP}>Setup</SelectItem>
              <SelectItem value={INTERVIEW_STATUS.QUESTIONS_GENERATED}>Questions Generated</SelectItem>
              <SelectItem value={INTERVIEW_STATUS.READY}>Ready</SelectItem>
              <SelectItem value={INTERVIEW_STATUS.SCHEDULED}>Scheduled</SelectItem>
              <SelectItem value={INTERVIEW_STATUS.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={INTERVIEW_STATUS.COMPLETED}>Completed</SelectItem>
              <SelectItem value={INTERVIEW_STATUS.CANCELLED}>Cancelled</SelectItem>
              <SelectItem value={INTERVIEW_STATUS.EXPIRED}>Expired</SelectItem>
            </SelectContent>
          </Select>
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
                  <p className="text-2xl font-bold text-foreground">{scheduledCount}</p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
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
                  <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedCount}</p>
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
                  <p className="text-2xl font-bold text-foreground">{needsDecisionCount}</p>
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
                  <p className="text-2xl font-bold text-foreground">{cancelledCount}</p>
                  <p className="text-sm text-muted-foreground">Cancelled/Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Interviews */}
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
                        <p className="font-medium text-foreground">{interview.candidateId?.personalInfo?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{interview.jobId?.title || 'Unknown Role'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {new Date(interview.scheduling?.scheduledAt).toLocaleString()}
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
            <TabsTrigger value="all">All ({interviews.length})</TabsTrigger>
            <TabsTrigger value="live">Live ({inProgressCount})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduledCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            <TabsTrigger value="needs_decision">Needs Decision ({needsDecisionCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent mr-2" />
                <span>Loading interviews...</span>
              </div>
            ) : interviews.length > 0 ? (
              interviews.map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No interviews found.</p>
                <Button 
                  variant="accent" 
                  className="mt-4"
                  onClick={() => router.push("/recruiter/interviews/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Interview
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="live" className="space-y-3">
            {interviews.filter(i => i.status === INTERVIEW_STATUS.IN_PROGRESS).length > 0 ? (
              interviews
                .filter(i => i.status === INTERVIEW_STATUS.IN_PROGRESS)
                .map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No interviews currently in progress.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-3">
            {interviews.filter(i => 
              [INTERVIEW_STATUS.SCHEDULED, INTERVIEW_STATUS.READY, INTERVIEW_STATUS.SETUP, INTERVIEW_STATUS.QUESTIONS_GENERATED].includes(i.status)
            ).length > 0 ? (
              interviews
                .filter(i => 
                  [INTERVIEW_STATUS.SCHEDULED, INTERVIEW_STATUS.READY, INTERVIEW_STATUS.SETUP, INTERVIEW_STATUS.QUESTIONS_GENERATED].includes(i.status)
                )
                .map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled interviews.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {interviews.filter(i => i.status === INTERVIEW_STATUS.COMPLETED).length > 0 ? (
              interviews
                .filter(i => i.status === INTERVIEW_STATUS.COMPLETED)
                .map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed interviews.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="needs_decision" className="space-y-3">
            {needsDecisionCount > 0 ? (
              interviews
                .filter(i => i.status === INTERVIEW_STATUS.COMPLETED && !i.decision?.status)
                .map((interview, index) => renderInterviewCard(interview, index))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>All completed interviews have decisions.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
};

export default Interviews;

