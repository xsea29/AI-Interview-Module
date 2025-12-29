"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  FileText,
  Download,
  Calendar,
  Clock,
  MessageSquare,
  Star,
  Edit,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  User,
  Briefcase,
  Target,
  TrendingUp,
  FileUp,
  BarChart3,
  Loader2,
  Globe,
  Award,
  BookOpen,
  Languages,
  GraduationCap,
  Briefcase as BriefcaseIcon,
  Clock as ClockIcon,
  Users,
  Plus,
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SendMessageSheet from "@/components/communication/SendMessageSheet";
import SendEmailModal from "@/components/communication/SendEmailModal";
import { useToast } from "@/hooks/use-toast";
// import ResumeUploadModal from "@/components/modals/ResumeUploadModal";
// import ResumeParseModal from "@/components/modals/ResumeParseModal";

const API_BASE_URL = "http://localhost:5000/api/v1";

const CANDIDATE_STATUS = {
  NEW: 'new',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'widthrawn'
};

const getStatusConfig = (status) => {
  switch (status) {
    case CANDIDATE_STATUS.NEW:
      return { variant: "secondary", label: "New", icon: User };
    case CANDIDATE_STATUS.SCREENING:
      return { variant: "info", label: "Screening", icon: FileText };
    case CANDIDATE_STATUS.INTERVIEW:
      return { variant: "warning", label: "Interview", icon: Calendar };
    case CANDIDATE_STATUS.OFFER:
    case CANDIDATE_STATUS.HIRED:
      return { variant: "success", label: status === CANDIDATE_STATUS.OFFER ? "Offer" : "Hired", icon: CheckCircle2 };
    case CANDIDATE_STATUS.REJECTED:
    case CANDIDATE_STATUS.WITHDRAWN:
      return { variant: "destructive", label: status === CANDIDATE_STATUS.REJECTED ? "Rejected" : "Withdrawn", icon: XCircle };
    default:
      return { variant: "secondary", label: status, icon: User };
  }
};

const getTimelineStatusIcon = (status) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "current":
      return <Clock className="h-4 w-4 text-warning" />;
    case "pending":
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function CandidateProfile({ params }) {
  const { candidateId } = params;
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showMessageSheet, setShowMessageSheet] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [showResumeParse, setShowResumeParse] = useState(false);
  
  const [candidateData, setCandidateData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (candidateId) {
      fetchCandidateData();
    }
  }, [candidateId]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/candidates/${candidateId}?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch candidate data');
      }

      const data = await response.json();
      setCandidateData(data?.data?.candidate);
      setInterviews(data?.data?.interviews || []);
      setNotes(data?.data?.candidate?.notes || []);
    } catch (err) {
      console.error('Error fetching candidate data:', err);
      toast({
        title: "Error",
        description: "Failed to load candidate data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          organizationId: user.organizationId,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update candidate status');
      }

      // Update local state
      setCandidateData(prev => ({ ...prev, status: newStatus }));
      
      toast({
        title: "Status Updated",
        description: `Candidate status changed to ${newStatus}`,
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async (text) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          organizationId: user.organizationId,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const data = await response.json();
      setNotes(prev => [...prev, data.data]);
      
      toast({
        title: "Note Added",
        description: "Note added successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleResumeUpload = async (file) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', user.organizationId);

      const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/resume/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      const data = await response.json();
      setCandidateData(prev => ({ 
        ...prev, 
        resume: data.data.resume 
      }));
      
      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });
      setShowResumeUpload(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleResumeParse = async (updatePersonalInfo = false) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/resume/parse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: user.organizationId,
          updatePersonalInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data = await response.json();
      setCandidateData(prev => ({ 
        ...prev, 
        resume: data.data.candidate.resume,
        matchScore: data.data.candidate.matchScore,
        personalInfo: data.data.candidate.personalInfo
      }));
      
      toast({
        title: "Success",
        description: `Parsed ${data.data.parseResult.skillsExtracted} skills from resume`,
      });
      setShowResumeParse(false);
    } catch (err) {
      toast({
        title: "Error",
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
          <span className="ml-2">Loading candidate data...</span>
        </div>
      </RecruiterLayout>
    );
  }

  if (!candidateData) {
    return (
      <RecruiterLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground">Candidate Not Found</h1>
          <p className="text-muted-foreground mt-2">The candidate you're looking for doesn't exist or has been removed.</p>
          <Button variant="accent" onClick={() => router.push('/recruiter/candidates')} className="mt-4">
            Back to Candidates
          </Button>
        </div>
      </RecruiterLayout>
    );
  }

  const statusConfig = getStatusConfig(candidateData.status);
  const StatusIcon = statusConfig.icon;

  // Build timeline from status history
  const timeline = candidateData.statusHistory?.map((history, index) => ({
    id: index + 1,
    event: `Status changed to ${history.status}`,
    date: new Date(history.createdAt).toLocaleDateString(),
    time: new Date(history.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    owner: history.changedBy?.profile?.name || 'System',
    status: "completed",
    notes: history.note,
  })) || [];

  // Add interviews to timeline
  interviews.forEach((interview, index) => {
    timeline.push({
      id: timeline.length + index + 1,
      event: interview.status === 'SCHEDULED' ? 'Interview Scheduled' : 'Interview Completed',
      date: new Date(interview.scheduling?.scheduledAt || interview.createdAt).toLocaleDateString(),
      time: interview.scheduling?.scheduledAt ? new Date(interview.scheduling.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      owner: 'Recruiter',
      status: interview.status === 'COMPLETED' ? 'completed' : 'current',
      notes: `${interview.status} interview for ${candidateData.jobId?.title || 'position'}`,
    });
  });

  // Sort timeline by date
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{candidateData.personalInfo.name}</h1>
              <Badge variant={statusConfig.variant}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {candidateData.personalInfo.currentRole || candidateData.jobId?.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowMessageSheet(true)}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send Message</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowEmailModal(true)}>
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send Email</TooltipContent>
            </Tooltip>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/recruiter/interviews/new?candidate=${candidateId}&job=${candidateData.jobId?._id}`)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "View Mode" : "Edit Mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowResumeUpload(true)}>
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload Resume
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowResumeParse(true)}
                  disabled={!candidateData.resume?.url}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Parse Resume
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Change Status
                </div>
                {Object.values(CANDIDATE_STATUS).map(status => {
                  if (status === candidateData.status) return null;
                  const statusConfig = getStatusConfig(status);
                  const Icon = statusConfig.icon;
                  return (
                    <DropdownMenuItem 
                      key={status} 
                      onClick={() => handleUpdateStatus(status)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {statusConfig.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => handleUpdateStatus(CANDIDATE_STATUS.REJECTED)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Candidate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile */}
          <div className="space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Personal Info
                  {isEditing && (
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-accent">
                      {candidateData.personalInfo.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{candidateData.personalInfo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Applied {new Date(candidateData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${candidateData.personalInfo.email}`} className="text-foreground hover:text-accent">
                      {candidateData.personalInfo.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{candidateData.personalInfo.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{candidateData.personalInfo.location || 'Not provided'}</span>
                  </div>
                  {candidateData.personalInfo.linkedinUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a href={candidateData.personalInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {candidateData.personalInfo.portfolioUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={candidateData.personalInfo.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent">
                        Portfolio
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resume & Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Resume & Skills
                  <div className="flex items-center gap-2">
                    {candidateData.matchScore > 0 && (
                      <span className="text-sm font-normal text-accent">{candidateData.matchScore}% match</span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resume Section */}
                {candidateData.resume?.url ? (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-accent" />
                        <div>
                          <p className="font-medium text-foreground">Resume</p>
                          <p className="text-xs text-muted-foreground">
                            {candidateData.resume.parsedAt 
                              ? `Parsed ${new Date(candidateData.resume.parsedAt).toLocaleDateString()}`
                              : 'Not parsed'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setShowResumeParse(true)}>
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Parse Resume</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download Resume</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 border border-dashed rounded-lg">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No resume uploaded</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowResumeUpload(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Resume
                    </Button>
                  </div>
                )}

                {/* Skills from Resume */}
                {candidateData.resume?.parsedData?.skills && candidateData.resume.parsedData.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Skills from Resume</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidateData.resume.parsedData.skills.slice(0, 10).map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {candidateData.resume.parsedData.skills.length > 10 && (
                        <Badge variant="outline">
                          +{candidateData.resume.parsedData.skills.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Match Score */}
                {candidateData.matchScore > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Job Match Score</span>
                      <span className="font-medium text-foreground">{candidateData.matchScore}%</span>
                    </div>
                    <Progress value={candidateData.matchScore} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume Details */}
            {candidateData.resume?.parsedData && (
              <Card>
                <CardHeader>
                  <CardTitle>Resume Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Experience */}
                  {candidateData.resume.parsedData.experience && candidateData.resume.parsedData.experience.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">Experience</h4>
                      </div>
                      <div className="space-y-2">
                        {candidateData.resume.parsedData.experience.slice(0, 3).map((exp, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{exp.title}</p>
                            <p className="text-muted-foreground">{exp.company} • {exp.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {candidateData.resume.parsedData.education && candidateData.resume.parsedData.education.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">Education</h4>
                      </div>
                      <div className="space-y-2">
                        {candidateData.resume.parsedData.education.slice(0, 2).map((edu, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{edu.degree}</p>
                            <p className="text-muted-foreground">{edu.institution} • {edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {candidateData.resume.parsedData.certifications && candidateData.resume.parsedData.certifications.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">Certifications</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {candidateData.resume.parsedData.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {candidateData.resume.parsedData.languages && candidateData.resume.parsedData.languages.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">Languages</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {candidateData.resume.parsedData.languages.map((lang, index) => (
                          <Badge key={index} variant="outline">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rating */}
            {candidateData.rating > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.floor(candidateData.rating)
                              ? "text-warning fill-warning"
                              : star - 0.5 <= candidateData.rating
                              ? "text-warning fill-warning/50"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-foreground">{candidateData.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {interviews.filter(i => i.status === 'COMPLETED').length} interviews
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Job Info */}
            <Card>
              <CardHeader>
                <CardTitle>Job Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{candidateData.jobId?.title || 'Unknown Position'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Applied {new Date(candidateData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Source: {candidateData.source || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Current Stage: {candidateData.currentStage || 'Application Received'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {notes.slice(0, 3).map((note, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-foreground">{note.text}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{note.createdBy?.profile?.name || 'Unknown'}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const note = prompt('Enter your note:');
                    if (note) handleAddNote(note);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hiring Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Hiring Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-6">
                    {timeline.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-10"
                      >
                        {/* Timeline dot */}
                        <div className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center ${
                          item.status === "completed" ? "bg-success/10" :
                          item.status === "current" ? "bg-warning/10" : "bg-muted"
                        }`}>
                          {getTimelineStatusIcon(item.status)}
                        </div>

                        <div className={`p-4 rounded-lg border ${
                          item.status === "current" ? "border-warning bg-warning/5" : "border-border"
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">{item.event}</p>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span>{item.date}</span>
                                {item.time && (
                                  <>
                                    <span>•</span>
                                    <span>{item.time}</span>
                                  </>
                                )}
                                {item.owner && (
                                  <>
                                    <span>•</span>
                                    <span>{item.owner}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {item.status === "current" && (
                              <Badge variant="warning">Current</Badge>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            {interviews.filter(i => i.status === 'SCHEDULED').length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {interviews
                      .filter(i => i.status === 'SCHEDULED')
                      .map((interview, index) => (
                        <div key={index} className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">Technical Interview</p>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(interview.scheduling?.scheduledAt).toLocaleDateString()}</span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>{new Date(interview.scheduling?.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <Badge variant="warning">Scheduled</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Communication History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Communication History
                  <Button variant="outline" size="sm" onClick={() => setShowEmailModal(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notes.map((note, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">Internal Note</p>
                          <p className="text-sm text-foreground mt-1">{note.text}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>By {note.createdBy?.profile?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SendMessageSheet 
        open={showMessageSheet} 
        onOpenChange={setShowMessageSheet} 
        candidateName={candidateData.personalInfo.name} 
        candidateId={candidateData._id} 
      />
      <SendEmailModal 
        open={showEmailModal} 
        onOpenChange={setShowEmailModal} 
        candidate={candidateData} 
      />
      {/* <ResumeUploadModal
        open={showResumeUpload}
        onOpenChange={setShowResumeUpload}
        candidate={candidateData}
        onUpload={handleResumeUpload}
      /> */}
      {/* <ResumeParseModal
        open={showResumeParse}
        onOpenChange={setShowResumeParse}
        candidate={candidateData}
        onParse={() => handleResumeParse(true)}
        onReparse={() => handleResumeParse(true)}
      /> */}
    </RecruiterLayout>
  );
}