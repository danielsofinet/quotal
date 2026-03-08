import { prisma } from "@/lib/prisma";
import { getUserWithProjects } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AppShell from "@/components/AppShell";
import ProjectCard from "@/components/ProjectCard";
import NewProjectButton from "@/components/NewProjectButton";
import EmptyProjects from "@/components/EmptyProjects";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const [user, t] = await Promise.all([
    getUserWithProjects(),
    getTranslations("Dashboard"),
  ]);

  if (!user) {
    redirect("/sign-in");
  }

  // Single query for projects with quote summaries
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { quotes: true } },
      quotes: {
        select: {
          id: true,
          vendorName: true,
          grandTotal: true,
          processingStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        _count: p._count,
      }))}
      userEmail={user.email}
      inboxAddress={user.inboxAddress}
      userPlan={user.plan}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-text-muted text-sm mt-1">{t("subtitle")}</p>
        </div>
        <NewProjectButton projectCount={projects.length} userPlan={user.plan} />
      </div>

      {projects.length === 0 ? (
        <EmptyProjects projectCount={0} userPlan={user.plan} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              quoteCount={project._count.quotes}
              createdAt={project.createdAt.toISOString()}
              quotes={project.quotes.map((q) => ({
                ...q,
                processingStatus: q.processingStatus as string,
              }))}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
