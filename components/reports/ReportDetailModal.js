import { useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Share2,
  Download,
  Shield,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Info,
  FileText,
  Send,
  StickyNote,
  History,
  Link2,
  User,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import reportService from "@/lib/reportService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const getConfidenceColor = (confidence) => {
  switch (confidence) {
    case 'high': return 'text-success';
    case 'medium': return 'text-warning';
    case 'low': return 'text-destructive';
  }
};

const getDecisionLabel = (decision) => {
  const labels = {
    shortlist: 'Shortlist',
    schedule_human_interview: 'Schedule Interview',
    re_interview: 'Re-interview',
    on_hold: 'On Hold',
    next_round: 'Next Round',
    rejected: 'Rejected',
    hired: 'Hired',
  };
  return labels[decision];
};

export const ReportDetailModal = ({ report, open, onClose }) => {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [newNote, setNewNote] = useState("");
  const [selectedDecision, setSelectedDecision] = useState("");
  const [acknowledgeAI, setAcknowledgeAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || !report || !report._id) {
      if (!report?._id) {
        toast({
          title: "Error",
          description: "Report ID is missing",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      setIsLoading(true);
      await reportService.addComment(report._id, newComment, "recruiter");
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      // Optionally refresh report data
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [newComment, report, toast]);

  const handleAddNote = useCallback(async () => {
    if (!newNote.trim() || !report || !report._id) {
      if (!report?._id) {
        toast({
          title: "Error",
          description: "Report ID is missing",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      setIsLoading(true);
      await reportService.addPrivateNote(report._id, newNote);
      setNewNote("");
      toast({
        title: "Success",
        description: "Private note added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [newNote, report, toast]);

  const handleSubmitDecision = useCallback(async () => {
    if (!selectedDecision || !report || !report._id) {
      if (!report?._id) {
        toast({
          title: "Error",
          description: "Report ID is missing",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      setIsLoading(true);
      await reportService.addReview(report._id, selectedDecision, "", "recruiter");
      setSelectedDecision("");
      toast({
        title: "Success",
        description: `Decision recorded: ${selectedDecision}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDecision, report, toast]);

  const handleExportPDF = useCallback(async () => {
    if (!report || !report._id) {
      toast({
        title: "Error",
        description: "Report ID is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const blob = await reportService.exportReportPDF(report._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${report.candidate}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [report, toast]);

  if (!report) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* Header */}
          <div className="p-6 border-b border-border shrink-0">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="font-semibold text-accent">
                      {report.candidate.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {report.candidate}
                      {getRecommendationBadge(report.recommendation)}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-3 mt-1">
                      <span>{report.role}</span>
                      <span>•</span>
                      <span>Completed {formatDate(report.completedAt)}</span>
                    </DialogDescription>
                  </div>
                </div>

                {/* Version Info */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-right text-xs text-muted-foreground cursor-help">
                        <p>v{report.versionInfo.version}</p>
                        <p className="text-[10px]">AI: {report.versionInfo.aiModelVersion}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Report generated: {formatDate(report.versionInfo.generatedAt)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DialogHeader>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="questions">Questions ({report.questionBreakdown.length})</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews & Decisions</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Score Summary with AI Explainability */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Score Summary
                        <Badge variant="outline" className="font-normal">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Top {100 - report.benchmarking.percentileRank}% of {report.benchmarking.totalCandidates} candidates
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { label: 'Overall', data: report.overallScore },
                          { label: 'Job Fit', data: report.jobFitScore },
                          { label: 'Technical', data: report.technicalScore },
                          { label: 'Communication', data: report.communicationScore },
                        ].map(({ label, data }) => (
                          <TooltipProvider key={label}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-center p-4 bg-secondary/30 rounded-lg cursor-help hover:bg-secondary/50 transition-colors">
                                  <p className="text-3xl font-bold text-foreground">{data.score}%</p>
                                  <p className="text-sm text-muted-foreground">{label}</p>
                                  <div className="flex items-center justify-center gap-1 mt-2">
                                    <div className={`h-2 w-2 rounded-full ${data.confidence === 'high' ? 'bg-success' : data.confidence === 'medium' ? 'bg-warning' : 'bg-destructive'}`} />
                                    <span className={`text-xs capitalize ${getConfidenceColor(data.confidence)}`}>
                                      {data.confidence} confidence
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="font-medium mb-1">Why this score?</p>
                                <p className="text-sm">{data.explanation}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>

                      {/* Benchmarking Context */}
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Benchmark:</strong> Role average: {report.benchmarking.roleAverage}% | Historical average: {report.benchmarking.historicalAverage}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Recommendation Explanation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-accent" />
                        AI Recommendation Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground">{report.recommendationExplanation}</p>
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
                          {report.strengths.map((strength, i) => (
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
                          {report.weaknesses.length > 0 ? (
                            report.weaknesses.map((weakness, i) => (
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
                  {report.redFlags.length > 0 && (
                    <Card className="border-destructive/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-5 w-5" />
                          Red Flags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {report.redFlags.map((flag, i) => (
                            <Badge key={i} variant="destructive">{flag}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Private Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <StickyNote className="h-5 w-5 text-muted-foreground" />
                        Private Notes
                        <Badge variant="secondary" className="ml-2 text-xs">Internal Only</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {report.privateNotes.map((note) => (
                        <div key={note.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{note.authorName}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                          </div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Add a private note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="flex-1"
                          rows={2}
                          disabled={isLoading}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="self-end"
                          onClick={handleAddNote}
                          disabled={isLoading || !newNote.trim()}
                        >
                          <StickyNote className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Questions Tab */}
                <TabsContent value="questions" className="space-y-4">
                  {report.questionBreakdown.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                      {report.questionBreakdown.map((q, idx) => (
                        <AccordionItem key={q.id} value={q.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-4 text-left w-full pr-4">
                              <span className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                Q{idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{q.questionText}</p>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span className={`font-semibold ${q.score >= 70 ? 'text-success' : q.score >= 50 ? 'text-warning' : 'text-destructive'}`}>
                                    {q.score}%
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(q.timeTaken)}
                                  </span>
                                  {q.redFlags.length > 0 && (
                                    <span className="flex items-center gap-1 text-destructive">
                                      <AlertCircle className="h-3 w-3" />
                                      {q.redFlags.length} flag{q.redFlags.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-12 space-y-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Response Summary</p>
                                <p className="text-foreground">{q.responseSummary}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">AI Evaluation</p>
                                <p className="text-foreground">{q.evaluation}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Confidence:</span>
                                <span className={`text-sm font-medium capitalize ${getConfidenceColor(q.confidence)}`}>
                                  {q.confidence}
                                </span>
                              </div>
                              {q.redFlags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {q.redFlags.map((flag, i) => (
                                    <Badge key={i} variant="destructive">{flag}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No question breakdown available for this report.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6">
                  {/* Decision Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Make Decision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Select value={selectedDecision} onValueChange={(v) => setSelectedDecision(v)}>
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select action..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shortlist">Shortlist</SelectItem>
                            <SelectItem value="schedule_human_interview">Schedule Human Interview</SelectItem>
                            <SelectItem value="next_round">Move to Next Round</SelectItem>
                            <SelectItem value="on_hold">Put On Hold</SelectItem>
                            <SelectItem value="re_interview">Request Re-interview</SelectItem>
                            <SelectItem value="rejected">Reject</SelectItem>
                            <SelectItem value="hired">Mark as Hired</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          disabled={!selectedDecision || isLoading}
                          onClick={handleSubmitDecision}
                        >
                          Submit Decision
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="acknowledge"
                          checked={acknowledgeAI}
                          onCheckedChange={(c) => setAcknowledgeAI(c)}
                        />
                        <label htmlFor="acknowledge" className="text-sm text-muted-foreground">
                          I have reviewed and acknowledge the AI recommendation
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Review History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Review History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {report.reviews.length > 0 ? (
                        <div className="space-y-4">
                          {report.reviews.map((review, idx) => (
                            <div key={review.id || idx} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{review.reviewerName}</span>
                                  <Badge variant="outline" className="text-xs capitalize">{review.reviewerRole.replace('_', ' ')}</Badge>
                                  {review.decision && (
                                    <Badge variant="secondary">{getDecisionLabel(review.decision)}</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{review.notes}</p>
                                <p className="text-xs text-muted-foreground mt-2">{formatDate(review.reviewedAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No reviews yet.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Comments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {report.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-accent">
                              {comment.authorName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.authorName}</span>
                              <Badge variant="outline" className="text-xs capitalize">{comment.authorRole.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(comment.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment... Use @ to mention"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                          disabled={isLoading}
                        />
                        <Button 
                          size="sm"
                          onClick={handleAddComment}
                          disabled={isLoading || !newComment.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Compliance Tab */}
                <TabsContent value="compliance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5 text-accent" />
                          Interview Integrity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <p className="text-4xl font-bold text-foreground">{report.compliance.interviewIntegrityScore}%</p>
                          <p className="text-sm text-muted-foreground">Integrity Score</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tab Switches</span>
                            <span className={report.compliance.monitoringEvents.tabSwitches > 2 ? 'text-destructive' : 'text-foreground'}>
                              {report.compliance.monitoringEvents.tabSwitches}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Face Missing Count</span>
                            <span className={report.compliance.monitoringEvents.faceMissingCount > 2 ? 'text-destructive' : 'text-foreground'}>
                              {report.compliance.monitoringEvents.faceMissingCount}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Silence Duration</span>
                            <span>{report.compliance.monitoringEvents.audioSilenceDuration}s</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Multiple Voices</span>
                            <span className={report.compliance.monitoringEvents.multipleVoicesDetected ? 'text-destructive' : 'text-success'}>
                              {report.compliance.monitoringEvents.multipleVoicesDetected ? 'Detected' : 'No'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Bias & Fairness</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Bias Detection</span>
                          <Badge variant={report.compliance.biasDetectionStatus === 'clear' ? 'success' : report.compliance.biasDetectionStatus === 'review_needed' ? 'warning' : 'destructive'}>
                            {report.compliance.biasDetectionStatus === 'clear' ? 'Clear' : report.compliance.biasDetectionStatus === 'review_needed' ? 'Review Needed' : 'Flagged'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Data Balance</span>
                          <span className={`text-sm font-medium capitalize ${getConfidenceColor(report.compliance.dataBalanceConfidence)}`}>
                            {report.compliance.dataBalanceConfidence}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Audit Trail Tab */}
                <TabsContent value="audit" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Activity Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pl-6 border-l-2 border-border space-y-4">
                        {report.auditLog.map((entry) => (
                          <div key={entry.id} className="relative">
                            <div className="absolute -left-[29px] h-4 w-4 rounded-full bg-primary/20 border-2 border-primary" />
                            <div className="pb-4">
                              <p className="font-medium text-sm">{entry.action}</p>
                              <p className="text-xs text-muted-foreground">
                                by {entry.performedBy} ({entry.performedByRole})
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border shrink-0 bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      Assign to Hiring Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link2 className="h-4 w-4 mr-2" />
                      Create Time-Limited Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Share Anonymized Version
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportPDF} disabled={isLoading}>Export as PDF</DropdownMenuItem>
                    <DropdownMenuItem disabled>Export as CSV</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>Export with Watermark</DropdownMenuItem>
                    <DropdownMenuItem disabled>Export Redacted Version</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
