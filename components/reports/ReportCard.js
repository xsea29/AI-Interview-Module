import { motion } from "framer-motion";
import {
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  TrendingUp,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const getLifecycleBadge = (status) => {
  const variants = {
    draft: { variant: "secondary", label: "Draft" },
    reviewed: { variant: "info", label: "Reviewed" },
    approved: { variant: "success", label: "Approved" },
    actioned: { variant: "default", label: "Actioned" },
    archived: { variant: "outline", label: "Archived" },
  };
  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
};

const getConfidenceIndicator = (confidence) => {
  const colors = {
    high: "bg-success",
    medium: "bg-warning",
    low: "bg-destructive",
  };
  return (
    <div className="flex items-center gap-1">
      <div className={`h-2 w-2 rounded-full ${colors[confidence]}`} />
      <span className="text-xs text-muted-foreground capitalize">{confidence}</span>
    </div>
  );
};

export const ReportCard = ({ report, index, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card variant="interactive" onClick={() => onSelect(report)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold text-accent">
                {report.candidate.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{report.candidate}</h3>
                {getRecommendationBadge(report.recommendation)}
                {getLifecycleBadge(report.lifecycleStatus)}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-muted-foreground">{report.role}</p>
                {report.comments.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {report.comments.length}
                  </span>
                )}
              </div>
            </div>

            {/* Scores with Confidence */}
            <div className="hidden lg:flex items-center gap-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <p className="text-xs text-muted-foreground">Job Fit</p>
                      <p className="text-lg font-bold text-foreground">{report.jobFitScore.score}%</p>
                      {getConfidenceIndicator(report.jobFitScore.confidence)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{report.jobFitScore.explanation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <p className="text-xs text-muted-foreground">Technical</p>
                      <p className="text-lg font-bold text-foreground">{report.technicalScore.score}%</p>
                      {getConfidenceIndicator(report.technicalScore.confidence)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{report.technicalScore.explanation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <p className="text-xs text-muted-foreground">Communication</p>
                      <p className="text-lg font-bold text-foreground">{report.communicationScore.score}%</p>
                      {getConfidenceIndicator(report.communicationScore.confidence)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{report.communicationScore.explanation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Benchmarking */}
            <div className="hidden xl:block text-center px-4 py-2 bg-accent/5 rounded-lg">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-accent">
                  Top {100 - report.benchmarking.percentileRank}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                of {report.benchmarking.totalCandidates} candidates
              </p>
            </div>

            {/* Integrity Score */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-secondary/50 cursor-help">
                    <Shield className={`h-4 w-4 ${report.compliance.interviewIntegrityScore >= 90 ? 'text-success' : report.compliance.interviewIntegrityScore >= 70 ? 'text-warning' : 'text-destructive'}`} />
                    <span className="text-sm font-medium">{report.compliance.interviewIntegrityScore}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Interview Integrity Score</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Overall Score */}
            <div className="text-right">
              <div className="w-16">
                <Progress value={report.overallScore.score} className="h-2" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{report.overallScore.score}%</p>
              <p className="text-xs text-muted-foreground">Overall</p>
            </div>

            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation();
              onSelect(report);
            }}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
