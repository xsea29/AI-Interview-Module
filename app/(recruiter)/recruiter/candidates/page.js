"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import AddCandidateModal from "@/components/modals/AddCandidateModal";
import CandidateActionsMenu from "@/components/modals/CandidateActionsMenu";
import candidateService from "@/services/candidate.service";

const API_BASE_URL = "http://localhost:5000/api/v1";

// Status mapping from backend to frontend
const STATUS_MAP = {
  'NEW': 'new',
  'SCREENING': 'screening',
  'INTERVIEW': 'interview',
  'OFFER': 'offer',
  'HIRED': 'hired',
  'REJECTED': 'rejected',
  'WITHDRAWN': 'withdrawn'
};

const STATUS_DISPLAY = {
  'NEW': 'New',
  'SCREENING': 'Screening',
  'INTERVIEW': 'Interview',
  'OFFER': 'Offer',
  'HIRED': 'Hired',
  'REJECTED': 'Rejected',
  'WITHDRAWN': 'Withdrawn'
};

const getStatusBadge = (status) => {
  const statusKey = status?.toUpperCase();
  switch (statusKey) {
    case "NEW":
      return <Badge variant="secondary">New</Badge>;
    case "SCREENING":
      return <Badge variant="info">Screening</Badge>;
    case "INTERVIEW":
      return <Badge variant="warning">Interview</Badge>;
    case "OFFER":
    case "HIRED":
      return <Badge variant="success">{STATUS_DISPLAY[statusKey]}</Badge>;
    case "REJECTED":
    case "WITHDRAWN":
      return <Badge variant="destructive">{STATUS_DISPLAY[statusKey]}</Badge>;
    default:
      return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
  }
};

const Candidates = () => {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    newThisWeek: 0,
    inInterview: 0,
    offersSent: 0,
    byStatus: {}
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parsingCandidateId, setParsingCandidateId] = useState(null);
  const { toast } = useToast();

  // Fetch candidates and stats
  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, []);

  // Filter candidates based on search and tab
  useEffect(() => {
    let filtered = candidates;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(candidate => 
        STATUS_MAP[candidate.status] === activeTab.toLowerCase()
      );
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.personalInfo.name.toLowerCase().includes(query) ||
        candidate.personalInfo.email.toLowerCase().includes(query) ||
        candidate.jobId?.title?.toLowerCase().includes(query)
      );
    }

    setFilteredCandidates(filtered);
  }, [candidates, activeTab, searchQuery]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/candidates?organizationId=${user.organizationId}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      setCandidates(data?.data?.candidates || []);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/candidates/stats?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );


      if (response.ok) {
        const data = await response.json();
        setStats({
          total: data?.data.stats.total || 0,
          newThisWeek: data?.data.stats.newThisWeek || 0,
          inInterview: data?.data.stats.byStatus?.interview || 0,
          offersSent: (data?.data.stats.byStatus?.offer || 0) + (data.data.stats.byStatus?.hired || 0),
          byStatus: data?.data.stats.byStatus || {}
        });
      }


    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleAddCandidateSuccess = () => {
    fetchCandidates();
    fetchStats();
    setShowAddCandidate(false);
    toast({
      title: "Success",
      description: "Candidate added successfully",
    });
  };

  const handleCandidateAction = async (action, candidateId, data = {}) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      let url = `${API_BASE_URL}/candidates/${candidateId}`;
      let method = 'PUT';
      
      if (action === 'delete') {
        method = 'DELETE';
      } else if (action === 'status') {
        url += '/status';
        method = 'PATCH';
      } else if (action === 'note') {
        url += '/notes';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          organizationId: user.organizationId,
          userId: user._id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Action failed');
      }

      // Refresh data
      fetchCandidates();
      fetchStats();
      
      toast({
        title: "Success",
        description: "Action completed successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleParseResume = async (candidateId) => {
    try {
      setParsingCandidateId(candidateId);
      
      // Check if candidate has resume
      const candidate = candidates.find(c => c._id === candidateId);
      if (!candidate?.resume?.url) {
        toast({
          title: "No Resume",
          description: "This candidate has no resume uploaded. Please upload one first.",
          variant: "destructive",
        });
        setParsingCandidateId(null);
        return;
      }

      // Parse the resume
      await candidateService.parseExistingResume(candidateId, true);
      
      // Refresh candidates list
      fetchCandidates();
      fetchStats();
      
      toast({
        title: "Success",
        description: "Resume parsed successfully",
      });
    } catch (error) {
      toast({
        title: "Parsing Failed",
        description: error.message || "Failed to parse resume",
        variant: "destructive",
      });
    } finally {
      setParsingCandidateId(null);
    }
  };

  const frontendStats = [
    { 
      label: "Total Candidates", 
      value: stats.total.toString(), 
      icon: FileText, 
      color: "text-primary", 
      bgColor: "bg-primary/10" 
    },
    { 
      label: "New This Week", 
      value: stats.newThisWeek.toString(), 
      icon: Plus, 
      color: "text-success", 
      bgColor: "bg-success/10" 
    },
    { 
      label: "In Interview", 
      value: stats.inInterview.toString(), 
      icon: Clock, 
      color: "text-warning", 
      bgColor: "bg-warning/10" 
    },
    { 
      label: "Offers Sent", 
      value: stats.offersSent.toString(), 
      icon: CheckCircle2, 
      color: "text-accent", 
      bgColor: "bg-accent/10" 
    },
  ];

  // Calculate tab counts
  const tabCounts = {
    all: candidates.length,
    new: stats.byStatus?.NEW || 0,
    screening: stats.byStatus?.SCREENING || 0,
    interview: stats.byStatus?.INTERVIEW || 0,
    offer: (stats.byStatus?.OFFER || 0) + (stats.byStatus?.HIRED || 0),
    rejected: stats.byStatus?.REJECTED || 0,
  };

  if (loading && candidates.length === 0) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2">Loading candidates...</span>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
            <p className="text-muted-foreground mt-1">Manage and track all your candidates</p>
          </div>
          <Button variant="accent" onClick={() => setShowAddCandidate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {frontendStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search candidates by name, email, or role..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all-roles">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-roles">All Roles</SelectItem>
                  {/* This would be populated from your jobs API */}
                  <SelectItem value="frontend">Frontend Developer</SelectItem>
                  <SelectItem value="backend">Backend Developer</SelectItem>
                  <SelectItem value="pm">Product Manager</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Candidate List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
            <TabsTrigger value="new">New ({tabCounts.new})</TabsTrigger>
            <TabsTrigger value="screening">Screening ({tabCounts.screening})</TabsTrigger>
            <TabsTrigger value="interview">Interview ({tabCounts.interview})</TabsTrigger>
            <TabsTrigger value="offer">Offer ({tabCounts.offer})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({tabCounts.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent mr-2" />
                <span>Loading candidates...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Error: {error}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchCandidates}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No candidates found</p>
                <Button 
                  variant="accent" 
                  onClick={() => setShowAddCandidate(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Candidate
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card variant="interactive">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          {/* Avatar */}
                          <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <span className="text-xl font-semibold text-accent">
                              {candidate.personalInfo.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>

                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-semibold text-foreground">
                                    {candidate.personalInfo.name}
                                  </h3>
                                  {getStatusBadge(candidate.status)}
                                </div>
                                <p className="text-muted-foreground mt-1">
                                  {candidate.jobId?.title || 'No role specified'}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => router.push(`/recruiter/candidates/${candidate._id}`)}
    title="View Profile"
  >
    <Mail className="h-4 w-4" />
  </Button>
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => handleParseResume(candidate._id)}
    disabled={parsingCandidateId === candidate._id}
    title="Parse Resume"
  >
    {parsingCandidateId === candidate._id ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <FileText className="h-4 w-4" />
    )}
  </Button>
  <CandidateActionsMenu
    candidateId={candidate._id}
    candidateName={candidate.personalInfo.name}
    status={candidate.status}
    jobId={candidate.jobId?._id}
    onSuccess={() => {
      fetchCandidates();
      fetchStats();
    }}
  />
</div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                <span>{candidate.personalInfo.email}</span>
                              </div>
                              {candidate.personalInfo.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  <span>{candidate.personalInfo.phone}</span>
                                </div>
                              )}
                              {candidate.personalInfo.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{candidate.personalInfo.location}</span>
                                </div>
                              )}
                              {candidate.appliedAt && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Applied {new Date(candidate.appliedAt).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>

                            {candidate.skills && candidate.skills.length > 0 && (
                              <div className="flex items-center gap-2 mt-4">
                                {candidate.skills.slice(0, 3).map((skill) => {
                                  const skillName = typeof skill === 'string' ? skill : (skill?.name || '');
                                  if (!skillName) return null;
                                  return (
                                    <Badge key={skill._id || skill.name || skill} variant="secondary" className="text-xs rounded-full">
                                      {skillName}
                                    </Badge>
                                  );
                                })}
                                {candidate.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs rounded-full">
                                    +{candidate.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-6 mt-4">
                              {/* Match Score */}
                              {candidate.matchScore && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Match:</span>
                                  <div className="w-24">
                                    <Progress value={candidate.matchScore} className="h-2" />
                                  </div>
                                  <span className="text-sm font-medium text-foreground">{candidate.matchScore}%</span>
                                </div>
                              )}

                              {/* Rating */}
                              {candidate.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-warning fill-warning" />
                                  <span className="text-sm font-medium text-foreground">{candidate.rating}</span>
                                </div>
                              )}
                            </div>

                            {/* Current Stage */}
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Current Stage:</span>
                                  <span className="text-sm font-medium text-foreground">
                                    {candidate.currentStage || 'Application Received'}
                                  </span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => router.push(`/recruiter/candidates/${candidate._id}`)}>
                                  View Profile
                                  <ArrowUpRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddCandidateModal 
        open={showAddCandidate} 
        onOpenChange={setShowAddCandidate}
        onSuccess={handleAddCandidateSuccess}
      />
    </RecruiterLayout>
  );
};

export default Candidates;