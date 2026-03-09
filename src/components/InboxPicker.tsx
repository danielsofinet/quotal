"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import { authFetch } from "@/lib/api";

interface InboxItem {
  id: string;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  createdAt: string;
  attachmentCount: number;
}

interface InboxPickerProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export default function InboxPicker({ open, onClose, projectId }: InboxPickerProps) {
  const t = useTranslations("Inbox");
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected(new Set());
    authFetch("/api/inbox")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

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

  async function handleAssign() {
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
        onClose();
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

  return (
    <Modal open={open} onClose={onClose} title={t("modalTitle")}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 text-text-dim">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M22 7L12 13L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium text-text-muted mb-1">{t("empty")}</p>
          <p className="text-xs text-text-dim">{t("emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
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

          <div className="max-h-72 overflow-y-auto -mx-1 px-1 space-y-1.5">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-100 cursor-pointer ${
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
                      <span className="text-[10px] text-text-dim whitespace-nowrap">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate">
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

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" size="sm" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              disabled={selected.size === 0 || assigning}
              loading={assigning}
              onClick={handleAssign}
            >
              {assigning
                ? t("adding")
                : t("addToProject", { count: selected.size })}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
