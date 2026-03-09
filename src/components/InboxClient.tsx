"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import { Modal } from "./ui/Modal";
import { authFetch } from "@/lib/api";

interface InboxItem {
  id: string;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  createdAt: string;
  attachmentCount: number;
}

interface Project {
  id: string;
  name: string;
}

interface InboxClientProps {
  inboxAddress: string;
  projects: Project[];
}

export default function InboxClient({ inboxAddress, projects }: InboxClientProps) {
  const t = useTranslations("InboxPage");
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    authFetch("/api/inbox")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  }

  async function handleAssign(projectId: string) {
    if (selected.size === 0) return;
    setAssigning(true);
    try {
      const res = await authFetch("/api/inbox/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inboxItemIds: Array.from(selected),
          projectId,
        }),
      });
      if (res.ok) {
        setAssignModalOpen(false);
        setSelected(new Set());
        fetchItems();
        router.refresh();
      }
    } finally {
      setAssigning(false);
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("justNow");
    if (mins < 60) return t("minutesAgo", { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("hoursAgo", { count: hours });
    const days = Math.floor(hours / 24);
    return t("daysAgo", { count: days });
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(inboxAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-text-muted text-sm mt-1">{t("subtitle")}</p>
        </div>
      </div>

      {/* Forwarding address */}
      <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-lg border border-border bg-surface">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-dim shrink-0">
          <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M14.5 4.5L8 9L1.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span className="text-sm text-text-muted">{t("forwardHint")}</span>
        <button
          onClick={handleCopyAddress}
          className="font-mono text-sm text-accent hover:text-accent-light transition-colors cursor-pointer"
        >
          {copied ? t("copied") : inboxAddress}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 text-text-dim">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M22 7L12 13L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-base font-medium text-text-muted mb-1">{t("empty")}</p>
          <p className="text-sm text-text-dim max-w-sm mx-auto">{t("emptyDescription")}</p>
        </div>
      ) : (
        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAll}
                className="text-xs text-accent hover:text-accent-light transition-colors cursor-pointer"
              >
                {selected.size === items.length ? t("deselectAll") : t("selectAll")}
              </button>
              <span className="text-xs text-text-dim">
                {t("itemCount", { count: items.length })}
              </span>
            </div>
            {selected.size > 0 && (
              <Button
                size="sm"
                onClick={() => setAssignModalOpen(true)}
              >
                {t("assignToProject", { count: selected.size })}
              </Button>
            )}
          </div>

          {/* Email list */}
          <div className="space-y-1.5">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-100 cursor-pointer ${
                  selected.has(item.id)
                    ? "border-accent/40 bg-accent-dim/40"
                    : "border-border hover:border-border-light hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      selected.has(item.id)
                        ? "bg-accent border-accent"
                        : "border-border-light"
                    }`}
                  >
                    {selected.has(item.id) && (
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8L7 11L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {item.fromName || item.fromEmail}
                      </span>
                      {item.fromName && (
                        <span className="text-xs text-text-dim truncate hidden sm:inline">
                          {item.fromEmail}
                        </span>
                      )}
                      <span className="text-[10px] text-text-dim whitespace-nowrap ml-auto">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted truncate">
                      {item.subject || t("noSubject")}
                    </p>
                    {item.attachmentCount > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-text-dim">
                          <path d="M14.5 7.5L8.46 13.54a3.5 3.5 0 01-4.95-4.95L9.05 3.05a2.333 2.333 0 013.3 3.3L6.81 11.9a1.167 1.167 0 01-1.65-1.65l5.54-5.54" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span className="text-[10px] text-text-dim">
                          {t("attachments", { count: item.attachmentCount })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Assign to project modal */}
      <Modal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={t("assignTitle")}
      >
        <p className="text-sm text-text-muted mb-4">
          {t("assignDescription", { count: selected.size })}
        </p>
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleAssign(project.id)}
              disabled={assigning}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-border hover:border-accent/40 hover:bg-accent-dim/30 transition-all duration-100 cursor-pointer disabled:opacity-50"
            >
              <span className="text-sm font-medium text-text-primary">{project.name}</span>
            </button>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-text-dim text-center py-4">{t("noProjects")}</p>
          )}
        </div>
        {assigning && (
          <div className="flex items-center gap-2 mt-3 text-sm text-accent">
            <Spinner size="sm" />
            <span>{t("assigning")}</span>
          </div>
        )}
      </Modal>
    </div>
  );
}
