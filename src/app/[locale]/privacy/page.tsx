import QuotalLogo from "@/components/QuotalLogo";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-semibold mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-dim mb-12">Last updated: March 8, 2026</p>

        <div className="space-y-10 text-sm leading-relaxed text-text-muted">
          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">1. Introduction</h2>
            <p>
              Quotal (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the quotal.app website and service. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-text-primary">Account information:</strong> When you sign in, we receive your name and email address from your authentication provider (e.g. Google).</li>
              <li><strong className="text-text-primary">Uploaded content:</strong> Documents you upload for quote comparison, including PDFs, spreadsheets, and text content.</li>
              <li><strong className="text-text-primary">Usage data:</strong> Basic analytics such as pages visited and features used, to help us improve the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the quote comparison service.</li>
              <li>To extract and normalize data from your uploaded documents using AI processing.</li>
              <li>To authenticate your identity and maintain your account.</li>
              <li>To communicate with you about the service, including updates and support.</li>
              <li>To improve and develop new features.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">4. Data Processing</h2>
            <p>
              Your uploaded documents are processed using third-party AI services (Anthropic Claude) to extract and normalize quote data. Document content is sent to these services for processing and is not retained by them beyond the duration of the request. We do not use your documents to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">5. Data Storage and Security</h2>
            <p>
              Your data is stored on secure servers provided by our hosting partners (Vercel and Neon). We use encryption in transit (HTTPS) and implement appropriate technical measures to protect your information. Authentication is handled through Firebase Authentication.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">6. Data Sharing</h2>
            <p className="mb-3">We do not sell your personal information. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-text-primary">Service providers:</strong> Third-party services that help us operate (hosting, authentication, AI processing).</li>
              <li><strong className="text-text-primary">Legal requirements:</strong> When required by law or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Export your data in a portable format.</li>
              <li>Withdraw consent and delete your account at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">8. Cookies</h2>
            <p>
              We use a session cookie to keep you signed in. This is a functional cookie required for the service to work. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-3">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy or your data, contact us at{" "}
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
