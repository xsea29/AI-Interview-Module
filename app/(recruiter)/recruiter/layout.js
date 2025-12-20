"use client";

import Link from "next/link";
import { Briefcase, Users, ClipboardList, FileText } from "lucide-react";

export default function RecruiterLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">Recruiter</h2>

        <nav className="space-y-2">
          <Link href="/recruiter/dashboard">Dashboard</Link>
          <Link href="/recruiter/jobs">Jobs</Link>
          <Link href="/recruiter/candidates">Candidates</Link>
          <Link href="/recruiter/interviews">Interviews</Link>
          <Link href="/recruiter/reports">Reports</Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
