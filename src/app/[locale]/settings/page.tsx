import { getUserWithProjects } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await getUserWithProjects();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <AppShell
      projects={user.projects.map((p) => ({
        id: p.id,
        name: p.name,
        _count: p._count,
      }))}
      userEmail={user.email}
      inboxAddress={user.inboxAddress}
      userPlan={user.plan}
      inboxCount={user._count.inboxItems}
    >
      <SettingsClient
        userName={user.name || ""}
        userEmail={user.email}
        userPlan={user.plan}
        planExpiresAt={user.planExpiresAt?.toISOString() || null}
        inboxAddress={user.inboxAddress}
      />
    </AppShell>
  );
}
