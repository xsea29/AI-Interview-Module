"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Users, 
  ClipboardList, 
  Brain, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Building2,
  UserCircle,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Questions",
      description: "Generate job-specific interview questions using advanced AI aligned with role requirements."
    },
    {
      icon: ClipboardList,
      title: "Full Recruiter Control",
      description: "Review, edit, and customize AI-generated questionnaires with complete authority."
    },
    {
      icon: BarChart3,
      title: "Smart Evaluation",
      description: "Get structured reports with skill-wise scoring, strengths analysis, and hiring recommendations."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Secure candidate access, audit trails, and role-based permissions for compliance."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Compare candidates side-by-side and make data-driven hiring decisions together."
    },
    {
      icon: Zap,
      title: "Seamless Workflow",
      description: "From job setup to final decision, experience a streamlined 9-step hiring process."
    }
  ];

  const workflowSteps = [
    "Interview Setup",
    "Question Generation", 
    "Recruiter Review",
    "Flow Configuration",
    "Scheduling",
    "Execution",
    "AI Evaluation",
    "Decision",
    "Learning Loop"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">InterviewAI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Workflow</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/recruiter/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/recruiter/login">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="accent" className="mb-6 px-4 py-1.5">
              Enterprise-Grade AI Interviews
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Hire Smarter with{" "}
              <span className="text-gradient">AI-Powered</span>
              {" "}Interviews
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform your hiring process with intelligent interview automation. 
              Generate tailored questions, conduct structured interviews, and make 
              data-driven decisions—all while keeping humans in control.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login/recruiter">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login/admin">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Portal
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>GDPR compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Access Portals */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Three Dedicated Access Spaces
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Strictly separated portals ensure security, compliance, and clear ownership boundaries.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link href="/login/admin">
              <Card variant="interactive" className="h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Super Admin</CardTitle>
                  <CardDescription>Platform Governance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      Manage organizations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      Configure platform settings
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      View analytics & audit logs
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>

            <Link href="/login/recruiter">
              <Card variant="interactive" className="h-full border-accent/50 shadow-glow">
                <CardHeader>
                  <Badge variant="accent" className="w-fit mb-2">Most Popular</Badge>
                  <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle>Recruiter</CardTitle>
                  <CardDescription>Hiring Operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      Create & manage interviews
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      Review AI-generated questions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      Make hiring decisions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>

            <Card variant="interactive" className="h-full">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <UserCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle>Candidate</CardTitle>
                <CardDescription>Interview Access</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-accent" />
                    Secure one-time links
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    No login required
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Time-bound access
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Hire Better
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete interview management platform that keeps AI in check while maximizing efficiency.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-primary/[0.02]">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <Badge variant="secondary" className="mb-4">Workflow</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              9-Step Enterprise Hiring Process
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From interview setup to continuous improvement—a complete, auditable workflow.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block" />
              
              <div className="grid md:grid-cols-2 gap-4">
                {workflowSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className={`relative ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:col-start-2'}`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`flex items-center gap-3 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-hero text-primary-foreground font-semibold text-sm">
                        {index + 1}
                      </div>
                      <Card className="flex-1 py-3 px-4">
                        <span className="font-medium text-foreground">{step}</span>
                      </Card>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="gradient-hero text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <CardContent className="relative py-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Hiring?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of companies using AI to conduct better interviews and make smarter hiring decisions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login/recruiter">
                  <Button size="xl" className="bg-card text-foreground hover:bg-card/90">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">InterviewAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 InterviewAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;