"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { signOut } from "@/lib/firebase";
import LocaleSwitcher from "./LocaleSwitcher";

interface Project {
  id: string;
  name: string;
  _count?: { quotes: number };
}

interface SidebarProps {
  projects: Project[];
  userEmail?: string;
  inboxAddress?: string;
}

export default function Sidebar({
  projects,
  userEmail,
  inboxAddress,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Sidebar");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col transition-all duration-150 z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border justify-between">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="/quotal-logo.svg"
              alt="Quotal"
              className="h-5 invert opacity-90"
            />
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="flex items-center justify-center">
            <img
              src="/quotal-logo.svg"
              alt="Quotal"
              className="h-4 invert opacity-90"
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-surface-hover transition-colors text-text-muted"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform duration-150 ${collapsed ? "rotate-180" : ""}`}
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors mb-1 ${
            pathname === "/dashboard"
              ? "bg-accent-dim text-accent-light"
              : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {!collapsed && <span>{t("dashboard")}</span>}
        </Link>

        {!collapsed && (
          <div className="mt-5">
            <div className="px-2.5 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                {t("projects")}
              </span>
            </div>
            <div className="space-y-0.5">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors group ${
                    pathname === `/project/${project.id}`
                      ? "bg-accent-dim text-accent-light"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <span className="truncate">{project.name}</span>
                  {project._count && (
                    <span className="text-[11px] text-text-dim">
                      {project._count.quotes}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="mt-5">
            <div className="px-2.5 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                {t("emailInbox")}
              </span>
            </div>
            <div className="px-2.5 py-2">
              <p className="text-[11px] text-text-dim leading-relaxed">
                {t("forwardTo")}
              </p>
              {inboxAddress && (
                <button
                  onClick={() => navigator.clipboard.writeText(inboxAddress)}
                  className="mt-1.5 text-[11px] font-mono text-accent break-all text-left hover:text-accent-light transition-colors"
                  title="Click to copy"
                >
                  {inboxAddress}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* User + Locale */}
      <div className="p-3 border-t border-border">
        {!collapsed && (
          <div className="mb-2">
            <LocaleSwitcher className="w-full" />
          </div>
        )}
        <div
          className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-7 h-7 rounded-full bg-border-light flex items-center justify-center shrink-0">
            <span className="text-[11px] font-medium text-text-muted">
              {userEmail?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          {!collapsed && (
            <span className="text-sm text-text-muted truncate flex-1">
              {userEmail}
            </span>
          )}
          {!collapsed && (
            <button
              onClick={async () => {
                await signOut();
                router.push("/sign-in");
              }}
              className="p-1.5 rounded-md text-text-dim hover:text-text-primary hover:bg-surface-hover transition-colors"
              title={t("signOut")}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6M11 11L14 8L11 5M14 8H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
