"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "./ui/Badge";

interface EmailSetupProps {
  inboxAddress: string;
}

export default function EmailSetup({ inboxAddress }: EmailSetupProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("Email");

  function handleCopy() {
    navigator.clipboard.writeText(inboxAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
          {t("title")}
        </span>
        <Badge>{t("beta")}</Badge>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-sm text-text-muted leading-relaxed">
          {t("description")}
        </p>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-bg border border-border rounded-lg px-3 py-2.5 font-mono text-sm text-accent break-all">
            {inboxAddress}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-muted hover:text-text-primary hover:border-border-light transition-colors"
          >
            {copied ? t("copied") : t("copy")}
          </button>
        </div>

        <div className="space-y-2 text-xs text-text-dim">
          <p className="font-medium text-text-muted">{t("howItWorks")}</p>
          <ol className="list-decimal list-inside space-y-1 leading-relaxed">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
            <li>{t("step4")}</li>
            <li>{t("step5")}</li>
          </ol>
        </div>

        <div className="p-3 bg-warning-dim border border-warning/20 rounded-lg">
          <p className="text-xs text-warning leading-relaxed">
            <strong>Note:</strong> {t("webhookNote", { endpoint: "/api/inbound-email" })}
          </p>
        </div>
      </div>
    </div>
  );
}
