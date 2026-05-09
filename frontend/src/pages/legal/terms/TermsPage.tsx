import styles from "./TermsPage.module.css";

export default function TermsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms of Service</h1>
        <div className={styles.meta}>
          <p className={styles.updated}>Effective Date: May 6, 2026</p>
          <p className={styles.updated}>Last updated: May 6, 2026</p>
        </div>
        <div className={styles.section}>
          <h2>1. General Provisions</h2>
          <p>
            1.1. These Terms govern your use of the programming tournament
            platform (the "Platform").
          </p>
          <p>
            1.2. By using the Platform, you agree to these Terms and our Privacy
            and Cookie Policy.
          </p>
          <p>
            1.3. The Platform does not impose strict age restrictions for
            access. However, participants are obligated to refrain from posting
            materials that may be deemed inappropriate, offensive, or infringing
            upon the rights of third parties.
          </p>
        </div>

        <div className={styles.section}>
          <h2>2. Account Ownership and Liability Disclaimer</h2>
          <p>
            <strong>2.1. Account Ownership.</strong> Your account is not your
            property. The Platform grants you a limited, revocable license to
            use the account. We reserve the right to suspend, restrict, or
            terminate any account at our sole discretion, with or without
            notice.
          </p>
          <p>
            <strong>2.2. Data Loss.</strong> The Platform is provided "as is."
            We make no guarantees regarding data integrity, availability, or
            persistence. If the database fails, data is lost, or your account
            becomes inaccessible for any reason, the Platform and its operators{" "}
            <strong>shall not be held liable</strong>. You are solely
            responsible for maintaining backups of any content you submit.
          </p>
          <p>
            <strong>2.3. No Warranty.</strong> The Platform is provided without
            warranties of any kind, express or implied, including but not
            limited to warranties of merchantability, fitness for a particular
            purpose, or non-infringement.
          </p>
        </div>

        <div className={styles.section}>
          <h2>3. User Roles and Accounts</h2>
          <p>
            <strong>3.1. User Types:</strong>
          </p>
          <p>
            <strong>Administrator/Organizer</strong> — creates and manages
            tournaments, rounds, tasks, and assigns works to jury.
          </p>
          <p>
            <strong>Team (Participant)</strong> — registers a team and submits
            solutions within tournaments.
          </p>
          <p>
            <strong>Jury</strong> — evaluates works according to established
            criteria.
          </p>
          <p>
            <strong>3.2. Registration:</strong> You agree to provide accurate
            and current information. Multiple accounts or duplicate
            registrations (same captain or email set) are prohibited. You are
            responsible for maintaining the confidentiality of your credentials.
          </p>
        </div>

        <div className={styles.section}>
          <h2>4. Tournament Rules</h2>
          <p>
            <strong>4.1. Team Registration:</strong> Available only within the
            time window set by the administrator. Minimum team size: 2 members
            (unless otherwise specified). After registration closes, team roster
            changes are prohibited unless approved by an administrator.
          </p>
          <p>
            <strong>4.2. Submissions:</strong> Teams must provide a GitHub
            repository link and a video demonstration. Editing submissions is
            allowed until the round deadline. After the deadline, submissions
            are locked (SubmissionClosed status). Teams are responsible for the
            functionality of provided links.
          </p>
          <p>
            <strong>4.3. Evaluation:</strong> Jury evaluates works objectively
            per administrator-defined criteria. Each work is evaluated by at
            least the minimum number of jury members set by the administrator.
            Evaluating your own work or your team's work is strictly prohibited.
          </p>
        </div>

        <div className={styles.section}>
          <h2>5. Intellectual Property</h2>
          <p>
            <strong>5.1. Platform Content:</strong> Design, code, logos, and
            Platform structure belong to its owners. Copying, modifying, or
            distributing without permission is prohibited.
          </p>
          <p>
            <strong>5.2. User Content:</strong> Submissions (code, videos,
            descriptions) remain team property. By submitting, you grant the
            Platform a license to store, display to jury, and publish results.
            The administrator may include submissions in the archive of
            completed tournaments.
          </p>
        </div>

        <div className={styles.section}>
          <h2>6. Content Moderation and User Responsibility</h2>
          <p>
            <strong>6.1. User-Generated Content.</strong> All content uploaded,
            posted, or shared by users (including submissions, comments, team
            descriptions, and links) is the <strong>sole responsibility</strong>{" "}
            of the user who posted it. The Platform acts as a passive
            intermediary and does not pre-screen all user content.
          </p>
          <p>
            <strong>6.2. Moderation Efforts.</strong> The administration strives
            to maintain a safe environment and applies software tools for
            filtering and moderating uploaded content (including profanity
            filters). However, the existence of such tools
            <strong> does not relieve the user of responsibility</strong> for
            the content of their materials and their compliance with ethical
            norms and applicable law.
          </p>
          <p>
            <strong>6.3. No Endorsement or Guarantee.</strong> The organizer
            does not guarantee the accuracy, completeness, or safety of content
            posted by other participants, and
            <strong> shall not be liable for any consequences</strong> arising
            from its use. The Platform does not endorse, verify, or assume
            responsibility for any user-generated content, including code
            repositories, video demonstrations, or external links.
          </p>
        </div>

        <div className={styles.section}>
          <h2>7. Prohibited Conduct</h2>
          <p>
            Hacking, unauthorized access attempts, DDoS attacks, plagiarism,
            presenting others' work as your own, score manipulation, jury
            bribery, distribution of malware through submissions,
            discrimination, harassment, abuse of other participants, automated
            data collection (scraping) without permission, and posting content
            that is illegal, defamatory, obscene, or infringing on third-party
            rights.
          </p>
        </div>

        <div className={styles.section}>
          <h2>8. Enforcement and Sanctions</h2>
          <p>
            The administrator may disqualify teams for violations. In cases of
            fraud, results may be annulled. Accounts may be suspended for
            serious violations. Administrator decisions regarding specific
            tournaments are final.
          </p>
        </div>

        <div className={styles.section}>
          <h2>9. Termination and Changes</h2>
          <p>
            We may modify these Terms with user notification. You may delete
            your account at any time. We reserve the right to suspend or
            discontinue the Platform with notice.
          </p>
        </div>

        <div className={styles.section}>
          <h2>10. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of <strong>Ukraine</strong>.
            Disputes shall be resolved through negotiation; if impossible, in
            the competent courts of Ukraine.
          </p>
        </div>

        <div className={styles.section}>
          <h2>11. Contact Information</h2>
          <p>
            For any questions: <strong>obriy168@gmail.com</strong>
          </p>
        </div>
      </div>
    </section>
  );
}