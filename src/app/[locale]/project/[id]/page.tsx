import { prisma } from "@/lib/prisma";
import { getUserWithProjects } from "@/lib/auth";
import { normalizeProjectItems } from "@/lib/normalization";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AppShell from "@/components/AppShell";
import DropZone from "@/components/DropZone";
import ComparisonTable from "@/components/ComparisonTable";
import QuoteDetail from "@/components/QuoteDetail";
import ProjectActions from "@/components/ProjectActions";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ quote?: string }>;
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { quote: selectedQuoteId } = await searchParams;

  // Parallel fetch: user, project, and translations
  const [user, project, t] = await Promise.all([
    getUserWithProjects(),
    prisma.project.findUnique({
      where: { id },
      include: {
        quotes: {
          include: {
            lineItems: true,
            fees: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    getTranslations("Project"),
  ]);

  if (!user) redirect("/sign-in");
  if (!project || project.userId !== user.id) return notFound();

  const doneQuotes = project.quotes.filter(
    (q) => q.processingStatus === "DONE" && q.lineItems.length > 0
  );
  const needsNormalization = doneQuotes.some((q) =>
    q.lineItems.some((li) => li.canonicalName === null)
  );

  if (needsNormalization && doneQuotes.length >= 2) {
    try {
      await normalizeProjectItems(id);
      const updated = await prisma.quote.findMany({
        where: { projectId: id },
        include: { lineItems: true, fees: true },
        orderBy: { createdAt: "asc" },
      });
      project.quotes = updated;
    } catch (e) {
      console.error("On-demand normalization failed:", e);
    }
  }

  const allProjects = user.projects.map((p) => ({
    id: p.id,
    name: p.name,
    _count: p._count,
  }));

  const selectedQuote = selectedQuoteId
    ? project.quotes.find((q) => q.id === selectedQuoteId)
    : null;

  const pendingCount = project.quotes.filter(
    (q) =>
      q.processingStatus === "PENDING" || q.processingStatus === "PROCESSING"
  ).length;

  return (
    <AppShell
      projects={allProjects}
      userEmail={user.email}
      inboxAddress={user.inboxAddress}
      userPlan={user.plan}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-text-dim mb-1">
          <a
            href="/dashboard"
            className="hover:text-text-muted transition-colors"
          >
            {t("breadcrumb")}
          </a>
          <span>/</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <ProjectActions projectId={id} projectName={project.name} />
        </div>
        <p className="text-text-muted text-sm mt-1">
          {t("quotes", { count: project.quotes.length })}
          {pendingCount > 0 && (
            <span className="text-accent ml-2">
              ({t("processing", { count: pendingCount })})
            </span>
          )}
        </p>
      </div>

      {selectedQuote ? (
        <QuoteDetail
          quote={{
            ...selectedQuote,
            notes: selectedQuote.notes as string[],
            dateReceived: selectedQuote.dateReceived.toISOString(),
            createdAt: selectedQuote.createdAt.toISOString(),
          }}
          projectId={id}
        />
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-dim mb-3">
              {t("uploadSection")}
            </h2>
            <DropZone
              projectId={id}
              quoteCount={project.quotes.length}
              userPlan={user.plan}
              projectEmail={
                project.emailSlug
                  ? `${user.inboxAddress.split("@")[0]}+${project.emailSlug}@in.quotal.app`
                  : undefined
              }
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-dim mb-3">
              {t("comparisonSection")}
            </h2>
            <ComparisonTable
              quotes={project.quotes.map((q) => ({
                ...q,
                notes: q.notes as string[],
                processingStatus: q.processingStatus as string,
              }))}
              projectId={id}
              userPlan={user.plan}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
