import { prisma } from "@/lib/prisma";
import { getUserWithProjects } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AppShell from "@/components/AppShell";
import ProjectCard from "@/components/ProjectCard";
import NewProjectButton from "@/components/NewProjectButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getUserWithProjects();
  const t = await getTranslations("Dashboard");

  if (!user) {
    redirect("/sign-in");
  }

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
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-text-muted text-sm mt-1">{t("subtitle")}</p>
        </div>
        <NewProjectButton />
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto mb-4">
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
          </div>
          <h3 className="font-medium text-text-primary mb-1">
            {t("empty.title")}
          </h3>
          <p className="text-sm text-text-muted">{t("empty.description")}</p>
        </div>
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
