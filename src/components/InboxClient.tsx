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
  textBody: string | null;
  createdAt: string;
  attachmentCount: number;
  attachmentNames: string[];
  assignedToProjectId: string | null;
  assignedToProject: string | null;
  assignedAt: string | null;
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
  const [expanded, setExpanded] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

  function toggleItem(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
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
        setExpanded(null);
        fetchItems();
        router.refresh();
      }
    } finally {
      setAssigning(false);
    }
  }

  async function handleDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      const res = await authFetch("/api/inbox", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setDeleteConfirmOpen(false);
        setSelected(new Set());
        setExpanded(null);
        fetchItems();
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteSingle(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const res = await authFetch("/api/inbox", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    if (res.ok) {
      if (expanded === id) setExpanded(null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchItems();
      router.refresh();
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
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  {t("delete", { count: selected.size })}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAssignModalOpen(true)}
                >
                  {t("assignToProject", { count: selected.size })}
                </Button>
              </div>
            )}
          </div>

          {/* Email list */}
          <div className="space-y-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border transition-all duration-150 ${
                  selected.has(item.id)
                    ? "border-accent/40 bg-accent-dim/40"
                    : "border-border hover:border-border-light hover:bg-surface-hover"
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                >
                  <div
                    onClick={(e) => toggleItem(item.id, e)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      selected.has(item.id)
                        ? "bg-accent border-accent"
                        : "border-border-light hover:border-text-dim"
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-text-muted truncate">
                        {item.subject || t("noSubject")}
                      </p>
                      {item.assignedToProject && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-success/15 text-success">
                          <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                            <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {item.assignedToProject}
                        </span>
                      )}
                    </div>
                    {!expanded || expanded !== item.id ? (
                      <>
                        {item.textBody && (
                          <p className="text-xs text-text-dim mt-1 truncate">
                            {item.textBody.slice(0, 120)}
                          </p>
                        )}
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
                      </>
                    ) : null}
                  </div>
                  {/* Expand indicator */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`shrink-0 mt-1 text-text-dim transition-transform duration-150 ${
                      expanded === item.id ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Expanded content */}
                {expanded === item.id && (
                  <div className="px-4 pb-4 pt-0 ml-7 border-t border-border/50 mt-0">
                    <div className="pt-3 space-y-3">
                      {/* From / Subject details */}
                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                        <span className="text-text-dim">{t("from")}:</span>
                        <span className="text-text-muted">
                          {item.fromName ? `${item.fromName} <${item.fromEmail}>` : item.fromEmail}
                        </span>
                        <span className="text-text-dim">{t("subjectLabel")}:</span>
                        <span className="text-text-muted">{item.subject || t("noSubject")}</span>
                        <span className="text-text-dim">{t("received")}:</span>
                        <span className="text-text-muted">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Attachments list */}
                      {item.attachmentNames.length > 0 && (
                        <div>
                          <span className="text-xs text-text-dim block mb-1.5">{t("attachments", { count: item.attachmentCount })}:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.attachmentNames.map((name, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-muted"
                              >
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-text-dim shrink-0">
                                  <path d="M14.5 7.5L8.46 13.54a3.5 3.5 0 01-4.95-4.95L9.05 3.05a2.333 2.333 0 013.3 3.3L6.81 11.9a1.167 1.167 0 01-1.65-1.65l5.54-5.54" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Email body */}
                      {item.textBody && (
                        <div className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed bg-bg/50 rounded-lg p-3 max-h-64 overflow-y-auto border border-border/50">
                          {item.textBody}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        {item.assignedToProject ? (
                          <span className="text-xs text-success">
                            {t("usedIn", { project: item.assignedToProject })}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(new Set([item.id]));
                              setAssignModalOpen(true);
                            }}
                            className="text-xs font-medium text-accent hover:text-accent-light transition-colors cursor-pointer"
                          >
                            {t("assignSingle")}
                          </button>
                        )}
                        <span className="text-border">|</span>
                        <button
                          onClick={(e) => handleDeleteSingle(item.id, e)}
                          className="text-xs font-medium text-danger hover:text-danger/80 transition-colors cursor-pointer"
                        >
                          {t("deleteSingle")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Delete confirmation modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("deleteTitle")}
      >
        <p className="text-sm text-text-muted mb-5">
          {t("deleteDescription", { count: selected.size })}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            {t("confirmDelete", { count: selected.size })}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
