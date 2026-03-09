"use client";

import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";
import InfiniteGrid from "./ui/InfiniteGrid";

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
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const showGrid = pathname === "/dashboard";
  const isDark = resolvedTheme === "dark";

  useEffect(() => setMounted(true), []);

  const content = (
    <div className="max-w-[1200px] mx-auto px-8 py-8">
      <PageTransition>{children}</PageTransition>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Sidebar
        projects={projects}
        userEmail={userEmail}
        inboxAddress={inboxAddress}
        userPlan={userPlan}
        inboxCount={inboxCount}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <main className={`min-h-screen transition-all duration-150 ${collapsed ? "ml-16" : "ml-64"}`}>
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
