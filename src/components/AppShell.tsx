"use client";

import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";
import InfiniteGrid from "./ui/InfiniteGrid";
import QuotalLogo from "./QuotalLogo";

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
  userPlan?: string;
  inboxCount?: number;
}

export default function AppShell({
  children,
  projects,
  userEmail,
  inboxAddress,
  userPlan,
  inboxCount = 0,
}: AppShellProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const showGrid = pathname === "/dashboard";
  const isDark = resolvedTheme === "dark";

  useEffect(() => setMounted(true), []);

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const content = (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-8 md:py-8">
      <PageTransition>{children}</PageTransition>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-surface-hover transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <QuotalLogo className="h-4 text-text-primary" />
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        projects={projects}
        userEmail={userEmail}
        inboxAddress={inboxAddress}
        userPlan={userPlan}
        inboxCount={inboxCount}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={() => {
          const next = !collapsed;
          setCollapsed(next);
          localStorage.setItem("sidebar-collapsed", String(next));
        }}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className={`min-h-screen transition-all duration-150 pt-14 md:pt-0 ${collapsed ? "md:ml-16" : "md:ml-64"}`}>
        {showGrid && mounted ? (
          <InfiniteGrid
            className="min-h-screen"
            baseOpacity={isDark ? 0.06 : 0.04}
            revealOpacity={isDark ? 0.3 : 0.15}
            revealRadius={isDark ? 350 : 300}
            speedX={isDark ? 0.3 : 0.15}
            speedY={isDark ? 0.2 : 0.1}
          >
            {content}
          </InfiniteGrid>
        ) : (
          content
        )}
      </main>
    </div>
  );
}
