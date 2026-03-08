"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { authFetch } from "@/lib/api";

export default function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("Common");

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await authFetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-md text-text-dim hover:text-danger hover:bg-danger-dim transition-colors"
        title={t("deleteProject")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 4.5H13M5.5 4.5V3.5C5.5 2.94772 5.94772 2.5 6.5 2.5H9.5C10.0523 2.5 10.5 2.94772 10.5 3.5V4.5M6.5 7V11.5M9.5 7V11.5M4.5 4.5L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L11.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("deleteProject")}>
        <p className="text-sm text-text-muted mb-1">
          {t("deleteConfirm", { name: projectName })}
        </p>
        <p className="text-xs text-text-dim mb-5">
          {t("deleteWarning")}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="danger" loading={loading} onClick={handleDelete}>
            {t("deleteProject")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
