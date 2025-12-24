"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";

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
import { useAuth } from "@/contexts/AuthContext";

// API Configuration
const API_BASE_URL = "http://localhost:5000/api/v1";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call your backend API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from backend
        if (data.message?.includes("Invalid") || data.message?.includes("incorrect")) {
          throw new Error("Invalid email or password");
        } else if (data.message?.includes("deactivated") || data.message?.includes("not active")) {
          throw new Error("Account is deactivated");
        } else {
          throw new Error(data.message || "Login failed");
        }
      }

      // Check if user is an admin
      if (data.data.user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      // Store tokens
      if (data.tokens) {
        localStorage.setItem("accessToken", data.data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
        sessionStorage.setItem("accessToken", data.data.tokens.accessToken);
      }

      // Store user data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
        sessionStorage.setItem("user", JSON.stringify(data.data.user));
      }

      // Show success message
      toast({
        title: "Welcome back, Admin",
        description: "You have successfully logged in.",
      });

      // Redirect to admin dashboard
      router.push("/admin/dashboard");

    } catch (error) {
      console.error("Admin login error:", error);
      
      // Show appropriate error message
      let errorTitle = "Login failed";
      let errorMessage = error.message || "Please try again.";
      
      if (error.message.includes("Invalid email or password")) {
        errorTitle = "Authentication failed";
        errorMessage = "Please check your credentials and try again.";
      } else if (error.message.includes("Account is deactivated")) {
        errorTitle = "Account deactivated";
        errorMessage = "Please contact system administrator.";
      } else if (error.message.includes("Access denied")) {
        errorTitle = "Access denied";
        errorMessage = "This portal is for administrators only.";
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

  // Demo admin login for testing (remove in production)
  const handleDemoAdminLogin = () => {
    setEmail("admin@interviewai.com");
    setPassword("admin123");
    
    // Auto-submit after setting values
    setTimeout(() => {
      const submitEvent = new Event("submit", { cancelable: true });
      const form = document.querySelector("form");
      if (form) {
        form.dispatchEvent(submitEvent);
      }
    }, 100);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin(e);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
                <Brain className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-semibold">InterviewAI</span>
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8" />
              <span className="text-lg font-medium opacity-90">
                Super Admin Portal
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Platform Governance
              <br />& Control Center
            </h1>

            <p className="text-lg opacity-80 max-w-md leading-relaxed">
              Manage organizations, configure platform settings, monitor usage
              analytics, and ensure compliance across the entire system.
            </p>

            {/* Admin-specific features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <p className="text-sm font-medium">Organizations</p>
                <p className="text-xs opacity-75">Manage all organizations</p>
              </div>
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs opacity-75">Platform-wide insights</p>
              </div>
            </div>

            {/* Demo login for development */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6">
                <button
                  onClick={handleDemoAdminLogin}
                  className="text-sm underline hover:opacity-80"
                >
                  Use Demo Admin Account
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onKeyPress={handleKeyPress}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">
                Admin Authentication
              </CardTitle>
              <CardDescription>
                Elevated privileges required for system access
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="focus:ring-2 focus:ring-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Authenticating...
                    </>
                  ) : (
                    "Access Admin Portal"
                  )}
                </Button>

                {/* Security notice */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800">
                    <Shield className="h-3 w-3 inline mr-1" />
                    This portal is restricted to authorized administrators only.
                    Unauthorized access is prohibited.
                  </p>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Looking for recruiter access?{" "}
                  <Link
                    href="/recruiter/login"
                    className="text-accent hover:underline font-medium"
                  >
                    Go to Recruiter Login
                  </Link>
                </p>
              </div>

              {/* API Status */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                  {isLoading ? "Connecting to API..." : `API: localhost:5000`}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}