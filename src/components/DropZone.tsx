"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import { authFetch } from "@/lib/api";
import UpgradeModal from "./UpgradeModal";
import { PLAN_LIMITS } from "@/lib/plans";

interface UploadingFile {
  name: string;
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
}

interface DropZoneProps {
  projectId: string;
  quoteCount?: number;
  userPlan?: string;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = ".pdf,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.gif,.webp";

export default function DropZone({ projectId, quoteCount = 0, userPlan = "free" }: DropZoneProps) {
  const t = useTranslations("Upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteLoading, setPasteLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isRendering, startTransition] = useTransition();

  const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  const currentQuoteCount = quoteCount + files.filter((f) => f.status === "done").length;
  const atLimit = currentQuoteCount >= limits.maxQuotesPerProject;

  const uploadFile = useCallback(
    async (file: File) => {
      if (atLimit) {
        setShowUpgrade(true);
        return;
      }

      const fileName = file.name;
      setFiles((prev) => [...prev, { name: fileName, status: "uploading" }]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);

        const res = await authFetch("/api/quotes/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          if (err.error === "PLAN_LIMIT") {
            setFiles((prev) => prev.filter((f) => f.name !== fileName));
            setShowUpgrade(true);
            return;
          }
          throw new Error(err.error || "Upload failed");
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.name === fileName ? { ...f, status: "processing" } : f
          )
        );

        const data = await res.json();

        if (data.processingStatus === "FAILED") {
          throw new Error(data.error || "Processing failed");
        }

        if (data.processingStatus === "DONE") {
          setFiles((prev) =>
            prev.map((f) =>
              f.name === fileName ? { ...f, status: "done" } : f
            )
          );
          startTransition(() => {
            router.refresh();
          });
          return;
        }

        const quoteId = data.id;
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const statusRes = await authFetch(`/api/quotes/${quoteId}`);
          if (statusRes.ok) {
            const quote = await statusRes.json();
            if (quote.processingStatus === "DONE") {
              setFiles((prev) =>
                prev.map((f) =>
                  f.name === fileName ? { ...f, status: "done" } : f
                )
              );
              startTransition(() => {
                router.refresh();
              });
              return;
            }
            if (quote.processingStatus === "FAILED") {
              throw new Error("Processing failed");
            }
          }
        }
        throw new Error("Processing timed out");
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === fileName
              ? {
                  ...f,
                  status: "error",
                  error: err instanceof Error ? err.message : "Unknown error",
                }
              : f
          )
        );
      }
    },
    [projectId, router, atLimit]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(uploadFile);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    selected.forEach(uploadFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePasteSubmit() {
    if (!pasteText.trim()) return;
    if (atLimit) {
      setShowUpgrade(true);
      return;
    }
    setPasteLoading(true);
    try {
      const res = await authFetch("/api/quotes/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText, projectId }),
      });
      if (res.ok) {
        setPasteText("");
        setShowPaste(false);
        startTransition(() => {
          router.refresh();
        });
      }
    } finally {
      setPasteLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-150 ${
          isDragOver
            ? "border-accent bg-accent-dim"
            : "border-border-light hover:border-accent/50 hover:bg-surface"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="mx-auto mb-3 text-text-dim"
        >
          <path
            d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 10L12 15L17 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 15V3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm text-text-muted mb-1">
          <span className="text-accent-light font-medium">{t("clickToUpload")}</span>{" "}
          {t("orDragDrop")}
        </p>
        <p className="text-xs text-text-dim">{t("formats")}</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowPaste(!showPaste)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mr-1.5">
            <rect x="4" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 12H3C2.44772 12 2 11.5523 2 11V3C2 2.44772 2.44772 2 3 2H11C11.5523 2 12 2.44772 12 3V4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {t("pasteText")}
        </Button>
      </div>

      {showPaste && (
        <div className="border border-border rounded-lg p-4 bg-surface animate-slide-up">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={t("pastePlaceholder")}
            rows={8}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none font-mono"
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowPaste(false);
                setPasteText("");
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              loading={pasteLoading}
              disabled={!pasteText.trim()}
              onClick={handlePasteSubmit}
            >
              {t("extractAdd")}
            </Button>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 bg-surface border border-border rounded-lg text-sm"
            >
              {f.status === "uploading" || f.status === "processing" ? (
                <Spinner size="sm" />
              ) : f.status === "done" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-success">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-danger">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              <span className="text-text-primary truncate flex-1">{f.name}</span>
              <span className="text-xs text-text-dim flex items-center gap-1.5">
                {f.status === "uploading"
                  ? t("uploading")
                  : f.status === "processing"
                    ? t("extracting")
                    : f.status === "done"
                      ? t("done")
                      : f.error || "Error"}
                {(f.status === "uploading" || f.status === "processing") && userPlan === "pro" && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-accent-dim text-accent-light animate-pulse-subtle">
                    {t("priority")}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {isRendering && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-accent-dim border border-accent/20 rounded-lg text-sm animate-slide-up">
          <Spinner size="sm" />
          <span className="text-accent-light font-medium">{t("comparing")}</span>
        </div>
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        limitType="quotes"
        max={limits.maxQuotesPerProject}
      />
    </div>
  );
}
