"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Users,
  Brain,
  Settings2,
  CheckCircle2,
  Sparkles,
  Plus,
  X,
  GripVertical,
  Loader2,
  Calendar,
  Clock,
  Mail,
  Copy,
  ExternalLink,
  Eye,
  Share2,
  Link as LinkIcon,
  Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { INTERVIEW_STATUS } from "@/constants/interviewStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const steps = [
  { id: 1, title: "Job Details", icon: Briefcase },
  { id: 2, title: "Candidates", icon: Users },
  { id: 3, title: "AI Questions", icon: Brain },
  { id: 4, title: "Configuration", icon: Settings2 },
];

const CreateInterview = () => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // CRITICAL: Store interview ID once it's created
  const [interviewId, setInterviewId] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [candidateAccessLinks, setCandidateAccessLinks] = useState({});
  const [copiedLinks, setCopiedLinks] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    jobId: "",
    candidateIds: [],
    additionalContext: "",
    experienceLevel: "mid",
    config: {
      questionCount: 5,
      questionDistribution: "balanced",
      difficultyLevel: "adaptive",
      interviewMode: "text",
      questionFlow: "linear",
      timePerQuestion: 5,
      duration: 45,
      enableFollowupQuestions: true,
      recordInterview: true,
      autoGenerateReport: true,
    }
  });
  
  // Dynamic data
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCandidatesData, setSelectedCandidatesData] = useState([]);
  
  // Dialog states
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [linksDialogOpen, setLinksDialogOpen] = useState(false);
  
  // Fetch initial data
  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);
  
  // Update selected candidates data when candidateIds change
  useEffect(() => {
    if (formData.candidateIds.length > 0 && candidates.length > 0) {
      const selected = candidates.filter(candidate => 
        formData.candidateIds.includes(candidate._id)
      );
      setSelectedCandidatesData(selected);
    } else {
      setSelectedCandidatesData([]);
    }
  }, [formData.candidateIds, candidates]);
  
  // Fetch interview details when interviewId changes
  useEffect(() => {
    if (interviewId) {
      fetchInterviewDetails();
      fetchCandidateAccessLinks();
    }
  }, [interviewId]);
  
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `http://localhost:5000/api/v1/jobs?organizationId=${user.organizationId}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data?.data?.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };
  
  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `http://localhost:5000/api/v1/candidates?organizationId=${user.organizationId}&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data?.data?.candidates || []);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };
  
  const fetchInterviewDetails = async () => {
    if (!interviewId) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(
        `http://localhost:5000/api/v1/interviews/${interviewId}?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setInterviewDetails(data?.data?.interview);
      }
    } catch (error) {
      console.error('Error fetching interview details:', error);
    }
  };
  
  const fetchCandidateAccessLinks = async () => {
    if (!interviewId || formData.candidateIds.length === 0) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch the interview to get access link
      const response = await fetch(
        `http://localhost:5000/api/v1/interviews/${interviewId}?organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const interview = data?.data?.interview;
        const link = interview?.access?.link;
        
        if (link) {
          // Create mapping of candidateId to access link
          const links = {};
          formData.candidateIds.forEach(candidateId => {
            // In a real implementation, each candidate would have their own unique token
            // For now, we'll use the same link for all candidates from this interview
            links[candidateId] = link;
          });
          setCandidateAccessLinks(links);
        }
      }
    } catch (error) {
      console.error('Error fetching access links:', error);
    }
  };
  
  const generateIndividualCandidateLinks = async () => {
    if (!interviewId) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      
      // Generate unique tokens for each candidate
      const links = {};
      for (const candidateId of formData.candidateIds) {
        // In a real implementation, you would call an endpoint to generate individual token
        // For now, we'll construct a link with candidate ID as parameter
        const response = await fetch(
          `http://localhost:5000/api/v1/interviews/${interviewId}?organizationId=${JSON.parse(localStorage.getItem('user') || '{}').organizationId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const baseLink = data?.data?.interview?.access?.link;
          if (baseLink) {
            // Add candidate ID as query parameter
            links[candidateId] = `${baseLink}?candidateId=${candidateId}`;
          }
        }
      }
      
      setCandidateAccessLinks(links);
      toast({
        title: "Links Generated",
        description: "Individual candidate links have been generated",
      });
    } catch (error) {
      console.error('Error generating links:', error);
    }
  };
  
  const copyToClipboard = async (text, candidateId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinks(prev => ({ ...prev, [candidateId]: true }));
      
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedLinks(prev => ({ ...prev, [candidateId]: false }));
      }, 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };
  
  const sendIndividualLinks = async (candidateId, link) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get candidate details
      const candidate = candidates.find(c => c._id === candidateId);
      if (!candidate) return;
      
      // Send invite via backend
      const response = await fetch(
        `http://localhost:5000/api/v1/interviews/${interviewId}/send-invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId: user.organizationId,
            candidateId: candidateId,
          }),
        }
      );
      
      if (response.ok) {
        toast({
          title: "Invite Sent",
          description: `Interview link sent to ${candidate.personalInfo.name}`,
        });
      } else {
        throw new Error('Failed to send invite');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invite",
        variant: "destructive",
      });
    }
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
  
  const handleCandidateToggle = (candidateId) => {
    setFormData(prev => {
      const isSelected = prev.candidateIds.includes(candidateId);
      return {
        ...prev,
        candidateIds: isSelected
          ? prev.candidateIds.filter(id => id !== candidateId)
          : [...prev.candidateIds, candidateId]
      };
    });
  };
  
  const createInterview = async () => {
    if (!formData.jobId || formData.candidateIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select a job and at least one candidate",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // First, check if interviews already exist for these candidates
      const existingInterviewsResponse = await fetch(
        `http://localhost:5000/api/v1/interviews?jobId=${formData.jobId}&candidateIds=${formData.candidateIds.join(',')}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (existingInterviewsResponse.ok) {
        const existingData = await existingInterviewsResponse.json();
        const existingInterviews = existingData?.data?.interviews || [];
        
        // Filter for active interviews (not cancelled or expired)
        const activeInterviews = existingInterviews.filter(interview => 
          interview.status !== INTERVIEW_STATUS.CANCELLED && interview.status !== INTERVIEW_STATUS.EXPIRED
        );
        
        if (activeInterviews.length > 0) {
          // Use the first existing active interview
          setInterviewId(activeInterviews[0]._id);
          toast({
            title: "Interview Found",
            description: "Using existing interview session",
            variant: "info",
          });
          return activeInterviews[0]._id;
        }
      }
      
      // If no active interview exists, create new one
      const response = await fetch('http://localhost:5000/api/v1/interviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organizationId: user.organizationId,
          recruiterId: user._id,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        
        // Handle specific error for existing interviews
        if (error.message?.includes('already exists') || error.message?.includes('active interview')) {
          const findResponse = await fetch(
            `http://localhost:5000/api/v1/interviews?jobId=${formData.jobId}&candidateId=${formData.candidateIds[0]}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          
          if (findResponse.ok) {
            const findData = await findResponse.json();
            const interviews = findData?.data?.interviews || [];
            if (interviews.length > 0) {
              setInterviewId(interviews[0]._id);
              toast({
                title: "Interview Exists",
                description: "Using existing interview session",
                variant: "info",
              });
              return interviews[0]._id;
            }
          }
        }
        
        throw new Error(error.message || 'Failed to create interview');
      }
      
      const data = await response.json();
      
      // Handle single or multiple interviews
      if (Array.isArray(data.data)) {
        const interview = data.data[0];
        setInterviewId(interview._id);
        return interview._id;
      } else {
        setInterviewId(data.data._id);
        return data.data._id;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };
  
  const getExistingInterviewId = async () => {
    if (!formData.jobId || formData.candidateIds.length === 0) {
      return null;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      
      // Check for existing active interviews
      const response = await fetch(
        `http://localhost:5000/api/v1/interviews?jobId=${formData.jobId}&candidateId=${formData.candidateIds[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const interviews = data?.data?.interviews || [];
        
        if (interviews.length > 0) {
          // Return the first active interview
          return interviews[0]._id;
        }
      }
    } catch (error) {
      console.error('Error checking for existing interviews:', error);
    }
    
    return null;
  };
  
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      let currentInterviewId = interviewId;
      
      // First, check if we already have an interview ID
      if (!currentInterviewId) {
        // Check for existing interviews before creating new one
        currentInterviewId = await getExistingInterviewId();
        
        if (currentInterviewId) {
          // Found existing interview, use it
          setInterviewId(currentInterviewId);
          toast({
            title: "Found Existing Interview",
            description: "Using existing interview session",
            variant: "info",
          });
        } else {
          // No existing interview, create new one
          currentInterviewId = await createInterview();
          if (!currentInterviewId) {
            return; // Error already shown
          }
        }
      }
      
      // Check if questions already exist for this interview
      const token = localStorage.getItem('accessToken');
      const existingQuestionsResponse = await fetch(
        `http://localhost:5000/api/v1/interviews/${currentInterviewId}/questions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (existingQuestionsResponse.ok) {
        const existingQuestionsData = await existingQuestionsResponse.json();
        if (existingQuestionsData?.data?.length > 0) {
          // Questions already exist, use them
          setQuestions(existingQuestionsData.data);
          toast({
            title: "Questions Found",
            description: `Loaded ${existingQuestionsData.data.length} existing questions`,
          });
          setCurrentStep(3);
          return;
        }
      }
      
      // Generate new questions
      const response = await fetch(`http://localhost:5000/api/v1/interviews/${currentInterviewId}/generate-questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        
        // Handle specific case where interview is not in SETUP status
        if (error.message?.includes('can only be generated in setup status')) {
          // Interview already has questions or is in different status
          toast({
            title: "Interview Status",
            description: "Interview already has questions or is in progress",
            variant: "info",
          });
          
          // Try to fetch existing questions again
          const questionsResponse = await fetch(
            `http://localhost:5000/api/v1/interviews/${currentInterviewId}/questions`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          
          if (questionsResponse.ok) {
            const questionsData = await questionsResponse.json();
            setQuestions(questionsData?.data || []);
          }
          
          setCurrentStep(3);
          return;
        }
        
        throw new Error(error.message || 'Failed to generate questions');
      }
      
      const data = await response.json();
      setQuestions(data?.data?.questions || []);
      
      toast({
        title: "Questions Generated",
        description: `Generated ${data?.data?.questions?.length || 0} questions`,
      });
      
      // Move to next step
      setCurrentStep(3);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  useEffect(() => {
    // If we have job and candidates selected, check for existing interview
    if (formData.jobId && formData.candidateIds.length > 0 && !interviewId) {
      const checkExistingInterview = async () => {
        const existingId = await getExistingInterviewId();
        if (existingId) {
          setInterviewId(existingId);
          // Also fetch existing questions if any
          try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(
              `http://localhost:5000/api/v1/interviews/${existingId}/questions`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data?.data?.length > 0) {
                setQuestions(data.data);
              }
            }
          } catch (error) {
            console.error('Error fetching existing questions:', error);
          }
        }
      };
      
      checkExistingInterview();
    }
  }, [formData.jobId, formData.candidateIds, interviewId]);
  
  const removeQuestion = async (questionId) => {
    try {
      // Filter locally (backend would need DELETE endpoint)
      setQuestions(questions.filter(q => q._id !== questionId));
      
      toast({
        title: "Question Removed",
        description: "Question removed from interview",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleApproveQuestion = async (questionId, isApproved) => {
    // Update locally (backend would need PATCH endpoint)
    setQuestions(questions.map(q => 
      q._id === questionId ? { ...q, isApproved } : q
    ));
  };
  
  const handleAddCustomQuestion = async () => {
    const newQuestion = {
      _id: `custom_${Date.now()}`,
      question: {
        text: "Custom question - edit me",
        category: "technical",
        skill: "general",
        difficulty: "medium",
      },
      isAiGenerated: false,
      isApproved: false,
      order: questions.length,
    };
    
    setQuestions([...questions, newQuestion]);
  };
  
  const handleUpdateQuestions = async () => {
    if (!interviewId) {
      toast({
        title: "Error",
        description: "Please generate questions first",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const formattedQuestions = questions.map((q, index) => ({
        _id: q._id,
        text: q.question?.text || q.text || "",
        category: q.question?.category || q.type || "technical",
        skill: q.question?.skill || q.skill || "general",
        difficulty: q.question?.difficulty || q.difficulty || "medium",
        isApproved: q.isApproved || false,
        order: index,
      }));

      const response = await fetch(`http://localhost:5000/api/v1/interviews/${interviewId}/questions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: formattedQuestions
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update questions');
      }
      
      toast({
        title: "Questions Updated",
        description: "Questions have been updated successfully",
      });
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
  
  const handleMarkAsReady = async () => {
    if (!interviewId) {
      toast({
        title: "Error",
        description: "Please generate questions first",
        variant: "destructive",
      });
      return;
    }
    
    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "No questions available. Please generate questions first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/v1/interviews/${interviewId}/mark-ready`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark interview as ready');
      }
      
      const data = await response.json();
      
      // Fetch updated interview details to get the access link
      await fetchInterviewDetails();
      
      toast({
        title: "Interview Ready",
        description: "Interview is now ready for candidates. Access link has been generated.",
      });
      
      // Move to final step
      setCurrentStep(4);
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
  
  const handleSendInvite = async () => {
    if (!interviewId) {
      toast({
        title: "Error",
        description: "Please mark interview as ready first",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/v1/interviews/${interviewId}/send-invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send invite');
      }
      
      toast({
        title: "Invite Sent",
        description: "Interview invites have been sent to candidates",
      });
      
      // Open share dialog
      setShareDialogOpen(true);
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
  
  const handleBulkSendInvites = async () => {
    if (!interviewId || formData.candidateIds.length === 0) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Send invites to all selected candidates
      for (const candidateId of formData.candidateIds) {
        const response = await fetch(`http://localhost:5000/api/v1/interviews/${interviewId}/send-invite`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidateId: candidateId,
          }),
        });
        
        if (!response.ok) {
          console.error(`Failed to send invite to candidate ${candidateId}`);
        }
      }
      
      toast({
        title: "Invites Sent",
        description: `Invites sent to ${formData.candidateIds.length} candidates`,
      });
      
      setLinksDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send some invites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get filtered candidates for selected job
  const filteredCandidates = formData.jobId
    ? candidates.filter(candidate => candidate.jobId?._id === formData.jobId)
    : candidates;
  
  // Get selected job details
  const selectedJob = jobs.find(job => job._id === formData.jobId);
  
  // Render candidate access links section
  const renderCandidateLinks = () => {
    if (!interviewDetails?.access?.link) return null;
    
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Candidates can access their interview using the link below. The link contains a unique token for authentication.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          {selectedCandidatesData.map((candidate, index) => (
            <div key={candidate._id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-accent">
                    {candidate.personalInfo.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{candidate.personalInfo.name}</p>
                  <p className="text-xs text-muted-foreground">{candidate.personalInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const link = candidateAccessLinks[candidate._id] || interviewDetails.access.link;
                    window.open(link, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const link = candidateAccessLinks[candidate._id] || interviewDetails.access.link;
                    copyToClipboard(link, candidate._id);
                  }}
                >
                  {copiedLinks[candidate._id] ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  Copy
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Master Interview Link</Label>
            <Badge variant="outline">One link for all candidates</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={interviewDetails.access.link}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(interviewDetails.access.link, 'master')}
            >
              {copiedLinks.master ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this link with candidates. Each candidate will need to authenticate with their email.
          </p>
        </div>
      </div>
    );
  };
  
  // Render share interview dialog
  const renderShareDialog = () => (
    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Interview</DialogTitle>
          <DialogDescription>
            Interview is ready! Share the access link with candidates.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="links" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="links">Candidate Links</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="links" className="space-y-4">
            {renderCandidateLinks()}
            
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShareDialogOpen(false);
                  router.push('/recruiter/interviews');
                }}
              >
                Back to Interviews
              </Button>
              <Button
                variant="accent"
                onClick={() => {
                  setShareDialogOpen(false);
                  setLinksDialogOpen(true);
                }}
              >
                Manage All Links
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Interview Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Candidates can start the interview immediately
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Access Token</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={interviewDetails?.access?.token || 'Loading...'}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(interviewDetails?.access?.token || '', 'token')}
                  >
                    {copiedLinks.token ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This token is embedded in the interview link for authentication
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Expiration</Label>
                <div className="text-sm">
                  {interviewDetails?.expiresAt ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Expires on {new Date(interviewDetails.expiresAt).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No expiration set</span>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
  
  // Render manage links dialog
  const renderLinksDialog = () => (
    <Dialog open={linksDialogOpen} onOpenChange={setLinksDialogOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Candidate Links</DialogTitle>
          <DialogDescription>
            View and manage access links for individual candidates
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Candidate Access Links</h4>
              <p className="text-xs text-muted-foreground">
                {formData.candidateIds.length} candidates selected
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={generateIndividualCandidateLinks}
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Generate Links
            </Button>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {selectedCandidatesData.map((candidate) => (
              <div key={candidate._id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-accent">
                        {candidate.personalInfo.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{candidate.personalInfo.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {candidate.status || 'New'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => sendIndividualLinks(candidate._id, candidateAccessLinks[candidate._id])}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const link = candidateAccessLinks[candidate._id] || interviewDetails?.access?.link;
                        if (link) copyToClipboard(link, candidate._id);
                      }}
                    >
                      {copiedLinks[candidate._id] ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {candidateAccessLinks[candidate._id] ? (
                  <div className="pl-8">
                    <div className="flex items-center gap-2">
                      <Input
                        value={candidateAccessLinks[candidate._id]}
                        readOnly
                        className="text-xs h-8 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pl-8">
                    <p className="text-xs text-muted-foreground">
                      No individual link generated. Use the master link.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="border rounded-lg p-3 bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Quick Actions</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (interviewDetails?.access?.link) {
                    copyToClipboard(interviewDetails.access.link, 'master-all');
                  }
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Master Link
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleBulkSendInvites}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Mail className="h-3 w-3 mr-1" />
                )}
                Send All Invites
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setLinksDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setLinksDialogOpen(false);
                router.push('/recruiter/interviews');
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <RecruiterLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/recruiter/interviews">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Interview Session</h1>
            <p className="text-muted-foreground">Set up a new AI-powered interview</p>
          </div>
          
          {interviewId && (
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                ID: {interviewId.substring(0, 8)}...
              </Badge>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    Get Links
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Interview Access</DialogTitle>
                    <DialogDescription>
                      Manage candidate access links for this interview
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm">
                      Interview ID: <code className="bg-muted px-1 rounded">{interviewId}</code>
                    </p>
                    {interviewDetails?.access?.link ? (
                      <div className="space-y-2">
                        <Label>Access Link</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={interviewDetails.access.link}
                            readOnly
                            className="text-sm"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyToClipboard(interviewDetails.access.link, 'quick-link')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Interview link not generated yet. Mark interview as ready first.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === step.id 
                    ? "bg-accent text-accent-foreground" 
                    : currentStep > step.id
                    ? "bg-success/10 text-success"
                    : "bg-secondary text-muted-foreground"
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </motion.div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? "bg-success" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div>
                  <CardTitle className="mb-2">Job Details</CardTitle>
                  <CardDescription>Select the job and define interview parameters</CardDescription>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="job">Select Job Position *</Label>
                    <Select
                      value={formData.jobId}
                      onValueChange={(value) => handleInputChange('jobId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a job position" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job._id} value={job._id}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Context (Optional)</Label>
                    <Textarea 
                      id="description"
                      placeholder="Any specific areas to focus on, team context, or project details..."
                      rows={4}
                      value={formData.additionalContext}
                      onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Experience Level *</Label>
                      <Select 
                        value={formData.experienceLevel}
                        onValueChange={(value) => handleInputChange('experienceLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
                          <SelectItem value="senior">Senior (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question Count *</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Questions:</span>
                          <span className="text-sm font-medium">{formData.config.questionCount}</span>
                        </div>
                        <Slider
                          value={[formData.config.questionCount]}
                          onValueChange={(value) => handleInputChange('config.questionCount', value[0])}
                          min={3}
                          max={15}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div>
                  <CardTitle className="mb-2">Select Candidates *</CardTitle>
                  <CardDescription>
                    {formData.jobId && selectedJob
                      ? `Choose candidates for ${selectedJob.title} position`
                      : "Please select a job position first"}
                  </CardDescription>
                </div>

                <div className="space-y-4">
                  <Input placeholder="Search candidates..." />
                  
                  <div className="space-y-3">
                    {filteredCandidates.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {formData.jobId 
                          ? "No candidates found for this job position"
                          : "Select a job position to see candidates"}
                      </div>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <label
                          key={candidate._id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-secondary/30 cursor-pointer transition-all"
                        >
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-border text-accent focus:ring-accent" 
                            checked={formData.candidateIds.includes(candidate._id)}
                            onChange={() => handleCandidateToggle(candidate._id)}
                          />
                          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-accent">
                              {candidate.personalInfo.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{candidate.personalInfo.name}</p>
                            <p className="text-sm text-muted-foreground">{candidate.personalInfo.email}</p>
                          </div>
                          <Badge variant="secondary">
                            {candidate.status || 'New'}
                          </Badge>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div>
                  <CardTitle className="mb-2">AI Questions</CardTitle>
                  <CardDescription>Review and approve generated questions</CardDescription>
                </div>

                {questions.length === 0 ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Question Distribution</Label>
                          <Select
                            value={formData.config.questionDistribution}
                            onValueChange={(value) => handleInputChange('config.questionDistribution', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="balanced">Balanced Mix</SelectItem>
                              <SelectItem value="technical">Technical Focus</SelectItem>
                              <SelectItem value="behavioral">Behavioral Focus</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Difficulty Level</Label>
                          <Select
                            value={formData.config.difficultyLevel}
                            onValueChange={(value) => handleInputChange('config.difficultyLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="adaptive">Adaptive</SelectItem>
                              <SelectItem value="easy">Entry Level</SelectItem>
                              <SelectItem value="medium">Intermediate</SelectItem>
                              <SelectItem value="hard">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="accent" 
                      className="w-full" 
                      onClick={handleGenerateQuestions}
                      disabled={isGenerating || !formData.jobId || formData.candidateIds.length === 0}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Questions...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate AI Questions
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {questions.length} questions generated • {questions.filter(q => q.isApproved).length} approved
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleAddCustomQuestion}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom
                        </Button>
                        <Button variant="accent" size="sm" onClick={handleUpdateQuestions}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {questions.map((question, index) => (
                        <motion.div
                          key={question._id || question.id}
                          className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-card transition-all group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 cursor-grab" />
                            <Switch
                              checked={question.isApproved}
                              onCheckedChange={(checked) => handleApproveQuestion(question._id || question.id, checked)}
                              className="scale-90"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground">{question.question?.text || question.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">{question.question?.category || question.type}</Badge>
                              <Badge variant="outline">{question.question?.skill || question.skill}</Badge>
                              <Badge variant="muted">{question.question?.difficulty || question.difficulty}</Badge>
                              {question.isAiGenerated && (
                                <Badge variant="accent" className="text-xs">
                                  AI Generated
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeQuestion(question._id || question.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div>
                  <CardTitle className="mb-2">Interview Configuration</CardTitle>
                  <CardDescription>Finalize interview settings and generate access links</CardDescription>
                </div>

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Interview Mode *</Label>
                      <Select
                        value={formData.config.interviewMode}
                        onValueChange={(value) => handleInputChange('config.interviewMode', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text-based</SelectItem>
                          <SelectItem value="audio">Audio Interview</SelectItem>
                          <SelectItem value="video">Video Interview</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question Flow *</Label>
                      <Select
                        value={formData.config.questionFlow}
                        onValueChange={(value) => handleInputChange('config.questionFlow', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Linear (Fixed Order)</SelectItem>
                          <SelectItem value="adaptive">Adaptive (AI-driven)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Time per Question *</Label>
                      <Select
                        value={formData.config.timePerQuestion.toString()}
                        onValueChange={(value) => handleInputChange('config.timePerQuestion', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 minutes</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Total Duration *</Label>
                      <Select
                        value={formData.config.duration.toString()}
                        onValueChange={(value) => handleInputChange('config.duration', parseInt(value))}
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
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Follow-up Questions</Label>
                        <p className="text-sm text-muted-foreground">AI will probe weak areas automatically</p>
                      </div>
                      <Switch
                        checked={formData.config.enableFollowupQuestions}
                        onCheckedChange={(checked) => handleInputChange('config.enableFollowupQuestions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Record Interview</Label>
                        <p className="text-sm text-muted-foreground">Save responses for later review</p>
                      </div>
                      <Switch
                        checked={formData.config.recordInterview}
                        onCheckedChange={(checked) => handleInputChange('config.recordInterview', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-generate Report</Label>
                        <p className="text-sm text-muted-foreground">Create evaluation report after completion</p>
                      </div>
                      <Switch
                        checked={formData.config.autoGenerateReport}
                        onCheckedChange={(checked) => handleInputChange('config.autoGenerateReport', checked)}
                      />
                    </div>
                  </div>

                  {/* Access Links Preview */}
                  {interviewDetails?.access?.link && (
                    <div className="border rounded-lg p-4 bg-success/5">
                      <div className="flex items-center gap-2 mb-3">
                        <LinkIcon className="h-5 w-5 text-success" />
                        <h3 className="font-semibold text-success">Access Link Generated</h3>
                      </div>
                      <div className="space-y-2">
                        <Label>Interview Link</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={interviewDetails.access.link}
                            readOnly
                            className="text-sm"
                          />
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(interviewDetails.access.link, 'preview-link')}
                          >
                            {copiedLinks['preview-link'] ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Share this link with candidates. Each candidate will authenticate with their email.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              variant="accent"
              onClick={async () => {
                if (currentStep === 2 && formData.candidateIds.length === 0) {
                  toast({
                    title: "Selection Required",
                    description: "Please select at least one candidate",
                    variant: "destructive",
                  });
                  return;
                }
                
                // If moving to step 3 and we have an interviewId, check status
                if (currentStep === 2 && interviewId) {
                  toast({
                    title: "Using Existing Interview",
                    description: "Continuing with existing interview session",
                    variant: "info",
                  });
                }
                
                setCurrentStep(Math.min(4, currentStep + 1));
              }}
              disabled={
                (currentStep === 1 && !formData.jobId) ||
                (currentStep === 2 && formData.candidateIds.length === 0)
              }
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="flex gap-3">
              {questions.length > 0 && !interviewId && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    // Create interview with existing questions
                    const id = await createInterview();
                    if (id) {
                      setInterviewId(id);
                      setCurrentStep(4);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Create Interview
                </Button>
              )}
              
              {interviewId && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleMarkAsReady}
                    disabled={isLoading || questions.length === 0}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Mark as Ready
                  </Button>
                  <Button 
                    variant="hero" 
                    onClick={handleSendInvite}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Send Invite
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share Interview</DialogTitle>
                        <DialogDescription>
                          Get the interview access link to share with candidates
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {interviewDetails?.access?.link ? (
                          <>
                            <div className="space-y-2">
                              <Label>Interview Link</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={interviewDetails.access.link}
                                  readOnly
                                  className="text-sm"
                                />
                                <Button
                                  variant="outline"
                                  onClick={() => copyToClipboard(interviewDetails.access.link, 'dialog-link')}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Access Token</Label>
                              <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                                {interviewDetails.access.token}
                              </code>
                              <p className="text-xs text-muted-foreground">
                                This token is embedded in the interview link
                              </p>
                            </div>
                          </>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Interview link not generated yet. Mark interview as ready first.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Dialogs */}
      {renderShareDialog()}
      {renderLinksDialog()}
    </RecruiterLayout>
  );
};

export default CreateInterview;