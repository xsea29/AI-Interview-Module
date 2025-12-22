"use client";

import { useState } from "react";
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
  ArrowUpRight
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const candidates = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    role: "Senior Frontend Developer",
    experience: "6 years",
    appliedDate: "Dec 15, 2024",
    status: "interview",
    stage: "Technical Interview",
    rating: 4.5,
    skills: ["React", "TypeScript", "Node.js"],
    matchScore: 92,
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "+1 (555) 234-5678",
    location: "New York, NY",
    role: "Product Manager",
    experience: "5 years",
    appliedDate: "Dec 14, 2024",
    status: "screening",
    stage: "Resume Review",
    rating: 4.0,
    skills: ["Product Strategy", "Agile", "Data Analysis"],
    matchScore: 85,
  },
  {
    id: 3,
    name: "Mike Peters",
    email: "mike.peters@email.com",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    role: "DevOps Engineer",
    experience: "4 years",
    appliedDate: "Dec 13, 2024",
    status: "offer",
    stage: "Offer Extended",
    rating: 4.8,
    skills: ["AWS", "Kubernetes", "Terraform"],
    matchScore: 95,
  },
  {
    id: 4,
    name: "Emily Brown",
    email: "emily.brown@email.com",
    phone: "+1 (555) 456-7890",
    location: "Seattle, WA",
    role: "UX Designer",
    experience: "3 years",
    appliedDate: "Dec 12, 2024",
    status: "new",
    stage: "Application Received",
    rating: 0,
    skills: ["Figma", "User Research", "Prototyping"],
    matchScore: 78,
  },
  {
    id: 5,
    name: "David Kim",
    email: "david.kim@email.com",
    phone: "+1 (555) 567-8901",
    location: "Boston, MA",
    role: "Backend Developer",
    experience: "7 years",
    appliedDate: "Dec 11, 2024",
    status: "rejected",
    stage: "Not Selected",
    rating: 3.2,
    skills: ["Python", "Django", "PostgreSQL"],
    matchScore: 65,
  },
  {
    id: 6,
    name: "Lisa Wang",
    email: "lisa.wang@email.com",
    phone: "+1 (555) 678-9012",
    location: "Los Angeles, CA",
    role: "Data Analyst",
    experience: "2 years",
    appliedDate: "Dec 10, 2024",
    status: "interview",
    stage: "Final Interview",
    rating: 4.2,
    skills: ["SQL", "Python", "Tableau"],
    matchScore: 88,
  },
];

const stats = [
  { label: "Total Candidates", value: "156", icon: FileText, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "New This Week", value: "24", icon: Plus, color: "text-success", bgColor: "bg-success/10" },
  { label: "In Interview", value: "18", icon: Clock, color: "text-warning", bgColor: "bg-warning/10" },
  { label: "Offers Sent", value: "5", icon: CheckCircle2, color: "text-accent", bgColor: "bg-accent/10" },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "new":
      return <Badge variant="secondary">New</Badge>;
    case "screening":
      return <Badge variant="info">Screening</Badge>;
    case "interview":
      return <Badge variant="warning">Interview</Badge>;
    case "offer":
      return <Badge variant="success">Offer</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const Candidates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredCandidates = candidates.filter(candidate => {
    if (activeTab !== "all" && candidate.status !== activeTab) return false;
    if (searchQuery && !candidate.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <RecruiterLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
            <p className="text-muted-foreground mt-1">Manage and track all your candidates</p>
          </div>
          <Button variant="accent">
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
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
                  placeholder="Search candidates..." 
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
            <TabsTrigger value="all">All ({candidates.length})</TabsTrigger>
            <TabsTrigger value="new">New ({candidates.filter(c => c.status === "new").length})</TabsTrigger>
            <TabsTrigger value="interview">Interview ({candidates.filter(c => c.status === "interview").length})</TabsTrigger>
            <TabsTrigger value="offer">Offer ({candidates.filter(c => c.status === "offer").length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({candidates.filter(c => c.status === "rejected").length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
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
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-foreground">{candidate.name}</h3>
                                {getStatusBadge(candidate.status)}
                              </div>
                              <p className="text-muted-foreground mt-1">{candidate.role}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span>{candidate.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{candidate.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Applied {candidate.appliedDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-4">
                            {/* Skills */}
                            <div className="flex items-center gap-2">
                              {candidate.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            {/* Match Score */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Match:</span>
                              <div className="w-24">
                                <Progress value={candidate.matchScore} className="h-2" />
                              </div>
                              <span className="text-sm font-medium text-foreground">{candidate.matchScore}%</span>
                            </div>

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
                                <span className="text-sm font-medium text-foreground">{candidate.stage}</span>
                              </div>
                              <Button variant="ghost" size="sm">
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
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
};

export default Candidates;