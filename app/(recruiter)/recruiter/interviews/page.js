"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Eye,
  MoreVertical,
  User,
  Calendar,
  Loader2
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:5000/api/v1";

const Interviews = () => {
  const { toast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch interviews on component mount
  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/interviews?organizationId=${user.organizationId}&sort=-createdAt`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInterviews(data.data?.interviews || []);
        calculateStats(data.data?.interviews || []);
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

  const calculateStats = (interviewList) => {
    const stats = {
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0
    };

    interviewList.forEach(interview => {
      switch (interview.status) {
        case 'scheduled':
        case 'ready':
        case 'pending':
          stats.scheduled++;
          break;
        case 'in_progress':
        case 'started':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'cancelled':
        case 'expired':
          stats.cancelled++;
          break;
      }
    });

    setStats(stats);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
      case "ready":
        return <Badge variant="info"><Calendar className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case "in_progress":
      case "started":
        return <Badge variant="warning"><Play className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "cancelled":
      case "expired":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case "pending":
      case "setup":
      case "questions_generated":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Setup</Badge>;
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today && date < new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date >= yesterday && date < today) {
      return "Yesterday";
    } else if (date > now) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getProgress = (interview) => {
    if (interview.status === 'in_progress' && interview.config?.questionCount && interview.execution?.answeredQuestions) {
      return Math.round((interview.execution.answeredQuestions / interview.config.questionCount) * 100);
    }
    return 0;
  };

  const handleStartInterview = (interviewId) => {
    // Navigate to interview live page
    window.location.href = `/recruiter/interviews/${interviewId}/live`;
  };

  const handleViewReport = (interviewId) => {
    // Navigate to report page
    window.location.href = `/recruiter/reports/interview/${interviewId}`;
  };

  const handleViewDetails = (interviewId) => {
    // Navigate to interview details page
    window.location.href = `/recruiter/interviews/${interviewId}`;
  };

  // Filter interviews based on search term
  const filteredInterviews = interviews.filter(interview => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (interview.candidateId?.personalInfo?.name || '').toLowerCase().includes(searchLower) ||
      (interview.candidateId?.personalInfo?.email || '').toLowerCase().includes(searchLower) ||
      (interview.jobId?.title || '').toLowerCase().includes(searchLower) ||
      interview.status?.toLowerCase().includes(searchLower)
    );
  });

  const scheduledInterviews = filteredInterviews.filter(i => 
    ['scheduled', 'ready', 'pending'].includes(i.status)
  );
  const inProgressInterviews = filteredInterviews.filter(i => 
    ['in_progress', 'started'].includes(i.status)
  );
  const completedInterviews = filteredInterviews.filter(i => 
    i.status === 'completed'
  );

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2">Loading interviews...</span>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Interviews</h1>
            <p className="text-muted-foreground mt-1">Manage and track all interview sessions</p>
          </div>
          <Link href="/recruiter/interviews/new">
            <Button variant="accent">
              <Plus className="h-4 w-4 mr-2" />
              Create Interview
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search interviews by name, email, job, or status..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchInterviews}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.scheduled}</p>
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
                  <CheckCircle2 className="h-5 w-5 text-success" />
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
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.cancelled}</p>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interviews Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({filteredInterviews.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduledInterviews.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedInterviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No interviews found</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Try changing your search criteria</p>
                )}
              </div>
            ) : (
              filteredInterviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                          <span className="text-lg font-semibold text-accent">
                            {interview.candidateId?.personalInfo?.name?.split(' ').map(n => n[0]).join('') || '??'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {interview.candidateId?.personalInfo?.name || 'Unknown Candidate'}
                            </h3>
                            {getStatusBadge(interview.status)}
                            {interview.evaluation?.overallScore !== undefined && 
                              getRecommendationBadge(interview.evaluation.overallScore)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {interview.jobId?.title || 'Unknown Position'}
                          </p>
                        </div>
                        {interview.status === 'in_progress' && (
                          <div className="w-32">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Progress</span>
                              <span className="text-xs font-medium">{getProgress(interview)}%</span>
                            </div>
                            <Progress value={getProgress(interview)} className="h-2" />
                          </div>
                        )}
                        {interview.evaluation?.overallScore !== undefined && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">{interview.evaluation.overallScore}%</p>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                        )}
                        <div className="text-right min-w-[100px]">
                          <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(interview.scheduling?.scheduledAt || interview.createdAt)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {interview.config?.questionCount || 0} questions
                          </p>
                        </div>
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
                            {interview.status === 'completed' && (
                              <DropdownMenuItem onClick={() => handleViewReport(interview._id)}>
                                <ClipboardList className="h-4 w-4 mr-2" />
                                View Report
                              </DropdownMenuItem>
                            )}
                            {(interview.status === 'scheduled' || interview.status === 'ready') && (
                              <DropdownMenuItem onClick={() => handleStartInterview(interview._id)}>
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
              ))
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledInterviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled interviews</p>
              </div>
            ) : (
              scheduledInterviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                          <span className="text-lg font-semibold text-accent">
                            {interview.candidateId?.personalInfo?.name?.split(' ').map(n => n[0]).join('') || '??'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {interview.candidateId?.personalInfo?.name || 'Unknown Candidate'}
                            </h3>
                            {getStatusBadge(interview.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {interview.jobId?.title || 'Unknown Position'}
                          </p>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(interview.scheduling?.scheduledAt || interview.createdAt)}
                          </p>
                        </div>
                        {(interview.status === 'scheduled' || interview.status === 'ready') && (
                          <Button 
                            variant="accent" 
                            size="sm"
                            onClick={() => handleStartInterview(interview._id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        )}
                        {interview.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(interview._id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Setup
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedInterviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed interviews</p>
              </div>
            ) : (
              completedInterviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                          <span className="text-lg font-semibold text-accent">
                            {interview.candidateId?.personalInfo?.name?.split(' ').map(n => n[0]).join('') || '??'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {interview.candidateId?.personalInfo?.name || 'Unknown Candidate'}
                            </h3>
                            {interview.evaluation?.overallScore !== undefined && 
                              getRecommendationBadge(interview.evaluation.overallScore)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {interview.jobId?.title || 'Unknown Position'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            {interview.evaluation?.overallScore || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewReport(interview._id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
};

export default Interviews;