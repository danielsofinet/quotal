import { getUserWithProjects } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AppShell from "@/components/AppShell";
import VendorsClient from "@/components/VendorsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function VendorsPage() {
  const [user, t] = await Promise.all([
    getUserWithProjects(),
    getTranslations("Vendors"),
  ]);

  if (!user) redirect("/sign-in");

  const allProjects = user.projects.map((p) => ({
    id: p.id,
    name: p.name,
    _count: p._count,
  }));

  return (
    <AppShell
      projects={allProjects}
      userEmail={user.email}
      inboxAddress={user.inboxAddress}
      userPlan={user.plan}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-text-muted text-sm mt-1">{t("subtitle")}</p>
      </div>

      <VendorsClient userPlan={user.plan} />
    </AppShell>
  );
}
