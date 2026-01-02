"use client";
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
import { mockReports } from "@/types/report";

const stats = [
  {
    title: "Open Positions",
    value: "8",
    subtitle: "3 urgent",
    icon: Briefcase,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Active Candidates",
    value: "47",
    subtitle: "12 new this week",
    icon: Users,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Pending Interviews",
    value: "15",
    subtitle: "5 scheduled today",
    icon: ClipboardList,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Completed This Week",
    value: "23",
    subtitle: "+18% vs last week",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

const upcomingInterviews = [
  {
    candidate: "Alex Johnson",
    role: "Senior Frontend Developer",
    time: "Today, 2:00 PM",
    status: "ready",
  },
  {
    candidate: "Sarah Chen",
    role: "Product Manager",
    time: "Today, 4:30 PM",
    status: "ready",
  },
  {
    candidate: "Mike Peters",
    role: "DevOps Engineer",
    time: "Tomorrow, 10:00 AM",
    status: "pending",
  },
  {
    candidate: "Emily Brown",
    role: "UX Designer",
    time: "Tomorrow, 2:00 PM",
    status: "pending",
  },
];

// Get 3 most recent reports from mock data
const recentReports = mockReports
  .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  .slice(0, 3)
  .map(report => ({
    candidate: report.candidate,
    role: report.role,
    score: report.overallScore.score,
    recommendation: report.recommendation,
    completedAt: new Date(report.completedAt).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    }),
  }));

const RecruiterDashboard = () => {
  return (
    <RecruiterLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, Jane! Here&apos;s your hiring overview.</p>
          </div>
          <Link href="/recruiter/interviews/new" legacyBehavior>
            <Button variant="accent">
              <Plus className="h-4 w-4 mr-2" />
              Create Interview
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
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
              <div className="space-y-4">
                {upcomingInterviews.map((interview, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-accent">
                        {interview.candidate.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{interview.candidate}</p>
                      <p className="text-sm text-muted-foreground">{interview.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{interview.time}</span>
                      </div>
                      <Badge 
                        variant={interview.status === "ready" ? "success" : "warning"} 
                        className="mt-1"
                      >
                        {interview.status === "ready" ? "Ready" : "Pending Setup"}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
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
            <div className="space-y-4">
              {recentReports.map((report, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:shadow-card transition-all"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {report.candidate.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{report.candidate}</p>
                    <p className="text-sm text-muted-foreground">{report.role}</p>
                  </div>
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className="text-sm font-medium text-foreground">{report.score}%</span>
                    </div>
                    <Progress value={report.score} className="h-2" />
                  </div>
                  <Badge 
                    variant={
                      report.recommendation === "strong_hire" ? "success" :
                      report.recommendation === "hire" ? "info" : "destructive"
                    }
                  >
                    {report.recommendation === "strong_hire" ? "Strong Hire" :
                     report.recommendation === "hire" ? "Hire" : "No Hire"}
                  </Badge>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{report.completedAt}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterDashboard;