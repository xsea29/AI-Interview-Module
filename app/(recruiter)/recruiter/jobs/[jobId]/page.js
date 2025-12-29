"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  Share2,
  Edit,
  Play,
  Pause,
  Copy,
  Archive,
  ExternalLink,
  TrendingUp,
  Target,
  BarChart3,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:5000/api/v1";

const getStatusConfig = (status) => {
  switch (status) {
    case "ACTIVE":
      return { variant: "success", label: "Active" };
    case "PAUSED":
      return { variant: "warning", label: "Paused" };
    case "DRAFT":
      return { variant: "secondary", label: "Draft" };
    case "CLOSED":
      return { variant: "destructive", label: "Closed" };
    default:
      return { variant: "secondary", label: status };
  }
};

const getPriorityConfig = (priority) => {
  switch (priority) {
    case "high":
      return { variant: "destructive", label: "High Priority" };
    case "medium":
      return { variant: "warning", label: "Medium Priority" };
    case "low":
      return { variant: "secondary", label: "Low Priority" };
    default:
      return { variant: "secondary", label: priority };
  }
};

export default function JobDetail({ params }) {
  const { jobId } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState(null);
  const [stats, setStats] = useState({
    candidates: {},
    interviews: {},
  });

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchJobStats();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/jobs/${jobId}?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const data = await response.json();
      setJobData(data?.data.job);
    } catch (err) {
      console.error('Error fetching job details:', err);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/jobs/${jobId}/stats?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data?.data.stats || { candidates: {}, interviews: {} });
      }
    } catch (err) {
      console.error('Error fetching job stats:', err);
    }
  };

  const handleShareJob = () => {
    // Implementation for sharing job
    console.log("Sharing job", jobId);
  };

  const handleDuplicateJob = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: user.organizationId,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate job');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Job duplicated successfully",
      });
      
      // Navigate to the new job
      router.push(`/recruiter/jobs/${data.data._id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleJobStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const newStatus = jobData.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
      
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          organizationId: user.organizationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      // Update local state
      setJobData(prev => ({ ...prev, status: newStatus }));
      
      toast({
        title: "Status Updated",
        description: `Job status changed to ${newStatus.toLowerCase()}`,
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddCandidate = () => {
    router.push(`/recruiter/candidates?jobId=${jobId}`);
  };

  const handleViewPipeline = () => {
    router.push(`/recruiter/jobs/${jobId}/pipeline`);
  };

  const handleShareJobLink = () => {
    const jobLink = `${window.location.origin}/jobs/${jobId}`;
    navigator.clipboard.writeText(jobLink);
    toast({
      title: "Copied!",
      description: "Job link copied to clipboard",
    });
  };

  const handleArchiveJob = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "CLOSED",
          organizationId: user.organizationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive job');
      }

      // Update local state
      setJobData(prev => ({ ...prev, status: "CLOSED" }));
      
      toast({
        title: "Job Archived",
        description: "Job has been closed and archived",
      });
    } catch (err) {
      toast({
        title: "Archive Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2">Loading job details...</span>
        </div>
      </RecruiterLayout>
    );
  }

  if (!jobData) {
    return (
      <RecruiterLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground">Job Not Found</h1>
          <p className="text-muted-foreground mt-2">The job you're looking for doesn't exist or has been removed.</p>
          <Button variant="accent" onClick={() => router.push('/recruiter/jobs')} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </RecruiterLayout>
    );
  }

  const statusConfig = getStatusConfig(jobData.status);
  const priorityConfig = getPriorityConfig(jobData.priority);

  // Calculate health metrics from stats
  const healthMetrics = [
    { 
      label: "Total Candidates", 
      value: Object.values(stats.candidates).reduce((sum, count) => sum + count, 0).toString(), 
      icon: Users, 
      color: "text-primary", 
      bgColor: "bg-primary/10" 
    },
    { 
      label: "Active Candidates", 
      value: (stats.candidates.ACTIVE || 0).toString(), 
      icon: Target, 
      color: "text-accent", 
      bgColor: "bg-accent/10" 
    },
    { 
      label: "Interviews Done", 
      value: (stats.interviews.COMPLETED || 0).toString(), 
      icon: CheckCircle2, 
      color: "text-success", 
      bgColor: "bg-success/10" 
    },
    { 
      label: "Avg. Score", 
      value: "4.2", // This would come from interview ratings
      icon: TrendingUp, 
      color: "text-warning", 
      bgColor: "bg-warning/10" 
    },
    { 
      label: "Time to Hire", 
      value: "12 days", // This would be calculated
      icon: Clock, 
      color: "text-info", 
      bgColor: "bg-info/10" 
    },
  ];

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{jobData.title}</h1>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              {jobData.priority && (
                <Badge variant={priorityConfig.variant}>{priorityConfig.label}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {jobData.department || 'No department'} • {jobData._id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleShareJob}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share Job</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleDuplicateJob}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>
            {jobData.status !== "CLOSED" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleToggleJobStatus}>
                    {jobData.status === "ACTIVE" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{jobData.status === "ACTIVE" ? "Pause" : "Resume"}</TooltipContent>
              </Tooltip>
            )}
            <Link href={`/recruiter/jobs/${jobId}/edit`}>
              <Button variant="accent">
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">{jobData.location || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Work Mode</p>
                      <p className="font-medium text-foreground">{jobData.workMode || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium text-foreground">
                        {jobData.experienceYears || jobData.experienceLevel || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium text-foreground">
                        {jobData.salaryMin && jobData.salaryMax 
                          ? `$${parseInt(jobData.salaryMin).toLocaleString()} - $${parseInt(jobData.salaryMax).toLocaleString()}`
                          : 'Not disclosed'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description Tabs */}
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-0">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="interview">Interview Process</TabsTrigger>
                    <TabsTrigger value="notes">Internal Notes</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  <TabsContent value="overview" className="mt-0">
                    <div className="prose prose-sm max-w-none text-foreground">
                      <p className="whitespace-pre-line">{jobData.description || 'No description provided'}</p>
                    </div>
                    <Separator className="my-6" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Employment Type</p>
                        <p className="font-medium text-foreground">{jobData.employmentType || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Openings</p>
                        <p className="font-medium text-foreground">{jobData.openings || 1} position(s)</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hiring Manager</p>
                        <p className="font-medium text-foreground">{jobData.hiringManager || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created By</p>
                        <p className="font-medium text-foreground">
                          {jobData.createdBy?.profile?.name || jobData.createdBy?.email || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="responsibilities" className="mt-0">
                    {jobData.responsibilities ? (
                      <ul className="space-y-3">
                        {jobData.responsibilities.map((item, index) => (
                          item.trim() && (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                              <span className="text-foreground">{item}</span>
                            </li>
                          )
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No responsibilities specified.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="requirements" className="mt-0">
                    {jobData.requirements ? (
                      <ul className="space-y-3">
                        {jobData.requirements.map((item, index) => (
                          item.trim() && (
                            <li key={index} className="flex items-start gap-3">
                              <Target className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                              <span className="text-foreground">{item}</span>
                            </li>
                          )
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No requirements specified.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="interview" className="mt-0">
                    {jobData.interviewRounds ? (
                      <div className="space-y-4">
                        {Array.from({ length: parseInt(jobData.interviewRounds) || 3 }, (_, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-sm font-medium text-primary">{index + 1}</span>
                            </div>
                            <span className="text-foreground">
                              {jobData.interviewType === 'ai' ? 'AI Interview' : 
                               jobData.interviewType === 'live' ? 'Live Interview' : 
                               'Technical Interview'} Round {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Interview process not configured.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="notes" className="mt-0">
                    {jobData.internalNotes ? (
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-sm text-foreground">{jobData.internalNotes}</p>
                        <p className="text-xs text-muted-foreground mt-2">Visible only to recruiters</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No internal notes.</p>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Job Health Panel (Sticky) */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Health Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-accent" />
                    Job Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {healthMetrics.map((metric, index) => {
                    const MetricIcon = metric.icon;
                    return (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`h-10 w-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                          <MetricIcon className={`h-5 w-5 ${metric.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                          <p className="font-semibold text-foreground">{metric.value}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleAddCandidate}>
                    <Users className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleViewPipeline}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Pipeline
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleShareJobLink}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share Job Link
                  </Button>
                  {jobData.status !== "CLOSED" && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleArchiveJob}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Job
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Meta Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-foreground">
                        {new Date(jobData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="text-foreground">
                        {new Date(jobData.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience Level</span>
                      <span className="text-foreground">{jobData.experienceLevel || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="text-foreground">{jobData.department || 'Not specified'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}