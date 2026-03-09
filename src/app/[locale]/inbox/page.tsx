import { getUserWithProjects } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import InboxClient from "@/components/InboxClient";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function InboxPage() {
  const user = await getUserWithProjects();

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
      inboxCount={user._count.inboxItems}
    >
      <InboxClient
        inboxAddress={user.inboxAddress}
        projects={user.projects.map((p) => ({ id: p.id, name: p.name }))}
      />
    </AppShell>
  );
}
