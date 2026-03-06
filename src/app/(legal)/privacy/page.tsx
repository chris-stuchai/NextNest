/** Privacy Policy page — GDPR and SOC 2 compliant disclosure. */
export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Privacy Policy</h1>
      <div className="prose prose-neutral max-w-none space-y-6 text-muted-foreground">
        <p className="text-foreground font-medium">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. What We Collect</h2>
          <p>We collect the minimum data needed to provide your relocation plan:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email address (for authentication and notifications)</li>
            <li>Relocation details you provide during intake (origin, destination, move date, preferences)</li>
            <li>Plan interaction data (milestone completions, dashboard visits)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Generate and maintain your personalized relocation plan</li>
            <li>Send you move reminders and milestone notifications</li>
            <li>Improve our product through aggregated, anonymized analytics</li>
          </ul>
          <p>We do <strong className="text-foreground">not</strong> sell, rent, or share your personal data with third parties for marketing purposes.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. AI-Powered Features</h2>
          <p>
            Some features use AI to personalize your experience. When you interact with AI
            features, your intake data is sent to our AI provider (OpenAI) to generate
            personalized advice. This data is not used to train AI models and is processed
            under strict data processing agreements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Data Storage &amp; Security</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Data is stored in encrypted PostgreSQL databases hosted on Railway (SOC 2 Type II compliant infrastructure)</li>
            <li>All connections use TLS/SSL encryption in transit</li>
            <li>Authentication uses cryptographically signed magic links — no passwords are stored</li>
            <li>Access controls enforce that users can only view their own data</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Your Rights (GDPR)</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Access</strong> — Request a copy of all data we hold about you</li>
            <li><strong className="text-foreground">Rectification</strong> — Correct inaccurate data</li>
            <li><strong className="text-foreground">Erasure</strong> — Request deletion of your account and all associated data</li>
            <li><strong className="text-foreground">Portability</strong> — Export your data in a machine-readable format</li>
            <li><strong className="text-foreground">Withdraw consent</strong> — Opt out of non-essential communications at any time</li>
          </ul>
          <p>To exercise these rights, use the account settings in your dashboard or contact us at privacy@nextnest.app.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">6. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. If you delete your account,
            all personal data is permanently removed within 30 days. Anonymized analytics may be
            retained indefinitely.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">7. Cookies</h2>
          <p>
            We use only essential cookies required for authentication and session management.
            We do not use tracking cookies, advertising cookies, or third-party analytics that
            track individuals.
          </p>
        </section>
      </div>
    </div>
  );
}
