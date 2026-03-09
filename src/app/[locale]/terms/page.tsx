import QuotalLogo from "@/components/QuotalLogo";

export const metadata = {
  title: "Terms of Service — Quotal",
  description:
    "Terms of Service for Quotal, the AI-powered vendor quote comparison tool for procurement teams.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <a href="/">
            <QuotalLogo className="h-5 w-auto" />
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold mb-2">Terms of Service</h1>
        <p className="text-sm text-text-dim mb-12">Last updated: March 8, 2026</p>

        <div className="space-y-10 text-sm leading-relaxed text-text-muted">
          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using Quotal (&quot;the Service&quot;), operated at quotal.app, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">2. Description of Service</h2>
            <p>
              Quotal is an AI-powered tool that extracts, normalizes, and compares vendor quotes from uploaded documents. The Service processes PDF, Excel, CSV, and text files to generate side-by-side supplier comparisons.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">3. Accounts</h2>
            <p className="mb-3">
              You must create an account to use the Service. You are responsible for maintaining the security of your account credentials. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate and complete registration information.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
              <li>Accept responsibility for all activity that occurs under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Service for any unlawful purpose or to violate any laws.</li>
              <li>Upload malicious files, malware, or content designed to disrupt the Service.</li>
              <li>Attempt to access other users&apos; accounts or data.</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Service.</li>
              <li>Use automated tools to scrape or extract data from the Service beyond normal API usage.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">5. Your Content</h2>
            <p>
              You retain ownership of all documents and data you upload to the Service. By uploading content, you grant us a limited license to process it solely for the purpose of providing the quote comparison service. We do not claim ownership of your content and do not use it to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">6. Subscription and Billing</h2>
            <p className="mb-3">
              The Service offers a free tier and a paid Pro plan. For paid subscriptions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Billing occurs monthly or annually, depending on your selected plan.</li>
              <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.</li>
              <li>We reserve the right to change pricing with 30 days&apos; notice.</li>
              <li>Refunds are handled on a case-by-case basis. Contact us if you have concerns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">7. Service Availability</h2>
            <p>
              We aim to provide reliable, uninterrupted service but do not guarantee 100% uptime. The Service may be temporarily unavailable for maintenance, updates, or circumstances beyond our control. We are not liable for any loss resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">8. Limitation of Liability</h2>
            <p>
              The Service processes documents using AI, which may produce inaccurate results. You are responsible for verifying extracted data before making purchasing decisions. Quotal is provided &quot;as is&quot; without warranties of any kind, express or implied. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">9. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service if you violate these Terms. You may delete your account at any time through the Settings page. Upon termination, your data will be permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms. We will notify you of significant changes by posting a notice on the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the European Union. Any disputes shall be resolved in the competent courts of the jurisdiction where Quotal operates.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">12. Contact</h2>
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:hello@quotal.app" className="text-accent hover:text-accent-light transition-colors">
                hello@quotal.app
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
