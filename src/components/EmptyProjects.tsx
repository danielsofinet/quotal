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

interface EmptyProjectsProps {
  projectCount: number;
  userPlan: string;
}

export default function EmptyProjects({ projectCount, userPlan }: EmptyProjectsProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const router = useRouter();
  const t = useTranslations("Dashboard");
  const tc = useTranslations("Common");

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
      <div className="text-center py-20">
        <button
          onClick={handleClick}
          className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto mb-4 hover:bg-surface-hover hover:border-border-light active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            className="text-text-dim"
          >
            <path
              d="M8 3V13M3 8H13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <h3 className="font-medium text-text-primary mb-1">
          {t("empty.title")}
        </h3>
        <p className="text-sm text-text-muted">{t("empty.description")}</p>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={tc("newProject")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <Input
            label={tc("projectName")}
            placeholder={tc("projectPlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit" loading={loading} disabled={!name.trim()}>
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
