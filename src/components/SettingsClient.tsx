"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { ThemeToggle } from "./ui/theme-toggle";
import { authFetch } from "@/lib/api";
import { signOut } from "@/lib/firebase";

const locales: Record<string, { flag: string; name: string }> = {
  en: { flag: "/flags/gb.svg", name: "English" },
  sv: { flag: "/flags/se.svg", name: "Svenska" },
  de: { flag: "/flags/de.svg", name: "Deutsch" },
  fr: { flag: "/flags/fr.svg", name: "Français" },
  es: { flag: "/flags/es.svg", name: "Español" },
};

interface SettingsClientProps {
  userName: string;
  userEmail: string;
  userPlan: string;
  planExpiresAt: string | null;
  inboxAddress: string;
}

const INBOX_DOMAIN = "@in.quotal.app";

export default function SettingsClient({
  userName,
  userEmail,
  userPlan,
  planExpiresAt,
  inboxAddress,
}: SettingsClientProps) {
  const t = useTranslations("Settings");
  const tp = useTranslations("Landing.pricing");
  const ts = useTranslations("Sidebar");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // Profile state
  const [name, setName] = useState(userName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const nameChanged = name.trim() !== userName;

  // Inbox state
  const currentPrefix = inboxAddress.split("@")[0];
  const [inboxPrefix, setInboxPrefix] = useState(currentPrefix);
  const [inboxSaving, setInboxSaving] = useState(false);
  const [inboxSaved, setInboxSaved] = useState(false);
  const [inboxError, setInboxError] = useState("");
  const [inboxCopied, setInboxCopied] = useState(false);
  const inboxChanged = inboxPrefix.trim() !== currentPrefix;
  const isPro = userPlan === "pro";

  async function handleSaveInbox() {
    if (!inboxChanged || !inboxPrefix.trim()) return;
    setInboxSaving(true);
    setInboxSaved(false);
    setInboxError("");
    try {
      const res = await authFetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inboxPrefix: inboxPrefix.trim().toLowerCase() }),
      });
      if (res.ok) {
        setInboxSaved(true);
        setTimeout(() => setInboxSaved(false), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setInboxError(data.error || t("inbox.error"));
      }
    } catch {
      setInboxError(t("inbox.error"));
    } finally {
      setInboxSaving(false);
    }
  }

  function handleCopyInbox() {
    const address = `${inboxPrefix.trim()}${INBOX_DOMAIN}`;
    navigator.clipboard.writeText(address);
    setInboxCopied(true);
    setTimeout(() => setInboxCopied(false), 2000);
  }

  // Language dropdown state
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Billing toggle state
  const [yearly, setYearly] = useState(false);

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleSaveName() {
    if (!nameChanged || !name.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await authFetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleLocaleChange(newLocale: string) {
    setLangOpen(false);
    router.replace(pathname, { locale: newLocale });
  }

  async function handleBillingAction(interval: "monthly" | "yearly" = "monthly") {
    if (userPlan === "pro") {
      const res = await authFetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } else {
      const res = await authFetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    }
  }

  async function handleDeleteAccount() {
    if (confirmEmail !== userEmail) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await authFetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail }),
      });
      if (res.ok) {
        await signOut();
        router.push("/sign-in");
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Something went wrong");
      }
    } catch {
      setDeleteError("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const currentLocale = locales[locale];
  const freeFeatures = ["f1", "f2", "f3", "f4"] as const;
  const proFeatures = ["f1", "f2", "f3", "f4", "f5"] as const;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          aria-label="Back to dashboard"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>

      <div className="space-y-6">
        {/* Profile + Preferences — side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile */}
          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-base font-semibold mb-4">{t("profile.heading")}</h2>
            <div className="space-y-4">
              <div>
                <Input
                  label={t("profile.name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("profile.namePlaceholder")}
                  maxLength={100}
                />
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant={saved ? "secondary" : "primary"}
                    disabled={!nameChanged || saving}
                    loading={saving}
                    onClick={handleSaveName}
                  >
                    {saved ? t("profile.saved") : t("profile.save")}
                  </Button>
                </div>
              </div>
              <Input
                label={t("profile.email")}
                value={userEmail}
                disabled
              />
            </div>
          </section>

          {/* Preferences */}
          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-base font-semibold mb-4">{t("preferences.heading")}</h2>
            <div className="space-y-5">
              {/* Language dropdown */}
              <div>
                <span className="text-sm font-medium text-text-muted block mb-1.5">{t("preferences.language")}</span>
                <div ref={langRef} className="relative">
                  <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-2.5 w-full h-10 px-3 rounded-lg bg-surface border border-border text-sm text-text-primary transition-colors hover:border-border-light cursor-pointer"
                    aria-expanded={langOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="w-5 h-5 rounded-full overflow-hidden inline-flex shrink-0">
                      <img src={currentLocale?.flag} alt="" className="w-full h-full object-cover" />
                    </span>
                    <span className="flex-1 text-left">{currentLocale?.name}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-text-dim transition-transform duration-150 ${langOpen ? "rotate-180" : ""}`}>
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div
                    role="listbox"
                    aria-label="Select language"
                    className={`absolute left-0 right-0 top-full mt-1 bg-surface border border-border-light rounded-xl shadow-lg shadow-black/20 overflow-hidden z-10 transition-all duration-200 origin-top ${
                      langOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                    }`}
                  >
                    {routing.locales.map((loc) => {
                      const { flag, name: langName } = locales[loc];
                      return (
                        <button
                          key={loc}
                          role="option"
                          aria-selected={loc === locale}
                          onClick={() => handleLocaleChange(loc)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-100 cursor-pointer ${
                            loc === locale
                              ? "bg-accent-dim text-text-primary"
                              : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full overflow-hidden inline-flex shrink-0">
                            <img src={flag} alt="" className="w-full h-full object-cover" />
                          </span>
                          <span>{langName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Theme */}
              <div>
                <span className="text-sm font-medium text-text-muted block mb-1.5">{t("preferences.theme")}</span>
                <ThemeToggle />
              </div>
            </div>
          </section>
        </div>

        {/* Email Inbox */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">{t("inbox.heading")}</h2>
            {!isPro && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-accent-dim text-accent-light">
                Pro
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted mb-4">{t("inbox.description")}</p>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-stretch rounded-lg border border-border overflow-hidden bg-bg">
              <input
                type="text"
                value={inboxPrefix}
                onChange={(e) => {
                  setInboxError("");
                  setInboxPrefix(e.target.value.replace(/[^a-zA-Z0-9._+-]/g, ""));
                }}
                disabled={!isPro}
                maxLength={40}
                className="flex-1 min-w-0 px-3 py-2.5 text-sm text-text-primary bg-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="your-name"
              />
              <span className="inline-flex items-center px-3 text-sm text-text-dim bg-surface border-l border-border select-none whitespace-nowrap">
                {INBOX_DOMAIN}
              </span>
            </div>
            <button
              onClick={handleCopyInbox}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors shrink-0"
              title={t("inbox.copy")}
            >
              {inboxCopied ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="5.5" y="5.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M10.5 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              )}
            </button>
          </div>

          {inboxError && (
            <p className="text-sm text-danger mt-2">{inboxError}</p>
          )}

          {isPro && inboxChanged && (
            <div className="mt-3">
              <Button
                size="sm"
                variant={inboxSaved ? "secondary" : "primary"}
                disabled={!inboxChanged || inboxSaving}
                loading={inboxSaving}
                onClick={handleSaveInbox}
              >
                {inboxSaved ? t("inbox.saved") : t("inbox.save")}
              </Button>
            </div>
          )}

          {!isPro && (
            <p className="text-xs text-text-dim mt-3">
              {t("inbox.upgradeHint")}
            </p>
          )}
        </section>

        {/* Billing — pricing cards */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold">{t("billing.heading")}</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-text-muted mr-2">{t("billing.currentPlan")}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                userPlan === "pro"
                  ? "bg-accent-dim text-accent-light"
                  : "bg-border-light text-text-dim"
              }`}>
                {userPlan === "pro" ? "Pro" : "Free"}
              </span>
            </div>
          </div>

          {userPlan === "pro" && planExpiresAt && (
            <div className="flex items-center justify-between mb-5 text-sm">
              <span className="text-text-muted">{t("billing.nextBilling")}</span>
              <span className="text-text-primary">{new Date(planExpiresAt).toLocaleDateString()}</span>
            </div>
          )}

          {/* Monthly / Yearly toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-bg border border-border">
              <button
                onClick={() => setYearly(false)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
                  !yearly
                    ? "bg-accent text-white"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tp("monthly")}
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
                  yearly
                    ? "bg-accent text-white"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tp("yearly")}
              </button>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free tier */}
            <div className={`p-5 rounded-xl border flex flex-col ${
              userPlan === "free" ? "border-accent/30 bg-accent-dim/30" : "border-border"
            }`}>
              <h3 className="text-base font-semibold text-text-primary mb-1">{tp("free.name")}</h3>
              <p className="text-xs text-text-dim mb-4">{tp("free.subtitle")}</p>
              <div className="mb-4">
                <span className="text-3xl font-semibold text-text-primary font-mono">{tp("free.price")}</span>
              </div>
              <ul className="space-y-2 mb-5 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-muted">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-text-dim shrink-0">
                      <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {tp(`free.features.${f}`)}
                  </li>
                ))}
              </ul>
              {userPlan === "free" && (
                <span className="inline-flex items-center justify-center text-xs font-medium text-text-dim py-2">
                  Current plan
                </span>
              )}
            </div>

            {/* Pro tier */}
            <div className={`p-5 rounded-xl border flex flex-col relative ${
              userPlan === "pro" ? "border-accent/30 bg-accent-dim/30" : "border-border ring-1 ring-accent/20"
            }`}>
              {userPlan !== "pro" && (
                <span className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-semibold uppercase tracking-wider">
                  {tp("pro.popular")}
                </span>
              )}
              <h3 className="text-base font-semibold text-text-primary mb-1">{tp("pro.name")}</h3>
              <p className="text-xs text-text-dim mb-4">{tp("pro.subtitle")}</p>
              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-text-primary font-mono">
                  {yearly ? tp("pro.yearlyPrice") : tp("pro.price")}
                </span>
                <span className="text-text-dim text-sm">
                  {yearly ? tp("pro.yearlyPeriod") : tp("pro.period")}
                </span>
                {yearly && (
                  <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-success-dim text-success text-[10px] font-semibold uppercase tracking-wider">
                    {tp("pro.yearlySavings")}
                  </span>
                )}
              </div>
              <ul className="space-y-2 mb-5 flex-1">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-muted">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-accent-light shrink-0">
                      <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {tp(`pro.features.${f}`)}
                  </li>
                ))}
              </ul>
              {userPlan === "pro" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBillingAction()}
                >
                  {t("billing.manageSub")}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBillingAction(yearly ? "yearly" : "monthly")}
                >
                  {t("billing.upgrade")}
                </Button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-text-dim mt-4">{tp("note")}</p>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-danger/30 bg-surface p-6">
          <h2 className="text-base font-semibold text-danger mb-2">{t("danger.heading")}</h2>
          <p className="text-sm text-text-muted mb-4">{t("danger.deleteDescription")}</p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await signOut();
                router.push("/sign-in");
              }}
            >
              {ts("signOut")}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              {t("danger.deleteAccount")}
            </Button>
          </div>
        </section>
      </div>

      {/* Delete Account Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setConfirmEmail("");
          setDeleteError("");
        }}
        title={t("danger.deleteConfirmTitle")}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">{t("danger.deleteConfirmDescription")}</p>
          <Input
            label={t("danger.emailLabel")}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={t("danger.emailPlaceholder")}
            error={deleteError}
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDeleteOpen(false);
                setConfirmEmail("");
                setDeleteError("");
              }}
            >
              {t("danger.cancel")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={confirmEmail !== userEmail || deleting}
              loading={deleting}
              onClick={handleDeleteAccount}
            >
              {deleting ? t("danger.deleting") : t("danger.confirmDelete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
