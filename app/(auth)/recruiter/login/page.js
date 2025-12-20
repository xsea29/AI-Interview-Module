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

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      router.push("/recruiter/dashboard");
    }, 1000);
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
          </motion.div>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/" className="flex items-center gap-2 text-sm mb-8">
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
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Login as Recruiter"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                Admin user?{" "}
                <Link href="/login/admin" className="text-accent underline">
                  Go to Admin Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
