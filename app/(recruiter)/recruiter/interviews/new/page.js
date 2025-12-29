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
  Mail
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

const steps = [
  { id: 1, title: "Job Details", icon: Briefcase },
  { id: 2, title: "Candidates", icon: Users },
  { id: 3, title: "AI Questions", icon: Brain },
  { id: 4, title: "Configuration", icon: Settings2 },
];


const activeStatuses = [
  INTERVIEW_STATUS.SETUP,
  INTERVIEW_STATUS.QUESTIONS_GENERATED,
  INTERVIEW_STATUS.READY,
  INTERVIEW_STATUS.SCHEDULED,
].join(",");

const CreateInterview = () => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // CRITICAL: Store interview ID once it's created
  const [interviewId, setInterviewId] = useState(null);
  
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
  
  // Fetch initial data
  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);
  
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
  
  // STEP 1: Create interview ONCE and store the ID
  // const createInterview = async () => {
  //   if (!formData.jobId || formData.candidateIds.length === 0) {
  //     toast({
  //       title: "Error",
  //       description: "Please select a job and at least one candidate",
  //       variant: "destructive",
  //     });
  //     return null;
  //   }
    
  //   try {
  //     const token = localStorage.getItem('accessToken');
  //     const user = JSON.parse(localStorage.getItem('user') || '{}');
      
  //     const response = await fetch('http://localhost:5000/api/v1/interviews', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         ...formData,
  //         organizationId: user.organizationId,
  //         recruiterId: user._id,
  //       }),
  //     });
      
  //     if (!response.ok) {
  //       const error = await response.json();
  //       throw new Error(error.message || 'Failed to create interview');
  //     }
      
  //     const data = await response.json();
      
  //     // Handle single or multiple interviews
  //     if (Array.isArray(data.data)) {
  //       // For bulk creation, use the first interview ID
  //       // In real app, you might want to handle all of them
  //       const interview = data.data[0];
  //       setInterviewId(interview._id);
  //       return interview._id;
  //     } else {
  //       // Single interview
  //       setInterviewId(data.data._id);
  //       return data.data._id;
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //     return null;
  //   }
  // };

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
    // This helps prevent duplicate creation
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
        // Try to find the existing interview
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

// const getExistingInterviewId = async () => {
//   if (!formData.jobId || formData.candidateIds.length === 0) {
//     return null;
//   }
  
//   try {
//     const token = localStorage.getItem('accessToken');
    
//     // Don't pass status parameter
//     const response = await fetch(
//       `http://localhost:5000/api/v1/interviews?jobId=${formData.jobId}&candidateId=${formData.candidateIds[0]}`,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       }
//     );
    
//     if (response.ok) {
//       const data = await response.json();
//       const interviews = data?.data?.interviews || [];
      
//       // Define active statuses
//       const activeStatuses = [
//         INTERVIEW_STATUS.SETUP, 
//         INTERVIEW_STATUS.QUESTIONS_GENERATED,
//         INTERVIEW_STATUS.READY,
//         INTERVIEW_STATUS.SCHEDULED
//       ];
      
//       // Filter for active interviews on client side
//       const activeInterviews = interviews.filter(interview => 
//         activeStatuses.includes(interview.status)
//       );
      
//       if (activeInterviews.length > 0) {
//         return activeInterviews[0]._id;
//       }
//     }
//   } catch (error) {
//     console.error('Error checking for existing interviews:', error);
//   }
  
//   return null;
// };
  
  // STEP 2: Generate questions for the created interview
  // const handleGenerateQuestions = async () => {
  //   setIsGenerating(true);
  //   try {
  //     let currentInterviewId = interviewId;

  //     console.log("Current Interview ID:", currentInterviewId);
      
  //     // If interview doesn't exist yet, create it first
  //     if (!currentInterviewId) {
  //       currentInterviewId = await createInterview();
  //       if (!currentInterviewId) {
  //         return; // Error already shown
  //       }
  //     }
      
  //     // Generate questions
  //     const token = localStorage.getItem('accessToken');
  //     const response = await fetch(`http://localhost:5000/api/v1/interviews/${currentInterviewId}/generate-questions`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });
      
  //     if (!response.ok) {
  //       const error = await response.json();
  //       throw new Error(error.message || 'Failed to generate questions');
  //     }
      
  //     const data = await response.json();
  //     setQuestions(data?.data?.questions || []);
      
  //     toast({
  //       title: "Questions Generated",
  //       description: `Generated ${data?.data?.questions?.length || 0} questions`,
  //     });
      
  //     // Move to next step
  //     setCurrentStep(3);
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

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
    
    console.log("Current Interview ID:", currentInterviewId);
    
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

// Add this useEffect after other useEffects
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
      const response = await fetch(`http://localhost:5000/api/v1/interviews/${interviewId}/questions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
  questions: questions.map((q, index) => ({
    _id: q._id,
    text: {
      value: q.question?.text || q.text
    },
    category: {
      value: q.question?.category || q.type
    },
    skill: {
      value: q.question?.skill || q.skill
    },
    difficulty: {
      value: q.question?.difficulty || q.difficulty
    },
    isApproved: q.isApproved,
    order: index,
  }))
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
      
      toast({
        title: "Interview Ready",
        description: "Interview is now ready for scheduling",
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
        description: "Interview invite has been sent to candidates",
      });
      
      // Redirect to interviews list
      router.push('/recruiter/interviews');
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
  
  // Get filtered candidates for selected job
  const filteredCandidates = formData.jobId
    ? candidates.filter(candidate => candidate.jobId?._id === formData.jobId)
    : candidates;
  
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
                    {formData.jobId 
                      ? `Choose candidates for ${jobs.find(j => j._id === formData.jobId)?.title} position`
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
                  <CardDescription>Finalize interview settings</CardDescription>
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

          {/* {currentStep < 4 ? (
            <Button
              variant="accent"
              onClick={() => {
                if (currentStep === 2 && formData.candidateIds.length === 0) {
                  toast({
                    title: "Selection Required",
                    description: "Please select at least one candidate",
                    variant: "destructive",
                  });
                  return;
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
            </Button> */}
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
};

export default CreateInterview;