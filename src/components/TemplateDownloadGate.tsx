"use client";

import { useState } from "react";

export default function TemplateDownloadGate() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "template-download" }),
      });

      if (!res.ok) throw new Error();

      setStatus("done");

      // Trigger download
      const link = document.createElement("a");
      link.href = "/templates/vendor-quote-comparison-template.xlsx";
      link.download = "vendor-quote-comparison-template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="my-8 p-6 bg-[#0D3B2E] border border-[#00C48C]/30 rounded-xl text-center">
        <div className="text-2xl mb-2">&#10003;</div>
        <p className="text-[#00C48C] font-semibold text-lg mb-1">Downloading now!</p>
        <p className="text-[#8BB8A8] text-sm">
          Didn&apos;t start?{" "}
          <a
            href="/templates/vendor-quote-comparison-template.xlsx"
            download
            className="text-[#00C48C] underline"
          >
            Click here to download
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="my-8 p-6 bg-[#12121A] border border-[#2A2A3E] rounded-xl">
      <p className="text-white font-semibold text-lg mb-1">Download the free template</p>
      <p className="text-[#8888A0] text-sm mb-4">
        Get the Excel template with all formulas ready to use. Enter your email and it&apos;s yours.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="flex-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#5A5A72] focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF]/30"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="bg-[#635BFF] hover:bg-[#7C6CF7] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "loading" ? "..." : "Download"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-[#FF6B6B] text-sm mt-2">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
