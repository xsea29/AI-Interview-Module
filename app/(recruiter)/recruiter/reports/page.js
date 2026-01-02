"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download } from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportDetailModal } from "@/components/reports/ReportDetailModal";
import { ReportAnalytics } from "@/components/reports/ReportAnalytics";
import { mockReports } from "@/types/report";
import reportService from "@/lib/reportService";

const getScoreColor = (score) => {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-accent";
  if (score >= 50) return "text-warning";
  return "text-destructive";
};

const getProgressColor = (score) => {
  if (score >= 85) return "bg-success";
  if (score >= 70) return "bg-accent";
  if (score >= 50) return "bg-warning";
  return "bg-destructive";
};



const reports = [
  {
    id: 1,
    candidate: "Mike Peters",
    role: "DevOps Engineer",
    completedAt: "Dec 18, 2024",
    score: 85,
    recommendation: "strong_hire",
    jobFitScore: 92,
    technicalScore: 88,
    communicationScore: 82,
    strengths: ["Cloud Architecture", "Problem Solving", "System Design"],
    weaknesses: ["Frontend Experience"],
    redFlags: [],
  },
  {
    id: 2,
    candidate: "Emily Brown",
    role: "UX Designer",
    completedAt: "Dec 17, 2024",
    score: 72,
    recommendation: "hire",
    jobFitScore: 78,
    technicalScore: 70,
    communicationScore: 85,
    strengths: ["User Research", "Prototyping", "Communication"],
    weaknesses: ["Technical Implementation", "Data Analysis"],
    redFlags: [],
  },
  {
    id: 3,
    candidate: "David Kim",
    role: "Backend Developer",
    completedAt: "Dec 16, 2024",
    score: 45,
    recommendation: "no_hire",
    jobFitScore: 40,
    technicalScore: 48,
    communicationScore: 52,
    strengths: ["Basic Python Knowledge"],
    weaknesses: ["System Design", "Database Optimization", "API Design"],
    redFlags: ["Inconsistent Answers", "Lack of Depth"],
  },
  {
    id: 4,
    candidate: "Sarah Chen",
    role: "Product Manager",
    completedAt: "Dec 15, 2024",
    score: 78,
    recommendation: "hire",
    jobFitScore: 82,
    technicalScore: 75,
    communicationScore: 90,
    strengths: ["Strategic Thinking", "Stakeholder Management", "Communication"],
    weaknesses: ["Technical Depth"],
    redFlags: [],
  },
  {
    id: 5,
    candidate: "Alex Johnson",
    role: "Senior Frontend Developer",
    completedAt: "Dec 14, 2024",
    score: 88,
    recommendation: "strong_hire",
    jobFitScore: 95,
    technicalScore: 92,
    communicationScore: 85,
    strengths: ["React Expertise", "Performance Optimization", "Code Quality"],
    weaknesses: [],
    redFlags: [],
  },
];

const getRecommendationBadge = (recommendation) => {
  switch (recommendation) {
    case "strong_hire":
      return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Strong Hire</Badge>;
    case "hire":
      return <Badge variant="info" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Hire</Badge>;
    case "borderline":
      return <Badge variant="warning" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Borderline</Badge>;
    case "no_hire":
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />No Hire</Badge>;
    default:
      return null;
  }
};

const Reports = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState(mockReports);
  const [analytics, setAnalytics] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRecommendation, setFilterRecommendation] = useState("all");
  const [filterLifecycle, setFilterLifecycle] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, skip: 0, limit: 20, hasMore: false });

  // Fetch reports on component mount and when filters change
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const data = await reportService.getReports({
          search: searchTerm,
          recommendation: filterRecommendation,
          lifecycleStatus: filterLifecycle,
          limit: pagination.limit,
          skip: pagination.skip,
        });
        setReports(data.reports || mockReports);
        setPagination(data.pagination || pagination);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        toast({
          title: "Note",
          description: "Using sample data. Backend not yet configured.",
          variant: "default",
        });
        // Keep using mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchReports();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filterRecommendation, filterLifecycle, pagination.skip, pagination.limit, toast]);

  // Fetch analytics when tab changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (activeTab !== 'analytics') return;
      
      try {
        const data = await reportService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        toast({
          title: "Note",
          description: "Using sample data for analytics.",
          variant: "default",
        });
      }
    };

    fetchAnalytics();
  }, [activeTab, toast]);

  // Local filtering for UI when backend is not ready
  const filteredReports = reports.filter(report => {
    if (searchTerm && !report.candidate.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterRecommendation !== "all" && report.recommendation !== filterRecommendation) return false;
    if (filterLifecycle !== "all" && report.lifecycleStatus !== filterLifecycle) return false;

    // Tab filters
    if (activeTab === "pending" && report.lifecycleStatus !== "draft") return false;
    if (activeTab === "approved" && report.lifecycleStatus !== "approved") return false;

    return true;
  });

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Interview Reports</h1>
            <p className="text-muted-foreground mt-1">Review interview evaluations and make hiring decisions</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Reports ({mockReports.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Review ({mockReports.filter(r => r.lifecycleStatus === 'draft').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({mockReports.filter(r => r.lifecycleStatus === 'approved').length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by candidate name..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterRecommendation} onValueChange={setFilterRecommendation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recommendations</SelectItem>
                  <SelectItem value="strong_hire">Strong Hire</SelectItem>
                  <SelectItem value="hire">Hire</SelectItem>
                  <SelectItem value="borderline">Borderline</SelectItem>
                  <SelectItem value="no_hire">No Hire</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLifecycle} onValueChange={setFilterLifecycle}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="actioned">Actioned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <ReportCard
                    key={report._id}
                    report={report}
                    index={index}
                    onSelect={setSelectedReport}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reports found matching your criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <div className="space-y-4">
              {filteredReports.filter(r => r.lifecycleStatus === 'draft').length > 0 ? (
                filteredReports
                  .filter(r => r.lifecycleStatus === 'draft')
                  .map((report, index) => (
                    <ReportCard
                      key={report._id}
                      report={report}
                      index={index}
                      onSelect={setSelectedReport}
                    />
                  ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No pending reports.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <div className="space-y-4">
              {filteredReports.filter(r => r.lifecycleStatus === 'approved').length > 0 ? (
                filteredReports
                  .filter(r => r.lifecycleStatus === 'approved')
                  .map((report, index) => (
                    <ReportCard
                      key={report._id}
                      report={report}
                      index={index}
                      onSelect={setSelectedReport}
                    />
                  ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No approved reports.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ReportAnalytics reports={analytics ? [] : mockReports} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </RecruiterLayout>
  );
};

export default Reports;