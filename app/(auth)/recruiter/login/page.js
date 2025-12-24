"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// API Configuration
const API_BASE_URL = "http://localhost:5000/api/v1";
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REFRESH: `${API_BASE_URL}/auth/refresh-token`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  REGISTER: `${API_BASE_URL}/auth/register`,
};

export default function RecruiterLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call your backend API
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from backend
        if (data.message?.includes("already registered")) {
          throw new Error("Email already registered");
        } else if (data.message?.includes("Invalid") || data.message?.includes("incorrect")) {
          throw new Error("Invalid email or password");
        } else if (data.message?.includes("deactivated") || data.message?.includes("not active")) {
          throw new Error("Account is deactivated");
        } else if (data.message?.includes("Organization")) {
          throw new Error(data.message);
        } else {
          throw new Error(data.message || "Login failed");
        }
      }

      // Store tokens
      if (data.tokens) {
        localStorage.setItem("accessToken", data.data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
        
        // Also store in sessionStorage for immediate access
        sessionStorage.setItem("accessToken", data.data.tokens.accessToken);
      }

      // Store user data
      if (data.data.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
        sessionStorage.setItem("user", JSON.stringify(data.data.user));
      }

      // Show success message
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      const userRole = data?.data.user?.role?.toLowerCase();
      
      switch (userRole) {
        case "recruiter":
          router.push("/recruiter/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "candidate":
          router.push("/candidate/dashboard");
          break;
        default:
          router.push("/dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);
      
      // Show appropriate error message
      let errorTitle = "Login failed";
      let errorMessage = error.message || "Please try again.";
      
      if (error.message.includes("Invalid email or password")) {
        errorTitle = "Authentication failed";
        errorMessage = "Please check your credentials and try again.";
      } else if (error.message.includes("Account is deactivated")) {
        errorTitle = "Account deactivated";
        errorMessage = "Please contact your organization administrator.";
      } else if (error.message.includes("Organization")) {
        errorTitle = "Organization issue";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login for testing (remove in production)
  const handleDemoLogin = async () => {
    setEmail("demo@example.com");
    setPassword("demo123");
    
    // Auto-submit after setting values
    setTimeout(() => {
      const submitEvent = new Event("submit", { cancelable: true });
      const form = document.querySelector("form");
      if (form) {
        form.dispatchEvent(submitEvent);
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin(e);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 gradient-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-accent-foreground">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-accent-foreground/20">
                <Brain className="h-7 w-7" />
              </div>
              <span className="text-2xl font-semibold">InterviewAI</span>
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-8 w-8" />
              <span className="text-lg font-medium">Recruiter Portal</span>
            </div>

            <h1 className="text-4xl font-bold mb-6">
              Streamline Your <br /> Hiring Process
            </h1>

            <p className="opacity-80 max-w-md">
              Create interviews, generate AI-powered questions, and make
              data-driven hiring decisions.
            </p>

            {/* API Info for development */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-accent-foreground/10 rounded-lg">
                <p className="text-sm font-mono">
                  API: {API_BASE_URL}
                </p>
                <button
                  onClick={handleDemoLogin}
                  className="mt-2 text-sm underline hover:opacity-80"
                >
                  Try Demo Credentials
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div 
          className="w-full max-w-md" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/" className="flex items-center gap-2 text-sm mb-8 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Login to access recruiter dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="focus:ring-2 focus:ring-accent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-accent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90" 
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    "Login as Recruiter"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <div className="text-sm">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-accent hover:underline">
                    Register as Recruiter
                  </Link>
                </div>
                
                <div className="text-sm">
                  Admin user?{" "}
                  <Link href="/admin/login" className="text-accent hover:underline">
                    Go to Admin Login
                  </Link>
                </div>

                {/* Demo button for development */}
                {process.env.NODE_ENV === "development" && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={handleDemoLogin}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Use demo credentials
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Status Indicator */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              {isLoading ? "Connecting to API..." : `API: ${new URL(API_BASE_URL).hostname}`}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}