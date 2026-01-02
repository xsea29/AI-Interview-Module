"use client";

import { useState, useEffect } from "react";
import { User, Upload, Link2, Loader2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import candidateService from "@/services/candidate.service";


const API_BASE_URL = "http://localhost:5000/api/v1";

const AddCandidateModal = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    jobId: "",
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
    },
    source: "career_site",
    linkedinUrl: "",
    resume: null,
    notes: "",
  });

  // Fetch jobs when modal opens
  useEffect(() => {
    if (open) {
      fetchJobs();
      resetForm();
    }
  }, [open]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `${API_BASE_URL}/jobs?organizationId=${user.organizationId}&status=active`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setJobs(data.data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      jobId: "",
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        location: "",
      },
      source: "career_site",
      linkedinUrl: "",
      resume: null,
      notes: "",
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Supported file types
      const supportedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword" // .doc
      ];
      
      const fileExt = file.name.toLowerCase().split('.').pop();
      const isValidType = supportedTypes.includes(file.type) || 
                          ['pdf', 'docx', 'doc'].includes(fileExt);
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, or DOC file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFormData({ ...formData, resume: file });
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.personalInfo.name.trim()) {
      toast({
        title: "Missing Required Field",
        description: "Please enter candidate name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.personalInfo.email.trim()) {
      toast({
        title: "Missing Required Field",
        description: "Please enter candidate email.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.jobId) {
      toast({
        title: "Missing Required Field",
        description: "Please select a job position.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.personalInfo.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Prepare form data for API
      const candidateData = {
        jobId: formData.jobId,
        personalInfo: {
          name: formData.personalInfo.name.trim(),
          email: formData.personalInfo.email.toLowerCase().trim(),
          phone: formData.personalInfo.phone?.trim() || undefined,
          location: formData.personalInfo.location?.trim() || undefined,
        },
        source: formData.source,
        notes: formData.notes?.trim() || undefined,
        // Include default resume structure to satisfy backend schema
        resume: {
          rawText: null,
          parsedData: {},
          uploadedAt: new Date().toISOString(),
        },
      };

      // If LinkedIn URL is provided, add it to personalInfo
      if (formData.linkedinUrl.trim()) {
        candidateData.personalInfo.linkedin = formData.linkedinUrl.trim();
      }

      const response = await fetch(`${API_BASE_URL}/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...candidateData,
          organizationId: user.organizationId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add candidate');
      }

      // Handle resume upload if exists
      if (formData.resume && responseData?.data.candidate?._id) {
        await uploadResume(responseData?.data?.candidate._id, formData.resume);
      }

      toast({
        title: "Success!",
        description: `${formData.personalInfo.name} has been added successfully.`,
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal and reset form
      onOpenChange(false);
      resetForm();

    } catch (error) {
      console.error('Error adding candidate:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('already exists')) {
        errorMessage = "A candidate with this email already exists for the selected job.";
      } else if (error.message.includes('Job not found')) {
        errorMessage = "The selected job is no longer available.";
      }

      toast({
        title: "Failed to Add Candidate",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (candidateId, resumeFile) => {
    try {
      // Use candidateService to upload and parse resume
      const result = await candidateService.uploadAndParseResume(
        candidateId, 
        resumeFile,
        true // Auto-update personal info from resume
      );

      // Check if parsing was successful
      if (result?.parseResult?.success) {
        const skillsCount = result.parseResult.skillsExtracted || 0;
        const matchScore = result.parseResult.matchScore || 0;
        
        toast({
          title: "Resume Processed Successfully",
          description: `Extracted ${skillsCount} skills. Match score: ${matchScore}%`,
        });
      } else if (result?.candidate?.resume?.url) {
        // Resume uploaded but not parsed (parsing might be disabled)
        toast({
          title: "Resume Uploaded",
          description: "Resume has been uploaded successfully.",
        });
      }
    } catch (error) {
      console.warn('Error processing resume:', error.message);
      
      // Check if error is due to parsing being disabled
      if (error.message?.includes('disabled')) {
        toast({
          title: "Resume Upload Successful",
          description: "Resume has been uploaded. Parsing is currently disabled.",
        });
      } else {
        // Don't fail the whole operation if resume upload fails
        toast({
          title: "Resume Upload Warning",
          description: error.message || "Resume processing encountered an issue, but candidate was created.",
          variant: "destructive",
        });
      }
    }
  };

  const updatePersonalInfo = (field, value) => {
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [field]: value,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!loading) {
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            Add New Candidate
          </DialogTitle>
          <DialogDescription>
            Enter candidate details and assign them to a job
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Personal Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="e.g., John Doe"
                  value={formData.personalInfo.name}
                  onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Job Mapping */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground">Job Mapping</h3>

              <div className="space-y-2">
                <Label>Select Job *</Label>
                <Select
                  value={formData.jobId}
                  onValueChange={(value) => setFormData({ ...formData, jobId: value })}
                  disabled={loading || jobs.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={jobs.length === 0 ? "Loading jobs..." : "Select a job position"} />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.length === 0 ? (
                      <SelectItem value="loading" disabled>No active jobs available</SelectItem>
                    ) : (
                      jobs.map((job) => (
                        <SelectItem key={job._id} value={job._id}>
                          {job.title} - {job.department || 'No Department'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {jobs.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No active jobs found. Please create a job first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How did they apply?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="career_site">Career Site</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Any additional notes about this candidate..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Resume */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground">Resume & Links</h3>

              <div className="space-y-2">
                <Label>Upload Resume (PDF, DOCX, DOC - Optional)</Label>
                <p className="text-xs text-muted-foreground">Resume will be automatically parsed to extract skills, experience, and education</p>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  loading ? 'border-muted bg-muted/50 cursor-not-allowed' : 'border-border hover:border-accent/50 cursor-pointer'
                }`}>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                    disabled={loading}
                  />
                  <label htmlFor="resume-upload" className={`block ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {formData.resume 
                        ? `✓ ${formData.resume.name}` 
                        : loading 
                          ? "Processing..." 
                          : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or DOC up to 10MB</p>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with buttons - fixed at bottom */}
        <div className="px-6 py-4 border-t border-border bg-card shrink-0">
          <div className="flex items-center justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="accent" 
              onClick={handleSubmit}
              disabled={loading || !formData.personalInfo.name || !formData.personalInfo.email || !formData.jobId}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Candidate'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateModal;