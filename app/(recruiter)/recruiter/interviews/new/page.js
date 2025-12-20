"use client";

import { useState } from "react";
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
  GripVertical
} from "lucide-react";
import Link from "next/link";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
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

const steps = [
  { id: 1, title: "Job Details", icon: Briefcase },
  { id: 2, title: "Candidates", icon: Users },
  { id: 3, title: "AI Questions", icon: Brain },
  { id: 4, title: "Configuration", icon: Settings2 },
];

const mockGeneratedQuestions = [
  {
    id: 1,
    text: "Describe a complex frontend architecture decision you made and its impact on the project.",
    type: "Technical",
    skill: "Architecture",
    difficulty: "Senior"
  },
  {
    id: 2,
    text: "How do you approach performance optimization in React applications?",
    type: "Technical",
    skill: "Performance",
    difficulty: "Mid"
  },
  {
    id: 3,
    text: "Tell me about a time you had to resolve a conflict within your team.",
    type: "Behavioral",
    skill: "Communication",
    difficulty: "All Levels"
  },
  {
    id: 4,
    text: "How would you handle implementing a feature with unclear requirements?",
    type: "Situational",
    skill: "Problem Solving",
    difficulty: "Mid"
  },
  {
    id: 5,
    text: "Explain your experience with state management solutions and when to use each.",
    type: "Technical",
    skill: "React",
    difficulty: "Senior"
  },
];

const CreateInterview = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState([5]);

  const handleGenerateQuestions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setQuestions(mockGeneratedQuestions);
      setIsGenerating(false);
    }, 2000);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

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
                    <Label htmlFor="job">Select Job Position</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a job position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend-senior">Senior Frontend Developer</SelectItem>
                        <SelectItem value="backend-mid">Mid-Level Backend Engineer</SelectItem>
                        <SelectItem value="pm">Product Manager</SelectItem>
                        <SelectItem value="ux">UX Designer</SelectItem>
                        <SelectItem value="devops">DevOps Engineer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Context (Optional)</Label>
                    <Textarea 
                      id="description"
                      placeholder="Any specific areas to focus on, team context, or project details..."
                      rows={4}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select defaultValue="senior">
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
                      <Label>Interview Owner</Label>
                      <Select defaultValue="jane">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jane">Jane Doe (You)</SelectItem>
                          <SelectItem value="john">John Smith</SelectItem>
                          <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <CardTitle className="mb-2">Select Candidates</CardTitle>
                  <CardDescription>Choose candidates for this interview session</CardDescription>
                </div>

                <div className="space-y-4">
                  <Input placeholder="Search candidates..." />
                  
                  <div className="space-y-3">
                    {[
                      { name: "Alex Johnson", email: "alex@email.com", applied: "2 days ago" },
                      { name: "Sarah Chen", email: "sarah@email.com", applied: "3 days ago" },
                      { name: "Mike Peters", email: "mike@email.com", applied: "5 days ago" },
                    ].map((candidate, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-secondary/30 cursor-pointer transition-all"
                      >
                        <input type="checkbox" className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-accent">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        </div>
                        <Badge variant="secondary">Applied {candidate.applied}</Badge>
                      </label>
                    ))}
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
                  <CardTitle className="mb-2">Generate AI Questions</CardTitle>
                  <CardDescription>Configure and generate interview questions using AI</CardDescription>
                </div>

                {questions.length === 0 ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Number of Questions: {questionCount[0]}</Label>
                        <Slider
                          value={questionCount}
                          onValueChange={setQuestionCount}
                          min={3}
                          max={10}
                          step={1}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Question Distribution</Label>
                          <Select defaultValue="balanced">
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
                          <Select defaultValue="adaptive">
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
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                          Generating Questions...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate AI Questions
                        </>
                      )}
                    </Button>

                    {isGenerating && (
                      <div className="space-y-2">
                        <Progress value={66} className="h-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Analyzing job requirements and generating tailored questions...
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {questions.length} questions generated • Drag to reorder
                      </p>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {questions.map((question, index) => (
                        <motion.div
                          key={question.id}
                          className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-card transition-all group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground">{question.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">{question.type}</Badge>
                              <Badge variant="outline">{question.skill}</Badge>
                              <Badge variant="muted">{question.difficulty}</Badge>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeQuestion(question.id)}
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
                  <CardDescription>Set up interview behavior and timing rules</CardDescription>
                </div>

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Interview Mode</Label>
                      <Select defaultValue="text">
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
                      <Label>Question Flow</Label>
                      <Select defaultValue="linear">
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
                      <Label>Max Time per Question</Label>
                      <Select defaultValue="5">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 minutes</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Total Duration Limit</Label>
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
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Follow-up Questions</Label>
                        <p className="text-sm text-muted-foreground">AI will probe weak areas automatically</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Record Interview</Label>
                        <p className="text-sm text-muted-foreground">Save responses for later review</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-generate Report</Label>
                        <p className="text-sm text-muted-foreground">Create evaluation report after completion</p>
                      </div>
                      <Switch defaultChecked />
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

          {currentStep < 4 ? (
            <Button
              variant="accent"
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button variant="hero">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Interview Session
            </Button>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
};

export default CreateInterview;