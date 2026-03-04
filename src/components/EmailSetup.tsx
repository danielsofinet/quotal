"use client";

import { useState } from "react";
import { Badge } from "./ui/Badge";

interface EmailSetupProps {
  inboxAddress: string;
}

export default function EmailSetup({ inboxAddress }: EmailSetupProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(inboxAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
          Email Forwarding
        </span>
        <Badge>Beta</Badge>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-sm text-text-muted leading-relaxed">
          Forward any supplier quote email to your unique inbox address and
          we&apos;ll extract it automatically.
        </p>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-bg border border-border rounded-lg px-3 py-2.5 font-mono text-sm text-accent break-all">
            {inboxAddress}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-muted hover:text-text-primary hover:border-border-light transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="space-y-2 text-xs text-text-dim">
          <p className="font-medium text-text-muted">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 leading-relaxed">
            <li>Receive a quote email from a supplier</li>
            <li>Forward the email to your inbox address above</li>
            <li>We extract all attachments and email body text</li>
            <li>AI processes the quote and adds it to your latest project</li>
            <li>You get a confirmation email when it&apos;s ready</li>
          </ol>
        </div>

        <div className="p-3 bg-warning-dim border border-warning/20 rounded-lg">
          <p className="text-xs text-warning leading-relaxed">
            <strong>Note:</strong> This feature requires a Postmark inbound
            webhook configuration. For the MVP, the webhook endpoint is ready at{" "}
            <code className="font-mono">/api/inbound-email</code> and can be
            tested via curl or Postman.
          </p>
        </div>
      </div>
    </div>
  );
}
