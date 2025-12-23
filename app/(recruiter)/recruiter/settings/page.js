"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Users,
  Shield,
  Brain,
  Calendar,
  Bell,
  FileText,
  Camera,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const settingsSections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "team", label: "Team", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "ai", label: "AI Config", icon: Brain },
    { id: "interview", label: "Interview Defaults", icon: Calendar },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "compliance", label: "Compliance", icon: FileText },
  ];

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and platform preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            {settingsSections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground px-4 py-2 rounded-lg border border-border data-[state=active]:border-accent"
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-3xl font-bold text-accent">TS</span>
                    </div>
                    <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue="Tushar Singh" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue="tushar@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" defaultValue="+91 1234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Select defaultValue="pst">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization Settings */}
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Configure your company information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input defaultValue="TechCorp Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select defaultValue="technology">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select defaultValue="51-200">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Hiring Policies</Label>
                  <Textarea 
                    placeholder="Enter your default hiring policies and guidelines..."
                    rows={4}
                    defaultValue="All candidates must complete AI interview screening before live interviews. Minimum score threshold of 60% required for advancement."
                  />
                </div>

                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Management */}
          <TabsContent value="team">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Manage team members and their access</CardDescription>
                </div>
                <Button variant="accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recruiter
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Tushar Singh", email: "tushar@company.com", role: "Admin", status: "active" },
                    { name: "Alex Chen", email: "alex@company.com", role: "Recruiter", status: "active" },
                    { name: "Emily Brown", email: "emily@company.com", role: "Viewer", status: "active" },
                    { name: "Mike Wilson", email: "mike@company.com", role: "Recruiter", status: "pending" },
                  ].map((member, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="font-semibold text-accent">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={member.status === "active" ? "success" : "warning"}>
                          {member.status}
                        </Badge>
                        <Select defaultValue={member.role.toLowerCase()}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Change Password</h3>
                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" />
                    </div>
                    <Button className="w-fit">Update Password</Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Session Management</h3>
                      <p className="text-sm text-muted-foreground">Manage active sessions</p>
                    </div>
                    <Button variant="outline" size="sm">View Sessions</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Login History</h3>
                      <p className="text-sm text-muted-foreground">View recent login activity</p>
                    </div>
                    <Button variant="outline" size="sm">View History</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Configuration */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>Customize AI interview behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Interview Difficulty</Label>
                    <Select defaultValue="adaptive">
                      <SelectTrigger className="max-w-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adaptive">Adaptive (AI-driven)</SelectItem>
                        <SelectItem value="easy">Entry Level</SelectItem>
                        <SelectItem value="medium">Intermediate</SelectItem>
                        <SelectItem value="hard">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Question Style Preferences</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Technical", "Behavioral", "Situational", "Role-specific", "Problem-solving"].map((style) => (
                        <Badge key={style} variant="outline" className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Evaluation Strictness: Medium</Label>
                    <Slider defaultValue={[50]} max={100} step={10} className="max-w-md" />
                    <p className="text-xs text-muted-foreground">Higher values result in more critical evaluation</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Auto-Reject Threshold: 40%</Label>
                    <Slider defaultValue={[40]} max={100} step={5} className="max-w-md" />
                    <p className="text-xs text-muted-foreground">Candidates scoring below this threshold will be flagged</p>
                  </div>
                </div>

                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interview Defaults */}
          <TabsContent value="interview">
            <Card>
              <CardHeader>
                <CardTitle>Interview Defaults</CardTitle>
                <CardDescription>Set default interview configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label>Default Duration</Label>
                    <Select defaultValue="45">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Rounds</Label>
                    <Select defaultValue="2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Round</SelectItem>
                        <SelectItem value="2">2 Rounds</SelectItem>
                        <SelectItem value="3">3 Rounds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-medium text-foreground">Auto-Scheduling Rules</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between max-w-2xl">
                      <div>
                        <p className="text-sm text-foreground">Auto-schedule after application</p>
                        <p className="text-xs text-muted-foreground">Automatically schedule interviews for qualified candidates</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between max-w-2xl">
                      <div>
                        <p className="text-sm text-foreground">Send calendar invites</p>
                        <p className="text-xs text-muted-foreground">Automatically send calendar invites to candidates</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between max-w-2xl">
                      <div>
                        <p className="text-sm text-foreground">Buffer between interviews</p>
                        <p className="text-xs text-muted-foreground">Minimum 15 minutes gap between interviews</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { title: "Email notifications", description: "Receive updates via email", enabled: true },
                    { title: "Interview reminders", description: "Get reminded before scheduled interviews", enabled: true },
                    { title: "Candidate completion alerts", description: "Notified when candidates complete interviews", enabled: true },
                    { title: "Weekly reports", description: "Receive weekly hiring summary", enabled: false },
                    { title: "New applicant alerts", description: "Get notified of new applications", enabled: true },
                    { title: "Report ready notifications", description: "Notified when interview reports are ready", enabled: true },
                  ].map((notification, index) => (
                    <div key={index} className="flex items-center justify-between max-w-2xl">
                      <div>
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                      </div>
                      <Switch defaultChecked={notification.enabled} />
                    </div>
                  ))}
                </div>

                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance & Logs */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Audit Logs</CardTitle>
                <CardDescription>Data retention and compliance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Retention Policy</Label>
                    <Select defaultValue="1year">
                      <SelectTrigger className="max-w-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 months</SelectItem>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="2years">2 years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between max-w-2xl">
                    <div>
                      <p className="text-sm font-medium text-foreground">GDPR Consent Tracking</p>
                      <p className="text-xs text-muted-foreground">Track candidate consent for data processing</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between max-w-2xl">
                    <div>
                      <p className="text-sm font-medium text-foreground">Anonymize rejected candidates</p>
                      <p className="text-xs text-muted-foreground">Automatically anonymize data after rejection</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Interview Audit Logs</h3>
                      <p className="text-sm text-muted-foreground">View all interview-related activities</p>
                    </div>
                    <Button variant="outline">View Audit Logs</Button>
                  </div>
                </div>

                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
};

export default Settings;