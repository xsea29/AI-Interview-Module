"use client";

import { useState, useEffect } from "react";
import { X, Briefcase, Users, Brain, Settings2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { JOBS_ENDPOINTS } from "@/lib/jobsApi";

const CreateJobModal = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Form data aligned with backend schema
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    experienceLevel: "mid", // Default to match backend
    employmentType: "full_time",
    location: "",
    workMode: "remote",
    openings: 1,
    priority: "medium",
    hiringTimeline: "",
    // Interview configuration
    interviewConfig: {
      defaultQuestionCount: 10,
      defaultDuration: 45,
      difficultyLevel: "adaptive",
      questionTypes: [], // Will be mapped to skills array
      interviewRounds: 2,
      interviewType: "ai",
    },
    // Job requirements
    requirements: [],
    skills: [], // From questionTypes
    // Status (backend will set to 'draft' by default)
    status: "draft",
    // Ownership
    hiringManager: "",
    recruiterAssigned: "",
  });

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchDepartments();
      fetchTeamMembers();
    }
  }, [open]);

  const fetchDepartments = async () => {
    // This would be from your organization settings
    // For now, use static list
    const deptOptions = [
      { value: "engineering", label: "Engineering" },
      { value: "product", label: "Product" },
      { value: "design", label: "Design" },
      { value: "marketing", label: "Marketing" },
      { value: "sales", label: "Sales" },
      { value: "operations", label: "Operations" },
      { value: "hr", label: "Human Resources" },
    ];
    setDepartments(deptOptions);
  };

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch organization team members
      const response = await fetch(
        `${API_BASE_URL}/users?organizationId=${user.organizationId}&role=recruiter,hiring_manager`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data?.data?.users || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const toggleQuestionType = (type) => {
    setFormData(prev => ({
      ...prev,
      interviewConfig: {
        ...prev.interviewConfig,
        questionTypes: prev.interviewConfig.questionTypes.includes(type)
          ? prev.interviewConfig.questionTypes.filter(t => t !== type)
          : [...prev.interviewConfig.questionTypes, type]
      },
      skills: prev.interviewConfig.questionTypes.includes(type)
        ? prev.skills.filter(s => s !== type)
        : [...prev.skills, type]
    }));
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Prepare data for backend
      const jobData = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        experienceLevel: formData.experienceLevel,
        employmentType: formData.employmentType,
        location: formData.location,
        workMode: formData.workMode,
        openings: formData.openings,
        priority: formData.priority,
        hiringTimeline: formData.hiringTimeline,
        interviewConfig: {
          defaultQuestionCount: formData.interviewConfig.defaultQuestionCount,
          defaultDuration: formData.interviewConfig.defaultDuration,
          difficultyLevel: formData.interviewConfig.difficultyLevel,
          interviewRounds: formData.interviewConfig.interviewRounds,
          interviewType: formData.interviewConfig.interviewType,
        },
        skills: formData.skills.map(skill => ({
          name: skill,
          isRequired: true
        })),
        // Requirements from description (you might want a separate field)
        requirements: formData.description.split('\n').filter(line => line.trim().length > 0),
        hiringManager: formData.hiringManager,
        recruiterAssigned: formData.recruiterAssigned,
        // Backend will set organizationId and createdBy
      };

      const response = await fetch(JOBS_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create job');
      }

      const data = await response.json();
      
      toast({
        title: "Job Created Successfully",
        description: `${formData.title} has been created as a draft.`,
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        department: "",
        experienceLevel: "mid",
        employmentType: "full_time",
        location: "",
        workMode: "remote",
        openings: 1,
        priority: "medium",
        hiringTimeline: "",
        interviewConfig: {
          defaultQuestionCount: 10,
          defaultDuration: 45,
          difficultyLevel: "adaptive",
          questionTypes: [],
          interviewRounds: 2,
          interviewType: "ai",
        },
        requirements: [],
        skills: [],
        status: "draft",
        hiringManager: "",
        recruiterAssigned: "",
      });
      
      setActiveTab("basic");
      
      // Call success callback
      if (onSuccess) {
        onSuccess(data.data);
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            Create New Job
          </DialogTitle>
          <DialogDescription>
            Fill in the job details to create a new position
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="hiring" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Hiring</span>
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Interview</span>
            </TabsTrigger>
            <TabsTrigger value="ownership" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Ownership</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Senior Frontend Developer"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience Level *</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleInputChange('experienceLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                    <SelectItem value="lead">Lead (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type *</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => handleInputChange('employmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Work Mode *</Label>
                <Select
                  value={formData.workMode}
                  onValueChange={(value) => handleInputChange('workMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA or Remote"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="hiring" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Openings</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.openings}
                  onChange={(e) => handleInputChange('openings', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interview Type</Label>
              <Select
                value={formData.interviewConfig.interviewType}
                onValueChange={(value) => handleInputChange('interviewConfig.interviewType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">AI Interview (Async)</SelectItem>
                  <SelectItem value="live">Live Interview</SelectItem>
                  <SelectItem value="hybrid">Hybrid (AI + Live)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expected Hiring Timeline</Label>
              <Select
                value={formData.hiringTimeline}
                onValueChange={(value) => handleInputChange('hiringTimeline', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent (1-2 weeks)</SelectItem>
                  <SelectItem value="short">Short (2-4 weeks)</SelectItem>
                  <SelectItem value="medium">Medium (1-2 months)</SelectItem>
                  <SelectItem value="flexible">Flexible (no deadline)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="interview" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Question Count</Label>
                  <Input
                    type="number"
                    min={3}
                    max={30}
                    value={formData.interviewConfig.defaultQuestionCount}
                    onChange={(e) => handleInputChange('interviewConfig.defaultQuestionCount', parseInt(e.target.value) || 10)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Duration (minutes)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={120}
                    value={formData.interviewConfig.defaultDuration}
                    onChange={(e) => handleInputChange('interviewConfig.defaultDuration', parseInt(e.target.value) || 45)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Interview Rounds: {formData.interviewConfig.interviewRounds}</Label>
                <Slider
                  value={[formData.interviewConfig.interviewRounds]}
                  onValueChange={([value]) => handleInputChange('interviewConfig.interviewRounds', value)}
                  min={1}
                  max={3}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">Number of interview rounds (1-3)</p>
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["JavaScript", "React", "Node.js", "TypeScript", "AWS", "Python", "UI/UX"].map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.skills.includes(skill) ? "accent" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newSkills = formData.skills.includes(skill)
                          ? formData.skills.filter(s => s !== skill)
                          : [...formData.skills, skill];
                        handleInputChange('skills', newSkills);
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {formData.skills.length} skill(s)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={formData.interviewConfig.difficultyLevel}
                  onValueChange={(value) => handleInputChange('interviewConfig.difficultyLevel', value)}
                >
                  <SelectTrigger>
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
            </div>
          </TabsContent>

          <TabsContent value="ownership" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Hiring Manager</Label>
              <Select
                value={formData.hiringManager}
                onValueChange={(value) => handleInputChange('hiringManager', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hiring manager" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.profile?.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recruiter Assigned</Label>
              <Select
                value={formData.recruiterAssigned}
                onValueChange={(value) => handleInputChange('recruiterAssigned', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recruiter" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.profile?.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {activeTab !== "basic" && (
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ["basic", "hiring", "interview", "ownership"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                }}
                disabled={isLoading}
              >
                Previous
              </Button>
            )}
            {activeTab !== "ownership" ? (
              <Button
                variant="accent"
                onClick={() => {
                  const tabs = ["basic", "hiring", "interview", "ownership"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                }}
                disabled={isLoading}
              >
                Next
              </Button>
            ) : (
              <Button variant="hero" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Job"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobModal;