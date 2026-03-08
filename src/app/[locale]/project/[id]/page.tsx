import { prisma } from "@/lib/prisma";
import { getUserWithProjects } from "@/lib/auth";
import { normalizeProjectItems } from "@/lib/normalization";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AppShell from "@/components/AppShell";
import DropZone from "@/components/DropZone";
import ComparisonTable from "@/components/ComparisonTable";
import QuoteDetail from "@/components/QuoteDetail";
import DeleteProjectButton from "@/components/DeleteProjectButton";

export const dynamic = "force-dynamic";

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
  const t = await getTranslations("Project");

  const user = await getUserWithProjects();
  if (!user) redirect("/sign-in");

  const project = await prisma.project.findUnique({
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
  });

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
    _count: { quotes: 0 },
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
          <DeleteProjectButton projectId={id} projectName={project.name} />
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
            <DropZone projectId={id} />
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
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
