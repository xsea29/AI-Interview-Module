"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter,
  Users,
  Clock,
  MapPin,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  PauseCircle,
  XCircle,
  Calendar
} from "lucide-react";
import Link from "next/link";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateJobModal from "@/components/modals/CreateJobModal";
import { useToast } from "@/hooks/use-toast";
import { JOB_STATUS } from "@/constants/jobStatus";


const API_BASE_URL = "http://localhost:5000/api/v1";

const getStatusBadge = (status) => {
  switch (status) {
    case JOB_STATUS.ACTIVE:
      return <Badge variant="success">Active</Badge>;
    case JOB_STATUS.PAUSED:
      return <Badge variant="warning">Paused</Badge>;
    case JOB_STATUS.DRAFT:
      return <Badge variant="secondary">Draft</Badge>;
    case JOB_STATUS.CLOSED:
      return <Badge variant="destructive">Closed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case JOB_STATUS.ACTIVE:
      return <CheckCircle className="h-4 w-4 text-success" />;
    case JOB_STATUS.PAUSED:
      return <PauseCircle className="h-4 w-4 text-warning" />;
    case JOB_STATUS.DRAFT:
      return <Briefcase className="h-4 w-4 text-muted-foreground" />;
    case JOB_STATUS.CLOSED:
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Briefcase className="h-4 w-4" />;
  }
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    urgentJobs: 0,
    totalApplicants: 0,
    interviewsScheduled: 0
  });
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [jobs, searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/jobs?organizationId=${user.organizationId}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data?.data.jobs || []);
      calculateStats(data.data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobs) => {
    const activeJobs = jobs.filter(job => job.status === JOB_STATUS.ACTIVE).length;
    const urgentJobs = jobs.filter(job => job.priority === 'high').length;
    
    // These would ideally come from separate stats endpoint
    // For now, we'll use placeholders
    setStats({
      activeJobs,
      urgentJobs,
      totalApplicants: 0, // This should come from candidates stats
      interviewsScheduled: 0 // This should come from interviews stats
    });
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: user.organizationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete job');
      }

      // Remove job from state
      setJobs(jobs.filter(job => job._id !== jobId));
      
      toast({
        title: "Success",
        description: `"${jobTitle}" has been deleted successfully.`,
      });
    } catch (err) {
      console.error('Error deleting job:', err);
      toast({
        title: "Delete Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (jobId, newStatus, jobTitle) => {
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
          status: newStatus,
          organizationId: user.organizationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job status');
      }

      // Update job in state
      setJobs(jobs.map(job => 
        job._id === jobId ? { ...job, status: newStatus } : job
      ));
      
      toast({
        title: "Status Updated",
        description: `"${jobTitle}" status changed to ${newStatus.toLowerCase()}.`,
      });
    } catch (err) {
      console.error('Error updating job status:', err);
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateJobSuccess = () => {
    fetchJobs();
    setShowCreateJob(false);
    toast({
      title: "Success",
      description: "Job created successfully",
    });
  };

  if (loading && jobs.length === 0) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent mr-2" />
          <span>Loading jobs...</span>
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
            <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
            <p className="text-muted-foreground mt-1">Manage your open positions and track applicants</p>
          </div>
          <Button variant="accent" onClick={() => setShowCreateJob(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs by title, department, or location..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeJobs}</p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.urgentJobs}</p>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalApplicants}</p>
                  <p className="text-sm text-muted-foreground">Total Applicants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.interviewsScheduled}</p>
                  <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        {/* <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No jobs found</p>
              <Button 
                variant="accent" 
                onClick={() => setShowCreateJob(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Job
              </Button>
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="interactive">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {getStatusIcon(job.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{job.title}</h3>
                              {job.priority === 'high' && <Badge variant="warning">Urgent</Badge>}
                              {getStatusBadge(job.status)}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{job.department || 'No department'}</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location || 'Not specified'}
                              </span>
                              <span>{job.employmentType || 'Full-time'}</span>
                              <span>{job.experienceLevel || 'Not specified'}</span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Job
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                Change Status
                              </div>
                              
                              {job.status !== JOB_STATUS.ACTIVE && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(job._id, JOB_STATUS.ACTIVE, job.title)}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-success" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              
                              {job.status !== JOB_STATUS.PAUSED && job.status !== JOB_STATUS.CLOSED && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(job._id, JOB_STATUS.PAUSED, job.title)}>
                                  <PauseCircle className="h-4 w-4 mr-2 text-warning" />
                                  Pause
                                </DropdownMenuItem>
                              )}
                              
                              {job.status !== JOB_STATUS.CLOSED && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(job._id, JOB_STATUS.CLOSED, job.title)}>
                                  <XCircle className="h-4 w-4 mr-2 text-destructive" />
                                  Close
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteJob(job._id, job.title)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground font-medium">
                              {job.stats?.totalApplications || 0} applicants
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground font-medium">
                              {job.stats?.interviewsScheduled || 0} interviews
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div> */}

{/* Jobs List */}
<div className="space-y-4">
  {filteredJobs.length === 0 ? (
    <div className="text-center py-12 border rounded-lg">
      <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">No jobs found</p>
      <Button 
        variant="accent" 
        onClick={() => setShowCreateJob(true)}
        className="mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Job
      </Button>
    </div>
  ) : (
    filteredJobs.map((job, index) => (
      <motion.div
        key={job._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link href={`/recruiter/jobs/${job._id}`}>
          <Card variant="interactive" className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {getStatusIcon(job.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground hover:text-accent transition-colors">
                          {job.title}
                        </h3>
                        {job.priority === 'high' && <Badge variant="warning">Urgent</Badge>}
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{job.department || 'No department'}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location || 'Not specified'}
                        </span>
                        <span>{job.employmentType || 'Full-time'}</span>
                        <span>{job.experienceLevel || 'Not specified'}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => e.preventDefault()} // Prevent navigation when clicking menu
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/recruiter/jobs/${job._id}`} className="flex items-center w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/recruiter/jobs/${job._id}/edit`} className="flex items-center w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Change Status
                        </div>
                        
                        {job.status !== JOB_STATUS.ACTIVE && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(job._id, JOB_STATUS.ACTIVE, job.title);
                          }}>
                            <CheckCircle className="h-4 w-4 mr-2 text-success" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        
                        {job.status !== JOB_STATUS.PAUSED && job.status !== JOB_STATUS.CLOSED && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(job._id, JOB_STATUS.PAUSED, job.title);
                          }}>
                            <PauseCircle className="h-4 w-4 mr-2 text-warning" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        
                        {job.status !== JOB_STATUS.CLOSED && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(job._id, JOB_STATUS.CLOSED, job.title);
                          }}>
                            <XCircle className="h-4 w-4 mr-2 text-destructive" />
                            Close
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job._id, job.title);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground font-medium">
                        {job.stats?.totalApplications || 0} applicants
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground font-medium">
                        {job.stats?.interviewsScheduled || 0} interviews
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    ))
  )}
</div>
        <CreateJobModal 
          open={showCreateJob} 
          onOpenChange={setShowCreateJob}
          onSuccess={handleCreateJobSuccess}
        />
      </div>
    </RecruiterLayout>
  );
};

export default Jobs;