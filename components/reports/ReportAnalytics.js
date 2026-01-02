import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const ReportAnalytics = ({ reports }) => {
  // Calculate analytics
  const totalReports = reports.length;
  const strongHires = reports.filter(r => r.recommendation === 'strong_hire').length;
  const hires = reports.filter(r => r.recommendation === 'hire').length;
  const noHires = reports.filter(r => r.recommendation === 'no_hire').length;
  const borderline = reports.filter(r => r.recommendation === 'borderline').length;

  const avgScore = totalReports > 0
    ? Math.round(reports.reduce((acc, r) => acc + r.overallScore.score, 0) / totalReports)
    : 0;

  const passRate = totalReports > 0
    ? Math.round(((strongHires + hires) / totalReports) * 100)
    : 0;

  const pendingReviews = reports.filter(r => r.lifecycleStatus === 'draft').length;
  const actioned = reports.filter(r => r.lifecycleStatus === 'actioned').length;

  // Score distribution
  const scoreRanges = [
    { label: '90-100', count: reports.filter(r => r.overallScore.score >= 90).length },
    { label: '70-89', count: reports.filter(r => r.overallScore.score >= 70 && r.overallScore.score < 90).length },
    { label: '50-69', count: reports.filter(r => r.overallScore.score >= 50 && r.overallScore.score < 70).length },
    { label: '0-49', count: reports.filter(r => r.overallScore.score < 50).length },
  ];

  const maxCount = Math.max(...scoreRanges.map(r => r.count), 1);

  // Roles with most candidates
  const roleStats = reports.reduce((acc, r) => {
    acc[r.role] = (acc[r.role] || 0) + 1;
    return acc;
  }, {});

  const topRoles = Object.entries(roleStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalReports}</p>
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
                <p className="text-2xl font-bold text-foreground">{passRate}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingReviews}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommendation Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-accent" />
              Recommendation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">Strong Hire</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={totalReports > 0 ? (strongHires / totalReports) * 100 : 0} className="w-24 h-2" />
                  <span className="text-sm font-medium w-8">{strongHires}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-info" />
                  <span className="text-sm">Hire</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={totalReports > 0 ? (hires / totalReports) * 100 : 0} className="w-24 h-2" />
                  <span className="text-sm font-medium w-8">{hires}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-sm">Borderline</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={totalReports > 0 ? (borderline / totalReports) * 100 : 0} className="w-24 h-2" />
                  <span className="text-sm font-medium w-8">{borderline}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">No Hire</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={totalReports > 0 ? (noHires / totalReports) * 100 : 0} className="w-24 h-2" />
                  <span className="text-sm font-medium w-8">{noHires}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoreRanges.map((range) => (
                <div key={range.label} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-16">{range.label}</span>
                  <div className="flex-1 h-6 bg-muted/50 rounded overflow-hidden">
                    <div
                      className="h-full bg-accent/70 rounded transition-all duration-500"
                      style={{ width: `${(range.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{range.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lifecycle Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiring Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Draft (Pending Review)', count: reports.filter(r => r.lifecycleStatus === 'draft').length, color: 'bg-secondary' },
              { label: 'Reviewed', count: reports.filter(r => r.lifecycleStatus === 'reviewed').length, color: 'bg-info' },
              { label: 'Approved', count: reports.filter(r => r.lifecycleStatus === 'approved').length, color: 'bg-success' },
              { label: 'Actioned', count: reports.filter(r => r.lifecycleStatus === 'actioned').length, color: 'bg-primary' },
              { label: 'Archived', count: reports.filter(r => r.lifecycleStatus === 'archived').length, color: 'bg-muted' },
            ].map((status) => (
              <div key={status.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${status.color}`} />
                  <span className="text-sm">{status.label}</span>
                </div>
                <span className="text-sm font-medium">{status.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Roles by Volume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRoles.map(([role, count], idx) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">#{idx + 1}</span>
                  <span className="text-sm">{role}</span>
                </div>
                <span className="text-sm font-medium">{count} reports</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
