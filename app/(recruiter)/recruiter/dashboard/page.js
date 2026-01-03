"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  ClipboardList, 
  Calendar,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  TrendingUp,
  Plus
} from "lucide-react";
import Link from "next/link";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getRecruiterDashboard, formatInterviewTime, formatReportDate } from "@/lib/dashboardApi";

const STAT_CONFIG = {
  openPositions: {
    title: "Open Positions",
    icon: Briefcase,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  activeCandidates: {
    title: "Active Candidates",
    icon: Users,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  pendingInterviews: {
    title: "Pending Interviews",
    icon: ClipboardList,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  completedThisWeek: {
    title: "Completed This Week",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
};

const RecruiterDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecruiterDashboard();
        console.log('Dashboard data received:', data); // Debug logging
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Build stats array from dashboard data with extra safety checks
  const buildStats = () => {
    if (!dashboardData) return [];
    
    const data = dashboardData;
    const stats_obj = data.stats || data || {};
    
    console.log('Building stats from:', stats_obj);
    
    return [
      {
        key: "openPositions",
        title: STAT_CONFIG.openPositions.title,
        value: stats_obj.openPositions?.value ?? stats_obj.value ?? "0",
        subtitle: stats_obj.openPositions?.subtitle ?? "0 urgent",
        icon: STAT_CONFIG.openPositions.icon,
        color: STAT_CONFIG.openPositions.color,
        bgColor: STAT_CONFIG.openPositions.bgColor,
      },
      {
        key: "activeCandidates",
        title: STAT_CONFIG.activeCandidates.title,
        value: stats_obj.activeCandidates?.value ?? "0",
        subtitle: stats_obj.activeCandidates?.subtitle ?? "0 new this week",
        icon: STAT_CONFIG.activeCandidates.icon,
        color: STAT_CONFIG.activeCandidates.color,
        bgColor: STAT_CONFIG.activeCandidates.bgColor,
      },
      {
        key: "pendingInterviews",
        title: STAT_CONFIG.pendingInterviews.title,
        value: stats_obj.pendingInterviews?.value ?? "0",
        subtitle: stats_obj.pendingInterviews?.subtitle ?? "0 scheduled today",
        icon: STAT_CONFIG.pendingInterviews.icon,
        color: STAT_CONFIG.pendingInterviews.color,
        bgColor: STAT_CONFIG.pendingInterviews.bgColor,
      },
      {
        key: "completedThisWeek",
        title: STAT_CONFIG.completedThisWeek.title,
        value: stats_obj.completedThisWeek?.value ?? "0",
        subtitle: stats_obj.completedThisWeek?.subtitle ?? "+0% vs last week",
        icon: STAT_CONFIG.completedThisWeek.icon,
        color: STAT_CONFIG.completedThisWeek.color,
        bgColor: STAT_CONFIG.completedThisWeek.bgColor,
      },
    ];
  };

  const stats = buildStats();

  const upcomingInterviews = dashboardData?.upcomingInterviews || [];
  const recentReports = dashboardData?.recentReports || [];

  if (error) {
    return (
      <RecruiterLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your hiring overview.</p>
            </div>
            <Link href="/recruiter/interviews/new" legacyBehavior>
              <Button variant="accent">
                <Plus className="h-4 w-4 mr-2" />
                Create Interview
              </Button>
            </Link>
          </div>

          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive">Failed to load dashboard</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <p className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded font-mono break-all">
                    Check browser console for more details
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your hiring overview.</p>
          </div>
          <Link href="/recruiter/interviews/new" legacyBehavior>
            <Button variant="accent">
              <Plus className="h-4 w-4 mr-2" />
              Create Interview
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} variant="interactive">
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="interactive">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{stat.subtitle}</p>
                      </div>
                      <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Interviews */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>Your scheduled interviews for the next 48 hours</CardDescription>
              </div>
              <Link href="/recruiter/schedule" legacyBehavior>
                <Button variant="outline" size="sm">View Calendar</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-20 bg-muted animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : upcomingInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming interviews scheduled</p>
                  <Link href="/recruiter/interviews/new" legacyBehavior>
                    <Button variant="outline" className="mt-4">Schedule Interview</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, index) => (
                    <motion.div
                      key={interview.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-accent">
                          {interview.candidate
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{interview.candidate}</p>
                        <p className="text-sm text-muted-foreground truncate">{interview.role}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-muted-foreground justify-end">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{formatInterviewTime(interview.time)}</span>
                        </div>
                        <Badge
                          variant={interview.status === "ready" ? "success" : "warning"}
                          className="mt-1"
                        >
                          {interview.status === "ready" ? "Ready" : "Pending Setup"}
                        </Badge>
                      </div>
                      <Link href={`/recruiter/interviews/${interview.id}`} legacyBehavior>
                        <Button variant="ghost" size="icon">
                          <Play className="h-4 w-4" />
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/recruiter/interviews/new" legacyBehavior>
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="h-4 w-4 mr-3" />
                  Create New Interview
                </Button>
              </Link>
              <Link href="/recruiter/candidates" legacyBehavior>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-3" />
                  Add Candidate
                </Button>
              </Link>
              <Link href="/recruiter/jobs" legacyBehavior>
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="h-4 w-4 mr-3" />
                  Post New Job
                </Button>
              </Link>
              <Link href="/recruiter/reports" legacyBehavior>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-3" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Interview Reports</CardTitle>
              <CardDescription>Latest completed interviews and evaluations</CardDescription>
            </div>
            <Link href="/recruiter/reports" legacyBehavior>
              <Button variant="outline" size="sm">View All Reports</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-20 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reports yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:shadow-card transition-all"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {report.candidate
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{report.candidate}</p>
                      <p className="text-sm text-muted-foreground truncate">{report.role}</p>
                    </div>
                    <div className="w-32 flex-shrink-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Score</span>
                        <span className="text-sm font-medium text-foreground">{report.score}%</span>
                      </div>
                      <Progress value={report.score} className="h-2" />
                    </div>
                    <Badge
                      variant={
                        report.recommendation === "strong_hire"
                          ? "success"
                          : report.recommendation === "hire"
                          ? "info"
                          : "destructive"
                      }
                      className="flex-shrink-0"
                    >
                      {report.recommendation === "strong_hire"
                        ? "Strong Hire"
                        : report.recommendation === "hire"
                        ? "Hire"
                        : "No Hire"}
                    </Badge>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{formatReportDate(report.completedAt)}</p>
                    </div>
                    <Link href={`/recruiter/reports/${report.interviewId}`} legacyBehavior>
                      <Button variant="ghost" size="icon">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterDashboard;