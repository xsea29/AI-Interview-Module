"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  ClipboardList, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Organizations",
    value: "24",
    change: "+3",
    changeType: "positive",
    icon: Building2,
  },
  {
    title: "Active Recruiters",
    value: "156",
    change: "+12",
    changeType: "positive",
    icon: Users,
  },
  {
    title: "Interviews This Month",
    value: "1,284",
    change: "+18%",
    changeType: "positive",
    icon: ClipboardList,
  },
  {
    title: "Platform Uptime",
    value: "99.9%",
    change: "Healthy",
    changeType: "neutral",
    icon: Activity,
  },
];

const recentActivity = [
  { type: "org_created", message: "New organization 'TechCorp Inc.' created", time: "2 min ago", status: "success" },
  { type: "user_added", message: "5 new recruiters added to 'StartupXYZ'", time: "15 min ago", status: "success" },
  { type: "alert", message: "High API usage detected for 'Enterprise Co.'", time: "1 hour ago", status: "warning" },
  { type: "system", message: "System backup completed successfully", time: "3 hours ago", status: "success" },
  { type: "user_suspended", message: "User suspended due to policy violation", time: "5 hours ago", status: "error" },
];

const topOrganizations = [
  { name: "TechCorp Inc.", interviews: 245, recruiters: 12, status: "active" },
  { name: "Enterprise Co.", interviews: 198, recruiters: 8, status: "active" },
  { name: "StartupXYZ", interviews: 156, recruiters: 5, status: "active" },
  { name: "Global Solutions", interviews: 134, recruiters: 7, status: "trial" },
  { name: "Innovation Labs", interviews: 98, recruiters: 4, status: "active" },
];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage platform-wide operations</p>
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
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {stat.changeType === "positive" ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-success" />
                        <span className="text-sm text-success font-medium">{stat.change}</span>
                      </>
                    ) : stat.changeType === "negative" ? (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive font-medium">{stat.change}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">{stat.change}</span>
                    )}
                    <span className="text-sm text-muted-foreground ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events and updates</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.status === "success" ? "bg-success/10" :
                      activity.status === "warning" ? "bg-warning/10" :
                      activity.status === "error" ? "bg-destructive/10" : "bg-muted"
                    }`}>
                      {activity.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : activity.status === "warning" ? (
                        <AlertCircle className="h-4 w-4 text-warning" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Organizations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Organizations</CardTitle>
                <CardDescription>Most active organizations this month</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topOrganizations.map((org, index) => (
                  <motion.div
                    key={org.name}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Building2 className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{org.name}</p>
                        <Badge variant={org.status === "trial" ? "warning" : "success"} className="text-xs">
                          {org.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {org.interviews} interviews • {org.recruiters} recruiters
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-success">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">+12%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;