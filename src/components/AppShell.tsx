"use client";

import Sidebar from "./Sidebar";

interface Project {
  id: string;
  name: string;
  _count?: { quotes: number };
}

interface AppShellProps {
  children: React.ReactNode;
  projects: Project[];
  userEmail?: string;
  inboxAddress?: string;
}

export default function AppShell({
  children,
  projects,
  userEmail,
  inboxAddress,
}: AppShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar
        projects={projects}
        userEmail={userEmail}
        inboxAddress={inboxAddress}
      />
      <main className="ml-64 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
