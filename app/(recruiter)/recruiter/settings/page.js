"use client";

import { useState, useEffect } from "react";
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
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle
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
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost:5000/api/v1";

const Settings = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State for all settings
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    timezone: "UTC",
    language: "en",
    avatar: ""
  });

  const [organization, setOrganization] = useState({
    name: "",
    industry: "",
    size: "",
    policies: "",
    website: ""
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [aiConfig, setAiConfig] = useState({
    difficulty: "adaptive",
    questionStyles: ["Technical", "Behavioral"],
    evaluationStrictness: 50,
    autoRejectThreshold: 40
  });

  const [interviewDefaults, setInterviewDefaults] = useState({
    duration: 45,
    rounds: 2,
    autoSchedule: false,
    sendCalendarInvites: true,
    bufferBetweenInterviews: 15
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    interviewReminders: true,
    completionAlerts: true,
    weeklyReports: false,
    newApplicantAlerts: true,
    reportReadyNotifications: true
  });

  const [compliance, setCompliance] = useState({
    dataRetentionPolicy: "1year",
    gdprConsentTracking: true,
    anonymizeRejectedCandidates: false
  });

  const [auditLogs, setAuditLogs] = useState([]);

  // Fetch user info on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch profile settings
      const profileRes = await fetch(
        `${API_BASE_URL}/settings/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.data || profile);
      }

      // Fetch organization settings
      const orgRes = await fetch(
        `${API_BASE_URL}/settings/organization?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrganization(orgData.data || organization);
      }

      // Fetch team members
      const teamRes = await fetch(
        `${API_BASE_URL}/settings/team?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData.data?.members || []);
      }

      // Fetch AI config
      const aiRes = await fetch(
        `${API_BASE_URL}/settings/ai?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiConfig(aiData.data || aiConfig);
      }

      // Fetch interview defaults
      const interviewRes = await fetch(
        `${API_BASE_URL}/settings/interview-defaults?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (interviewRes.ok) {
        const interviewData = await interviewRes.json();
        setInterviewDefaults(interviewData.data || interviewDefaults);
      }

      // Fetch notification preferences
      const notifRes = await fetch(
        `${API_BASE_URL}/settings/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.data || notifications);
      }

      // Fetch compliance settings
      const complianceRes = await fetch(
        `${API_BASE_URL}/settings/compliance?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (complianceRes.ok) {
        const complianceData = await complianceRes.json();
        setCompliance(complianceData.data || compliance);
      }

    } catch (err) {
      console.error('Error fetching settings data:', err);
      toast({
        title: "Error",
        description: "Failed to load settings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/settings/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile settings updated successfully",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrganization = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/settings/organization?organizationId=${user.organizationId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(organization)
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Organization settings updated successfully",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update organization settings');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTeamMember = async (email, role = 'recruiter') => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/settings/team/add`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            role,
            organizationId: user.organizationId
          })
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invitation sent successfully",
          variant: "default",
        });
        fetchUserData(); // Refresh team list
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add team member');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateTeamMemberRole = async (memberId, newRole) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/settings/team/role`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberId,
            newRole,
            organizationId: user.organizationId
          })
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Team member role updated successfully",
          variant: "default",
        });
        fetchUserData(); // Refresh team list
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update role');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveTeamMember = async (memberId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/settings/team/remove`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberId,
            organizationId: user.organizationId
          })
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Team member removed successfully",
          variant: "default",
        });
        fetchUserData(); // Refresh team list
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove team member');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/settings/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveAIConfig = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/settings/ai?organizationId=${user.organizationId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(aiConfig)
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "AI configuration updated successfully",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update AI config');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInterviewDefaults = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/settings/interview-defaults?organizationId=${user.organizationId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(interviewDefaults)
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Interview defaults updated successfully",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update interview defaults');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/settings/notifications`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification preferences updated successfully",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update notifications');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompliance = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/settings/compliance?organizationId=${user.organizationId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(compliance)
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Compliance settings updated successfully",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update compliance settings');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/settings/audit-logs?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data?.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </RecruiterLayout>
    );
  }

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
                      <span className="text-3xl font-bold text-accent">
                        {profile.name?.split(' ').map(n => n[0]).join('') || 'TS'}
                      </span>
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
                    <Input 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      type="tel" 
                      value={profile.phone} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Select 
                      value={profile.timezone} 
                      onValueChange={(value) => setProfile({...profile, timezone: value})}
                    >
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
                    <Select 
                      value={profile.language} 
                      onValueChange={(value) => setProfile({...profile, language: value})}
                    >
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

                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
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
                    <Input 
                      value={organization.name} 
                      onChange={(e) => setOrganization({...organization, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select 
                      value={organization.industry} 
                      onValueChange={(value) => setOrganization({...organization, industry: value})}
                    >
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
                    <Select 
                      value={organization.size} 
                      onValueChange={(value) => setOrganization({...organization, size: value})}
                    >
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
                    value={organization.policies}
                    onChange={(e) => setOrganization({...organization, policies: e.target.value})}
                    placeholder="Enter your default hiring policies and guidelines..."
                    rows={4}
                  />
                </div>

                <Button onClick={handleSaveOrganization} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
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
                <Button variant="accent" onClick={() => {
                  // TODO: Implement add team member modal
                  const email = prompt("Enter email address:");
                  if (email) {
                    handleAddTeamMember(email);
                  }
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recruiter
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="font-semibold text-accent">
                            {member.name?.split(' ').map(n => n[0]).join('') || member.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name || member.email}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={member.status === "active" ? "success" : 
                                       member.status === "pending" ? "warning" : "destructive"}>
                          {member.status}
                        </Badge>
                        <Select 
                          value={member.role} 
                          onValueChange={(value) => handleUpdateTeamMemberRole(member.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${member.name || member.email}?`)) {
                              handleRemoveTeamMember(member.id);
                            }
                          }}
                        >
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
                  <PasswordChangeForm onChangePassword={handleChangePassword} />
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
                    <Select 
                      value={aiConfig.difficulty}
                      onValueChange={(value) => setAiConfig({...aiConfig, difficulty: value})}
                    >
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
                        <Badge 
                          key={style} 
                          variant={aiConfig.questionStyles?.includes(style) ? "accent" : "outline"}
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                          onClick={() => {
                            const styles = aiConfig.questionStyles || [];
                            if (styles.includes(style)) {
                              setAiConfig({
                                ...aiConfig,
                                questionStyles: styles.filter(s => s !== style)
                              });
                            } else {
                              setAiConfig({
                                ...aiConfig,
                                questionStyles: [...styles, style]
                              });
                            }
                          }}
                        >
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Evaluation Strictness: {aiConfig.evaluationStrictness}%</Label>
                    <Slider 
                      value={[aiConfig.evaluationStrictness]} 
                      onValueChange={([value]) => setAiConfig({...aiConfig, evaluationStrictness: value})}
                      max={100} 
                      step={10} 
                      className="max-w-md" 
                    />
                    <p className="text-xs text-muted-foreground">Higher values result in more critical evaluation</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Auto-Reject Threshold: {aiConfig.autoRejectThreshold}%</Label>
                    <Slider 
                      value={[aiConfig.autoRejectThreshold]} 
                      onValueChange={([value]) => setAiConfig({...aiConfig, autoRejectThreshold: value})}
                      max={100} 
                      step={5} 
                      className="max-w-md" 
                    />
                    <p className="text-xs text-muted-foreground">Candidates scoring below this threshold will be flagged</p>
                  </div>
                </div>

                <Button onClick={handleSaveAIConfig} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
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
                    <Select 
                      value={interviewDefaults.duration.toString()}
                      onValueChange={(value) => setInterviewDefaults({...interviewDefaults, duration: parseInt(value)})}
                    >
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
                    <Select 
                      value={interviewDefaults.rounds.toString()}
                      onValueChange={(value) => setInterviewDefaults({...interviewDefaults, rounds: parseInt(value)})}
                    >
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
                      <Switch 
                        checked={interviewDefaults.autoSchedule}
                        onCheckedChange={(checked) => setInterviewDefaults({...interviewDefaults, autoSchedule: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between max-w-2xl">
                      <div>
                        <p className="text-sm text-foreground">Send calendar invites</p>
                        <p className="text-xs text-muted-foreground">Automatically send calendar invites to candidates</p>
                      </div>
                      <Switch 
                        checked={interviewDefaults.sendCalendarInvites}
                        onCheckedChange={(checked) => setInterviewDefaults({...interviewDefaults, sendCalendarInvites: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between max-w-2xl">
                      <div>
                        <p className="text-sm text-foreground">Buffer between interviews</p>
                        <p className="text-xs text-muted-foreground">Minimum 15 minutes gap between interviews</p>
                      </div>
                      <Switch 
                        checked={interviewDefaults.bufferBetweenInterviews > 0}
                        onCheckedChange={(checked) => setInterviewDefaults({
                          ...interviewDefaults, 
                          bufferBetweenInterviews: checked ? 15 : 0
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveInterviewDefaults} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
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
                    { key: "emailNotifications", title: "Email notifications", description: "Receive updates via email" },
                    { key: "interviewReminders", title: "Interview reminders", description: "Get reminded before scheduled interviews" },
                    { key: "completionAlerts", title: "Candidate completion alerts", description: "Notified when candidates complete interviews" },
                    { key: "weeklyReports", title: "Weekly reports", description: "Receive weekly hiring summary" },
                    { key: "newApplicantAlerts", title: "New applicant alerts", description: "Get notified of new applications" },
                    { key: "reportReadyNotifications", title: "Report ready notifications", description: "Notified when interview reports are ready" },
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between max-w-2xl">
                      <div>
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                      </div>
                      <Switch 
                        checked={notifications[notification.key]}
                        onCheckedChange={(checked) => setNotifications({
                          ...notifications,
                          [notification.key]: checked
                        })}
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
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
                    <Select 
                      value={compliance.dataRetentionPolicy}
                      onValueChange={(value) => setCompliance({...compliance, dataRetentionPolicy: value})}
                    >
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
                    <Switch 
                      checked={compliance.gdprConsentTracking}
                      onCheckedChange={(checked) => setCompliance({...compliance, gdprConsentTracking: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between max-w-2xl">
                    <div>
                      <p className="text-sm font-medium text-foreground">Anonymize rejected candidates</p>
                      <p className="text-xs text-muted-foreground">Automatically anonymize data after rejection</p>
                    </div>
                    <Switch 
                      checked={compliance.anonymizeRejectedCandidates}
                      onCheckedChange={(checked) => setCompliance({...compliance, anonymizeRejectedCandidates: checked})}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Interview Audit Logs</h3>
                      <p className="text-sm text-muted-foreground">View all interview-related activities</p>
                    </div>
                    <Button variant="outline" onClick={fetchAuditLogs}>View Audit Logs</Button>
                  </div>
                  {auditLogs.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="p-3 text-sm bg-secondary/30 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{log.user}</span>
                            <span className="text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1">
                            {log.action} - {log.resource}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleSaveCompliance} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
};

// Password Change Form Component
const PasswordChangeForm = ({ onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    try {
      setLoading(true);
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 max-w-md">
      <div className="space-y-2">
        <Label>Current Password</Label>
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"} 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
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
        <Input 
          type="password" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Confirm New Password</Label>
        <Input 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <Button onClick={handleSubmit} disabled={loading} className="w-fit">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Password"
        )}
      </Button>
    </div>
  );
};

export default Settings;