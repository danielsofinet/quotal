"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { authFetch } from "@/lib/api";

export default function ProjectActions({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(projectName);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("Common");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleRename() {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === projectName) return;
    setRenaming(true);
    try {
      const res = await authFetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setRenameOpen(false);
        router.refresh();
      }
    } finally {
      setRenaming(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await authFetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1.5 rounded-md text-text-dim hover:text-text-muted hover:bg-surface-hover transition-colors"
          aria-label={t("projectActions")}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="3" r="1.25" fill="currentColor" />
            <circle cx="8" cy="8" r="1.25" fill="currentColor" />
            <circle cx="8" cy="13" r="1.25" fill="currentColor" />
          </svg>
        </button>

        {menuOpen && (
          <div
            className="absolute left-0 top-full mt-1 w-44 rounded-lg border border-border bg-surface shadow-lg py-1 z-20 origin-top-left animate-dropdown"
            role="menu"
          >
            <button
              role="menuitem"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-surface-hover transition-colors"
              onClick={() => {
                setMenuOpen(false);
                setNewName(projectName);
                setRenameOpen(true);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M11.5 2.5l2 2M2 14l1-4L11.5 1.5l2 2L5 12l-4 1z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("rename")}
            </button>

            <button
              role="menuitem"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-danger-dim hover:text-danger transition-colors"
              onClick={() => {
                setMenuOpen(false);
                setDeleteOpen(true);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 4.5H13M5.5 4.5V3.5C5.5 2.94772 5.94772 2.5 6.5 2.5H9.5C10.0523 2.5 10.5 2.94772 10.5 3.5V4.5M6.5 7V11.5M9.5 7V11.5M4.5 4.5L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L11.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("deleteProject")}
            </button>
          </div>
        )}
      </div>

      {/* Rename modal */}
      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title={t("renameProject")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRename();
          }}
        >
          <Input
            label={t("projectName")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={100}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="secondary" type="button" onClick={() => setRenameOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              loading={renaming}
              disabled={!newName.trim() || newName.trim() === projectName}
            >
              {t("rename")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t("deleteProject")}>
        <p className="text-sm text-text-muted mb-1">
          {t("deleteConfirm", { name: projectName })}
        </p>
        <p className="text-xs text-text-dim mb-5">
          {t("deleteWarning")}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            {t("deleteProject")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
