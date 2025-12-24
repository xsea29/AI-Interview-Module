"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  LayoutDashboard,
  Briefcase,
  Users,
  ClipboardList,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = "http://localhost:5000/api/v1";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/recruiter/dashboard" },
  { icon: Briefcase, label: "Jobs", href: "/recruiter/jobs" },
  { icon: Users, label: "Candidates", href: "/recruiter/candidates" },
  { icon: ClipboardList, label: "Interviews", href: "/recruiter/interviews" },
  { icon: Calendar, label: "Schedule", href: "/recruiter/schedule" },
  { icon: BarChart3, label: "Reports", href: "/recruiter/reports" },
  { icon: Settings, label: "Settings", href: "/recruiter/settings" },
];

const RecruiterLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  // const { user, logout } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);

  // Get user data from localStorage on component mount
 useEffect(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      setUser(JSON.parse(userStr));
    } catch (e) {
      console.error(e);
    }
  }
}, []);


  const logout = async () => {
    setIsSigningOut(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      
      // Update state
      setUser(null);
      
      // Redirect to login
      router.push('/recruiter/login');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.profile?.name) {
      return user.profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return 'JD';
  };

  // const handleSignOut = async () => {
  //   setIsSigningOut(true);
  //   await logout();
  //   setIsSigningOut(false);
  // };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent">
              <Brain className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <span className="font-semibold text-foreground">InterviewAI</span>
              <p className="text-xs text-muted-foreground">Recruiter Portal</p>
            </div>
          </div>

          {/* Quick Action */}
          <div className="px-4 py-4">
            <Link href="/recruiter/interviews/new">
              <Button variant="accent" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Interview
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/recruiter/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} legacyBehavior>
                    <a>
                      <motion.div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent/10 text-accent"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <item.icon className={cn("h-5 w-5", isActive && "text-accent")} />
                        <span>{item.label}</span>
                        {isActive && (
                          <ChevronRight className="h-4 w-4 ml-auto text-accent" />
                        )}
                      </motion.div>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full gradient-accent flex items-center justify-center">
                <span className="text-sm font-medium text-accent-foreground">
                  {user?.profile?.name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase() || 'JD'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.profile?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.profile?.designation || user?.role || 'Recruiter'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={logout}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default RecruiterLayout;