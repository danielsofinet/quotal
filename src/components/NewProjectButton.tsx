"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { authFetch } from "@/lib/api";
import UpgradeModal from "./UpgradeModal";
import { PLAN_LIMITS } from "@/lib/plans";

interface NewProjectButtonProps {
  projectCount?: number;
  userPlan?: string;
}

export default function NewProjectButton({
  projectCount = 0,
  userPlan = "free",
}: NewProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const router = useRouter();
  const t = useTranslations("Common");

  const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  const atLimit = projectCount >= limits.maxProjects;

  function handleClick() {
    if (atLimit) {
      setShowUpgrade(true);
    } else {
      setOpen(true);
    }
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.status === 403) {
        const data = await res.json();
        if (data.error === "PLAN_LIMIT") {
          setOpen(false);
          setShowUpgrade(true);
          return;
        }
      }

      if (res.ok) {
        const project = await res.json();
        setOpen(false);
        setName("");
        router.push(`/project/${project.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={handleClick}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="mr-1.5"
        >
          <path
            d="M8 3V13M3 8H13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {t("newProject")}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("newProject")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <Input
            label={t("projectName")}
            placeholder={t("projectPlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-5">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" loading={loading} disabled={!name.trim()}>
              {t("createProject")}
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
