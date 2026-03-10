"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { authFetch } from "@/lib/api";
import { PLAN_LIMITS } from "@/lib/plans";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import UpgradeModal from "./UpgradeModal";
import QuotalLogo from "./QuotalLogo";

interface Project {
  id: string;
  name: string;
  _count?: { quotes: number };
}

interface SidebarProps {
  projects: Project[];
  userEmail?: string;
  inboxAddress?: string;
  userPlan?: string;
  inboxCount?: number;
  collapsed: boolean;
  mobileOpen?: boolean;
  onToggleCollapsed: () => void;
  onMobileClose?: () => void;
}

export default function Sidebar({
  projects,
  userEmail,
  inboxAddress,
  userPlan = "free",
  inboxCount: initialInboxCount = 0,
  collapsed,
  mobileOpen = false,
  onToggleCollapsed,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Sidebar");
  const tc = useTranslations("Common");

  // New project state
  const [createOpen, setCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [inboxCopied, setInboxCopied] = useState(false);

  // Live inbox count with polling
  const [liveInboxCount, setLiveInboxCount] = useState(initialInboxCount);
  const [hasNewMail, setHasNewMail] = useState(false);
  const prevCountRef = useRef(initialInboxCount);

  useEffect(() => {
    setLiveInboxCount(initialInboxCount);
    prevCountRef.current = initialInboxCount;
  }, [initialInboxCount]);

  useEffect(() => {
    const poll = () => {
      authFetch("/api/inbox")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const newCount = data.length;
            if (newCount > prevCountRef.current && pathname !== "/inbox") {
              setHasNewMail(true);
            }
            setLiveInboxCount(newCount);
            prevCountRef.current = newCount;
          }
        })
        .catch(() => {});
    };

    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Clear new mail indicator when visiting inbox
  useEffect(() => {
    if (pathname === "/inbox") {
      setHasNewMail(false);
    }
  }, [pathname]);

  const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  const atLimit = projects.length >= limits.maxProjects;

  function handleNewProject() {
    if (atLimit) {
      setShowUpgrade(true);
    } else {
      setCreateOpen(true);
    }
  }

  async function handleCreate() {
    if (!projectName.trim()) return;
    setCreating(true);
    try {
      const res = await authFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      });
      if (res.status === 403) {
        const data = await res.json();
        if (data.error === "PLAN_LIMIT") {
          setCreateOpen(false);
          setShowUpgrade(true);
          return;
        }
      }
      if (res.ok) {
        const project = await res.json();
        setCreateOpen(false);
        setProjectName("");
        router.push(`/project/${project.id}`);
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
  <>
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col transition-all duration-200 z-50 w-64 ${
        collapsed ? "md:w-16" : "md:w-64"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border justify-between">
        {/* Mobile close button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-md hover:bg-surface-hover transition-colors text-text-muted mr-2"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <Link href="/dashboard" className={`flex items-center ${collapsed ? "md:justify-center" : "gap-2"}`}>
          {collapsed ? (
            <svg viewBox="58 68 240 320" fill="currentColor" className="h-5 text-text-primary opacity-90" aria-label="Q">
              <path d="M203.04,305.89c-7.76,1.41-15.76,2.12-23.99,2.12-18.12,0-34.58-3.18-49.4-9.53-14.82-6.35-27.52-14.93-38.11-25.76-10.58-10.82-18.76-23.4-24.52-37.75-5.77-14.35-8.64-29.52-8.64-45.52s2.94-31.63,8.82-46.22c5.88-14.58,14.11-27.46,24.7-38.64,10.58-11.17,23.29-20.05,38.11-26.64,14.82-6.58,31.17-9.88,49.04-9.88,18.82,0,35.64,3.77,50.46,11.29,14.82,7.53,27.4,17.11,37.75,28.76,10.35,11.64,18.29,24.64,23.82,38.99,5.52,14.35,8.29,28.46,8.29,42.34,0,20.23-3.94,38.52-11.82,54.87-7.88,16.35-19,29.81-33.34,40.4l31.05,52.57-49.27,26.34-32.94-57.74ZM179.04,120.65c-9.17,0-17.46,1.89-24.87,5.65-7.41,3.77-13.82,8.82-19.23,15.17-5.41,6.35-9.59,13.71-12.53,22.05-2.94,8.35-4.41,17-4.41,25.93s1.53,17.76,4.59,25.76c3.05,8,7.29,15,12.7,20.99,5.41,6,11.88,10.71,19.41,14.11,7.53,3.41,15.64,5.12,24.35,5.12,9.64,0,18.17-2,25.58-6,7.41-4,13.76-9.11,19.05-15.35,5.29-6.23,9.29-13.29,12-21.17,2.7-7.88,4.06-15.7,4.06-23.46,0-9.64-1.47-18.64-4.41-26.99-2.94-8.35-7.06-15.64-12.35-21.88-5.29-6.23-11.64-11.11-19.05-14.64-7.41-3.53-15.7-5.29-24.88-5.29Z" />
            </svg>
          ) : (
            <QuotalLogo className="h-5 text-text-primary opacity-90" />
          )}
        </Link>
        <button
          onClick={onToggleCollapsed}
          className="hidden md:block p-1.5 rounded-md hover:bg-surface-hover transition-colors text-text-muted"
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

      {/* Plan badge */}
      <div className={`px-3 py-2.5 border-b border-border ${collapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
            userPlan === "pro"
              ? "bg-accent-dim text-accent-light"
              : "bg-border-light text-text-dim"
          }`}>
            {userPlan === "pro" ? "Pro" : "Free"}
          </span>
          {!collapsed && (
            userPlan === "pro" ? (
              <button
                onClick={async () => {
                  const res = await authFetch("/api/billing/portal", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="text-[11px] text-text-dim hover:text-accent-light transition-colors"
              >
                Manage
              </button>
            ) : (
              <button
                onClick={async () => {
                  const res = await authFetch("/api/billing/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ interval: "monthly" }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="text-[11px] text-accent-light hover:text-accent transition-colors font-medium"
              >
                Upgrade
              </button>
            )
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 rounded-lg text-sm transition-colors mb-1 ${
            collapsed ? "justify-center w-8 h-8 mx-auto px-0 py-0" : "px-2.5 py-2"
          } ${
            pathname === "/dashboard"
              ? "bg-accent-dim text-accent-light"
              : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <svg
            width={collapsed ? "14" : "16"}
            height={collapsed ? "14" : "16"}
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {!collapsed && <span className="flex-1">{t("dashboard")}</span>}
        </Link>

        <Link
          href="/inbox"
          className={`flex items-center gap-2.5 rounded-lg text-sm transition-colors mb-1 ${
            collapsed ? "relative justify-center w-8 h-8 mx-auto px-0 py-0" : "px-2.5 py-2"
          } ${
            pathname === "/inbox"
              ? "bg-accent-dim text-accent-light"
              : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <span className="relative shrink-0">
            <svg
              width={collapsed ? "14" : "16"}
              height={collapsed ? "14" : "16"}
              viewBox="0 0 16 16"
              fill="none"
            >
              <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M14.5 4.5L8 9L1.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {hasNewMail && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1">{t("inbox")}</span>
              {liveInboxCount > 0 && (
                <span className="text-[11px] text-text-dim">
                  {liveInboxCount}
                </span>
              )}
            </>
          )}
          {collapsed && liveInboxCount > 0 && (
            <span className="absolute top-0 right-1 text-[9px] font-semibold text-accent-light">
              {liveInboxCount}
            </span>
          )}
        </Link>

        <Link
          href="/vendors"
          className={`flex items-center gap-2.5 rounded-lg text-sm transition-colors mb-1 ${
            collapsed ? "justify-center w-8 h-8 mx-auto px-0 py-0" : "px-2.5 py-2"
          } ${
            pathname === "/vendors"
              ? "bg-accent-dim text-accent-light"
              : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <svg
            width={collapsed ? "14" : "16"}
            height={collapsed ? "14" : "16"}
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <path d="M8 1.5L14.5 5V11L8 14.5L1.5 11V5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 14.5V8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14.5 5L8 8L1.5 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {!collapsed && (
            <span className="flex-1 flex items-center gap-2">
              {t("vendors")}
              {userPlan !== "pro" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-accent-dim text-accent-light">
                  Pro
                </span>
              )}
            </span>
          )}
        </Link>

        {/* Projects section */}
        <div className="mt-5">
          {!collapsed && (
            <div className="px-2.5 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                {t("projects")}
              </span>
              <button
                onClick={handleNewProject}
                className="flex items-center justify-center w-5 h-5 rounded-md bg-accent text-white hover:bg-accent-light transition-colors cursor-pointer"
                aria-label={tc("newProject")}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center mb-2">
              <button
                onClick={handleNewProject}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white hover:bg-accent-light transition-colors cursor-pointer"
                aria-label={tc("newProject")}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
          <div className="space-y-0.5">
            {projects.map((project) => {
              const initials = project.name
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join("");
              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  title={collapsed ? project.name : undefined}
                  className={`flex items-center rounded-lg text-sm transition-colors group ${
                    collapsed ? "justify-center px-0 py-1.5" : "justify-between px-2.5 py-2"
                  } ${
                    pathname === `/project/${project.id}`
                      ? "bg-accent-dim text-accent-light"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  {collapsed ? (
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-semibold ${
                      pathname === `/project/${project.id}`
                        ? "bg-accent-dim text-accent-light"
                        : "bg-border-light text-text-dim"
                    }`}>
                      {initials || "?"}
                    </span>
                  ) : (
                    <>
                      <span className="truncate">{project.name}</span>
                      {project._count && (
                        <span className="text-[11px] text-text-dim">
                          {project._count.quotes}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

      </nav>

      {/* Beta notice */}
      {!collapsed && (
        <div className="mx-3 mb-2 px-3 py-3 rounded-lg bg-accent/[0.06] border border-accent/10">
          <div className="flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-accent-light">
              <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7Zm0 10.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM8.75 8a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 1.5 0v3Z" fill="currentColor"/>
            </svg>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-accent-light leading-tight">{t("betaTitle")}</p>
              <p className="text-[11px] text-text-dim leading-snug mt-0.5">{t("betaMessage")}</p>
              <a
                href="mailto:hello@quotal.app"
                className="inline-block text-[11px] font-medium text-accent-light hover:text-accent transition-colors mt-1.5"
              >
                {t("betaContact")} &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Settings — pinned to bottom */}
      <div className="px-2 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-border">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
            collapsed ? "justify-center" : ""
          } ${
            pathname === "/settings"
              ? "bg-accent-dim text-accent-light"
              : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!collapsed && <span>{t("settings")}</span>}
        </Link>
      </div>
    </aside>

    <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={tc("newProject")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <Input
          label={tc("projectName")}
          placeholder={tc("projectPlaceholder")}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>
            {tc("cancel")}
          </Button>
          <Button type="submit" loading={creating} disabled={!projectName.trim()}>
            {tc("createProject")}
          </Button>
        </div>
      </form>
    </Modal>

    <UpgradeModal
      open={showUpgrade}
      onClose={() => setShowUpgrade(false)}
      limitType="projects"
      max={limits.maxProjects}
    />
  </>
  );
}
