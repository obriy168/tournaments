import styles from "./PrivacyCookiePage.module.css";

export default function PrivacyCookiePage() {
  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy and Cookie Policy</h1>
        <div className={styles.meta}>
          <p className={styles.updated}>Effective Date: May 6, 2026</p>
          <p className={styles.updated}>Last updated: May 6, 2026</p>
        </div>
        <div className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            This Privacy and Cookie Policy describes how our programming
            tournament platform (the "Platform") collects, uses, stores, and
            protects personal data of users: team participants, jury members,
            administrators, and organizers. It also explains how we use cookies
            and similar technologies.
          </p>
        </div>

        <div className={styles.section}>
          <h2>2. Information We Collect</h2>
          <p>
            <strong>Information You Provide:</strong> Full name, email address,
            team name and member list, city/school/organization (optional),
            contact info (Telegram, Discord), GitHub repository links, video
            demos, live demo links, scores, comments, and feedback.
          </p>
          <p>
            <strong>Automatically Collected:</strong> IP address, browser type,
            operating system, visit timestamps, actions on the platform,
            cookies.
          </p>
        </div>

        <div className={styles.section}>
          <h2>3. How We Use Your Information</h2>
          <p>
            We use your data to operate the platform, manage tournaments and
            rounds, generate leaderboards, send notifications about deadlines
            and statuses, enforce security, prevent fraud, and improve our
            services.
          </p>
        </div>

        <div className={styles.section}>
          <h2>4. Legal Basis</h2>
          <p>
            Data processing is based on your consent (provided during
            registration), contractual necessity (tournament participation), and
            legitimate interests (security, analytics).
          </p>
        </div>

        <div className={styles.section}>
          <h2>5. Data Sharing</h2>
          <p>
            We do not sell personal data. We may share it with tournament
            organizers, jury members (for evaluation), technical service
            providers (hosting, email, analytics), and competent authorities as
            required by Ukrainian law.
          </p>
        </div>

        <div className={styles.section}>
          <h2>6. Data Retention</h2>
          <p>
            Data is retained as long as necessary for the purposes outlined
            herein. Accounts may be deleted upon request, except where we are
            legally obligated to retain them. Tournament submissions and results
            may be preserved in archives without linkage to personal data.
          </p>
        </div>

        <div className={styles.section}>
          <h2>7. Your Rights</h2>
          <p>
            You have the right to access, correct, delete, or export your
            personal data; restrict or object to processing; and withdraw
            consent. Contact us at obriy168@gmail.com to exercise these rights.
          </p>
        </div>

        <div className={styles.section}>
          <h2>8. Security</h2>
          <p>
            We implement encryption, access controls, regular backups, and
            threat monitoring to protect your data.
          </p>
        </div>

        <div className={styles.section}>
          <h2>9. International Transfers</h2>
          <p>
            When using cloud services, data may be processed outside Ukraine. We
            ensure adequate protection through standard contractual clauses.
          </p>
        </div>

        <div className={styles.section}>
          <h2>10. Cookies</h2>
          <p>
            We use cookies and similar technologies to maintain your session,
            remember your preferences, and understand how you interact with our
            platform.
          </p>
        </div>

        <div className={styles.section}>
          <h2>11. Types of Cookies We Use</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Purpose</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Strictly Necessary</td>
                <td>Essential platform functionality</td>
                <td>Authentication, sessions, CSRF tokens, tournament state</td>
              </tr>
              <tr>
                <td>Functional</td>
                <td>Enhanced user experience</td>
                <td>Language preferences, display settings</td>
              </tr>
              <tr>
                <td>Analytics</td>
                <td>Understanding platform usage</td>
                <td>Google Analytics, internal analytics (anonymized)</td>
              </tr>
              <tr>
                <td>Preferences</td>
                <td>Remembering your choices</td>
                <td>Cookie consent, tournament filters</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.section}>
          <h2>12. Managing Cookies</h2>
          <p>
            A consent banner is displayed on your first visit (except for
            strictly necessary cookies). You may accept all, reject
            non-essential, or customize your choices. Settings can be changed at
            any time via your browser settings or through the cookie settings
            link in the footer.
          </p>
        </div>

        <div className={styles.section}>
          <h2>13. Third-Party Cookies</h2>
          <p>
            We may use third-party services (e.g., for video hosting,
            analytics). These services may set their own cookies in accordance
            with their policies.
          </p>
        </div>

        <div className={styles.section}>
          <h2>14. Cookie Retention</h2>
          <p>
            Session cookies are deleted when you close your browser. Persistent
            cookies remain from several days up to 1 year depending on their
            purpose.
          </p>
        </div>

        <div className={styles.section}>
          <h2>15. Changes</h2>
          <p>
            We may update this Policy at any time. Changes are posted on this
            page with a revised effective date. Continued use constitutes
            acceptance.
          </p>
        </div>

        <div className={styles.section}>
          <h2>16. Contact</h2>
          <p>
            For any questions: <strong>obriy168@gmail.com</strong>
          </p>
        </div>
      </div>
    </section>
  );
}