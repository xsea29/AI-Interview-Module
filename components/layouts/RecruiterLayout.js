"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
                <span className="text-sm font-medium text-accent-foreground">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Jane Doe</p>
                <p className="text-xs text-muted-foreground truncate">HR Manager</p>
              </div>
            </div>
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default RecruiterLayout;