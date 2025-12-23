"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Share2,
  BarChart3
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterJob, setFilterJob] = useState("all");
  const [filterRecommendation, setFilterRecommendation] = useState("all");

  const stats = {
    totalReports: reports.length,
    strongHires: reports.filter(r => r.recommendation === "strong_hire").length,
    hires: reports.filter(r => r.recommendation === "hire").length,
    noHires: reports.filter(r => r.recommendation === "no_hire").length,
  };

  const filteredReports = reports.filter(report => {
    if (filterRecommendation !== "all" && report.recommendation !== filterRecommendation) return false;
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalReports}</p>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.strongHires}</p>
                  <p className="text-sm text-muted-foreground">Strong Hires</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.hires}</p>
                  <p className="text-sm text-muted-foreground">Recommended Hires</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.noHires}</p>
                  <p className="text-sm text-muted-foreground">Not Recommended</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." className="pl-10" />
          </div>
          <Select value={filterRecommendation} onValueChange={setFilterRecommendation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Recommendation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recommendations</SelectItem>
              <SelectItem value="strong_hire">Strong Hire</SelectItem>
              <SelectItem value="hire">Hire</SelectItem>
              <SelectItem value="no_hire">No Hire</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                variant="interactive" 
                onClick={() => setSelectedReport(report)}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <span className="text-lg font-semibold text-accent">
                        {report.candidate.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{report.candidate}</h3>
                        {getRecommendationBadge(report.recommendation)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{report.role}</p>
                    </div>
                    
                    {/* Scores */}
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Job Fit</p>
                        <p className={`text-lg font-bold ${getScoreColor(report.jobFitScore)}`}>{report.jobFitScore}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Technical</p>
                        <p className={`text-lg font-bold ${getScoreColor(report.technicalScore)}`}>{report.technicalScore}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Communication</p>
                        <p className={`text-lg font-bold ${getScoreColor(report.communicationScore)}`}>{report.communicationScore}%</p>
                      </div>
                    </div>

                    {/* Overall Score */}
                    <div className="text-right">
                      <div className="w-16">
                        <Progress
  value={report.score}
  className="h-2"
  indicatorClassName={getProgressColor(report.score)}
/>

                      </div>
                      <p className={`text-2xl font-bold ${getScoreColor(report.score)} mt-1`}>{report.score}%</p>
                      <p className="text-xs text-muted-foreground">Overall</p>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="font-semibold text-accent">
                      {selectedReport.candidate.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <span>{selectedReport.candidate}</span>
                    <p className="text-sm font-normal text-muted-foreground">{selectedReport.role}</p>
                  </div>
                  {getRecommendationBadge(selectedReport.recommendation)}
                </DialogTitle>
                <DialogDescription>
                  Interview completed on {selectedReport.completedAt}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Score Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Score Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <p className="text-3xl font-bold text-foreground">{selectedReport.score}%</p>
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <p className="text-3xl font-bold text-foreground">{selectedReport.jobFitScore}%</p>
                        <p className="text-sm text-muted-foreground">Job Fit</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <p className="text-3xl font-bold text-foreground">{selectedReport.technicalScore}%</p>
                        <p className="text-sm text-muted-foreground">Technical</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <p className="text-3xl font-bold text-foreground">{selectedReport.communicationScore}%</p>
                        <p className="text-sm text-muted-foreground">Communication</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-success" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.strengths.map((strength, i) => (
                          <Badge key={i} variant="success">{strength}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-warning" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.weaknesses.length > 0 ? (
                          selectedReport.weaknesses.map((weakness, i) => (
                            <Badge key={i} variant="warning">{weakness}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">None identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Red Flags */}
                {selectedReport.redFlags.length > 0 && (
                  <Card className="border-destructive/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Red Flags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.redFlags.map((flag, i) => (
                          <Badge key={i} variant="destructive">{flag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share with Hiring Manager
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Reject</Button>
                    <Button variant="success">Move to Next Stage</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </RecruiterLayout>
  );
};

export default Reports;