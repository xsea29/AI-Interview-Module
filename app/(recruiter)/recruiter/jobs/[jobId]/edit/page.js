"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:5000/api/v1";
const JOB_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  CLOSED: "closed"
};

export default function EditJob({ params }) {
  const { jobId } = params;
  const router = useRouter();
  const { toast } = useToast();
  const isNewJob = !jobId;

  const [loading, setLoading] = useState(isNewJob ? false : true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [tempResponsibility, setTempResponsibility] = useState("");
  const [tempRequirement, setTempRequirement] = useState("");
  const [tempSkill, setTempSkill] = useState("");

  // Form state - match your backend model
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    workMode: "",
    employmentType: "",
    experienceLevel: "",
    experienceYears: "",
    salaryMin: "",
    salaryMax: "",
    showSalary: true,
    openings: 1,
    priority: "medium",
    interviewType: "",
    expectedTimeline: "",
    interviewRounds: 2,
    questionTypes: ["technical", "behavioral"],
    difficultyLevel: "medium",
    hiringManager: "",
    recruiterAssigned: "",
    description: "",
    responsibilities: [],
    requirements: [],
    internalNotes: "",
    status: JOB_STATUS.DRAFT,
    skills: [],
  });

  // Fetch job data if editing
  useEffect(() => {
    if (!isNewJob) {
      fetchJobData();
    }
  }, [jobId, isNewJob]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/jobs/${jobId}?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch job data');
      }

      const data = await response.json();
      const job = data?.data?.job;
      
      // Map API data to form state
      setFormData({
        title: job.title || "",
        department: job.department || "",
        location: job.location || "",
        workMode: job.workMode || "",
        employmentType: job.employmentType || "",
        experienceLevel: job.experienceLevel || "",
        experienceYears: job.experienceYears || "",
        salaryMin: job.salaryMin ? job.salaryMin.toString() : "",
        salaryMax: job.salaryMax ? job.salaryMax.toString() : "",
        showSalary: !!(job.salaryMin && job.salaryMax),
        openings: job.openings || 1,
        priority: job.priority || "medium",
        interviewType: job.interviewType || "",
        expectedTimeline: job.expectedTimeline ? job.expectedTimeline.toString() : "",
        interviewRounds: job.interviewRounds || 2,
        questionTypes: job.questionTypes || ["technical", "behavioral"],
        difficultyLevel: job.difficultyLevel || "medium",
        hiringManager: job.hiringManager || "",
        recruiterAssigned: job.recruiterAssigned || "",
        description: job.description || "",
        responsibilities: job.responsibilities || [],
        requirements: job.requirements || [],
        internalNotes: job.internalNotes || "",
        status: job.status || JOB_STATUS.DRAFT,
        skills: job.skills || [],
      });
    } catch (err) {
      console.error('Error fetching job data:', err);
      toast({
        title: "Error",
        description: "Failed to load job data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    setAutoSaveStatus("unsaved");
  };

  const addResponsibility = () => {
    if (tempResponsibility.trim()) {
      handleInputChange("responsibilities", [...formData.responsibilities, tempResponsibility.trim()]);
      setTempResponsibility("");
    }
  };

  const removeResponsibility = (index) => {
    const newResponsibilities = formData.responsibilities.filter((_, i) => i !== index);
    handleInputChange("responsibilities", newResponsibilities);
  };

  const addRequirement = () => {
    if (tempRequirement.trim()) {
      handleInputChange("requirements", [...formData.requirements, tempRequirement.trim()]);
      setTempRequirement("");
    }
  };

  const removeRequirement = (index) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    handleInputChange("requirements", newRequirements);
  };

  const addSkill = () => {
    if (tempSkill.trim()) {
      handleInputChange("skills", [...formData.skills, tempSkill.trim()]);
      setTempSkill("");
    }
  };

  const removeSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    handleInputChange("skills", newSkills);
  };

  const handleSaveDraft = async () => {
    await saveJob(JOB_STATUS.DRAFT);
  };

  const handlePublish = async () => {
    await saveJob(JOB_STATUS.ACTIVE);
  };

  const saveJob = async (status) => {
    try {
      setIsSaving(true);
      setAutoSaveStatus("saving");
      
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Prepare data for API - match backend validation
      const jobData = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        workMode: formData.workMode,
        employmentType: formData.employmentType.toLowerCase().replace('-', '_'), // Convert to backend format
        experienceLevel: formData.experienceLevel,
        experienceYears: formData.experienceYears,
        salaryMin: formData.showSalary && formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.showSalary && formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        openings: parseInt(formData.openings),
        priority: formData.priority,
        interviewType: formData.interviewType,
        expectedTimeline: formData.expectedTimeline ? parseInt(formData.expectedTimeline) : undefined,
        interviewRounds: parseInt(formData.interviewRounds),
        questionTypes: formData.questionTypes,
        difficultyLevel: formData.difficultyLevel,
        hiringManager: formData.hiringManager,
        recruiterAssigned: formData.recruiterAssigned,
        description: formData.description,
        responsibilities: formData.responsibilities, // Already an array
        requirements: formData.requirements, // Already an array
        internalNotes: formData.internalNotes,
        status: status,
        skills: formData.skills,
        organizationId: user.organizationId,
      };

      const url = isNewJob 
        ? `${API_BASE_URL}/jobs`
        : `${API_BASE_URL}/jobs/${jobId}`;
      
      const method = isNewJob ? 'POST' : 'PUT';

      console.log("Sending job data:", jobData); // For debugging

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to ${isNewJob ? 'create' : 'update'} job`);
      }

      const savedJob = responseData?.data?.job || responseData?.data;
      
      setIsSaving(false);
      setAutoSaveStatus("saved");
      setHasUnsavedChanges(false);
      
      const successMessage = status === JOB_STATUS.DRAFT 
        ? "Job saved as draft"
        : status === JOB_STATUS.ACTIVE 
          ? "Job published successfully"
          : "Job updated successfully";
      
      toast({
        title: "Success",
        description: successMessage,
      });

      // If creating new job, redirect to edit page
      if (isNewJob && savedJob._id) {
        router.push(`/recruiter/jobs/${savedJob._id}/edit`);
      } else if (status === JOB_STATUS.ACTIVE) {
        // If publishing, go to job list
        router.push("/recruiter/jobs");
      }
    } catch (err) {
      setIsSaving(false);
      setAutoSaveStatus("unsaved");
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowLeaveDialog(true);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2">Loading job data...</span>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isNewJob ? "Create New Job" : "Edit Job"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {autoSaveStatus === "saved" && (
                  <Badge variant="success" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    All changes saved
                  </Badge>
                )}
                {autoSaveStatus === "saving" && (
                  <Badge variant="secondary" className="text-xs">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </Badge>
                )}
                {autoSaveStatus === "unsaved" && (
                  <Badge variant="warning" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unsaved changes
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft} 
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            {!isNewJob && (
              <Link href={`/recruiter/jobs/${jobId}`} target="_blank">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>
            )}
            <Button 
              variant="accent" 
              onClick={handlePublish} 
              disabled={isSaving || formData.status === JOB_STATUS.ACTIVE}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                formData.status === JOB_STATUS.ACTIVE ? "Already Published" : "Publish Job"
              )}
            </Button>
          </div>
        </div>

        {/* Form Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(v) => handleInputChange("department", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select value={formData.experienceLevel} onValueChange={(v) => handleInputChange("experienceLevel", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intern">Intern</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select value={formData.employmentType} onValueChange={(v) => handleInputChange("employmentType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="part_time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., San Francisco, CA or Remote"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="workMode">Work Mode *</Label>
                  <Select value={formData.workMode} onValueChange={(v) => handleInputChange("workMode", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experienceYears">Experience Years</Label>
                  <Input
                    id="experienceYears"
                    value={formData.experienceYears}
                    onChange={(e) => handleInputChange("experienceYears", e.target.value)}
                    placeholder="e.g., 3-5 years"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Describe the role and expectations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Overview *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the role and what the ideal candidate will do..."
                  className="min-h-[120px]"
                  required
                />
              </div>
              
              {/* Responsibilities as Array */}
              <div>
                <Label>Responsibilities</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={tempResponsibility}
                      onChange={(e) => setTempResponsibility(e.target.value)}
                      placeholder="Add a responsibility..."
                      onKeyDown={(e) => e.key === 'Enter' && addResponsibility()}
                    />
                    <Button type="button" onClick={addResponsibility}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.responsibilities.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResponsibility(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirements as Array */}
              <div>
                <Label>Requirements</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={tempRequirement}
                      onChange={(e) => setTempRequirement(e.target.value)}
                      placeholder="Add a requirement..."
                      onKeyDown={(e) => e.key === 'Enter' && addRequirement()}
                    />
                    <Button type="button" onClick={addRequirement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.requirements.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Hiring Configuration</CardTitle>
              <CardDescription>Set hiring parameters and priority</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openings">Number of Openings *</Label>
                  <Input
                    id="openings"
                    type="number"
                    min="1"
                    value={formData.openings}
                    onChange={(e) => handleInputChange("openings", parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => handleInputChange("priority", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interviewType">Interview Type</Label>
                  <Select value={formData.interviewType} onValueChange={(v) => handleInputChange("interviewType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai">AI Interview</SelectItem>
                      <SelectItem value="live">Live Interview</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="take-home">Take-home Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expectedTimeline">Expected Hiring Timeline (days)</Label>
                  <Input
                    id="expectedTimeline"
                    type="number"
                    min="1"
                    value={formData.expectedTimeline}
                    onChange={(e) => handleInputChange("expectedTimeline", e.target.value)}
                    placeholder="e.g., 30"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Salary Range</Label>
                    <p className="text-sm text-muted-foreground">Display salary on job posting</p>
                  </div>
                  <Switch
                    checked={formData.showSalary}
                    onCheckedChange={(v) => handleInputChange("showSalary", v)}
                  />
                </div>
              </div>
              {formData.showSalary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Minimum Salary ($)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                      placeholder="e.g., 120000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax">Maximum Salary ($)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                      placeholder="e.g., 180000"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
              <CardDescription>List the key skills required for this position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tempSkill}
                    onChange={(e) => setTempSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, Python, AWS)..."
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-3 w-3 p-0 hover:bg-transparent"
                        onClick={() => removeSkill(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))} */}
                  {formData.skills.map((skill, index) => (
  <Badge key={skill._id || index} variant="secondary" className="gap-1">
    {typeof skill === "string" ? skill : skill.name}
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-3 w-3 p-0 hover:bg-transparent"
      onClick={() => removeSkill(index)}
    >
      <X className="h-3 w-3" />
    </Button>
  </Badge>
))}

                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Rules</CardTitle>
              <CardDescription>Configure the interview process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interviewRounds">Interview Rounds</Label>
                  <Select value={formData.interviewRounds.toString()} onValueChange={(v) => handleInputChange("interviewRounds", parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rounds" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Round</SelectItem>
                      <SelectItem value="2">2 Rounds</SelectItem>
                      <SelectItem value="3">3 Rounds</SelectItem>
                      <SelectItem value="4">4 Rounds</SelectItem>
                      <SelectItem value="5">5+ Rounds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                  <Select value={formData.difficultyLevel} onValueChange={(v) => handleInputChange("difficultyLevel", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Question Type Preferences</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Technical", "Behavioral", "Situational", "Coding", "System Design"].map((type) => (
                    <Badge
                      key={type}
                      variant={formData.questionTypes.includes(type.toLowerCase()) ? "accent" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const typeId = type.toLowerCase();
                        const newTypes = formData.questionTypes.includes(typeId)
                          ? formData.questionTypes.filter(t => t !== typeId)
                          : [...formData.questionTypes, typeId];
                        handleInputChange("questionTypes", newTypes);
                      }}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership */}
          <Card>
            <CardHeader>
              <CardTitle>Ownership</CardTitle>
              <CardDescription>Assign team members to this job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hiringManager">Hiring Manager</Label>
                  <Input
                    id="hiringManager"
                    value={formData.hiringManager}
                    onChange={(e) => handleInputChange("hiringManager", e.target.value)}
                    placeholder="Enter hiring manager name"
                  />
                </div>
                <div>
                  <Label htmlFor="recruiterAssigned">Recruiter Assigned</Label>
                  <Input
                    id="recruiterAssigned"
                    value={formData.recruiterAssigned}
                    onChange={(e) => handleInputChange("recruiterAssigned", e.target.value)}
                    placeholder="Enter recruiter name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
              <CardDescription>Private notes visible only to recruiters</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="internalNotes"
                value={formData.internalNotes}
                onChange={(e) => handleInputChange("internalNotes", e.target.value)}
                placeholder="Add any internal notes about this position..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between py-4">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                Save Draft
              </Button>
              <Button 
                variant="accent" 
                onClick={handlePublish} 
                disabled={isSaving || formData.status === JOB_STATUS.ACTIVE}
              >
                {isSaving ? "Publishing..." : "Publish Job"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RecruiterLayout>
  );
}