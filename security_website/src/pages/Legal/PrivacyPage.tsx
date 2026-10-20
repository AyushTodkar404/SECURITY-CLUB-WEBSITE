import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'

function PrivacyPage() {
  return (
    <DraggableWorkspace pageKey="privacy">
      <SectionHeader
        eyebrow="Compliance & Trust"
        title="Privacy Policy"
        subtitle="How Security Club DBIT collects, protects, and manages student and member data."
      />

      <div className="card" style={{ maxWidth: '840px', margin: '0 auto', lineHeight: '1.7' }}>
        <h3>1. Information We Collect</h3>
        <p className="muted">
          Security Club collects student identity and contact information strictly for club operations, membership verification, and event registration:
        </p>
        <ul className="plain-list">
          <li><strong>Student Profile:</strong> Full name, student ID, roll number, academic year, branch, and college email address.</li>
          <li><strong>Authentication Credentials:</strong> Securely salted cryptographic hashes of passwords (never plaintext).</li>
          <li><strong>Activity Logs:</strong> CTF challenge submissions, event attendance, and competition leaderboard metrics.</li>
        </ul>

        <h3 style={{ marginTop: '1.5rem' }}>2. How Information Is Used</h3>
        <p className="muted">
          Data collected is used exclusively for legitimate club activities:
        </p>
        <ul className="plain-list">
          <li>Reviewing membership applications and verifying active student status.</li>
          <li>Notifying members of upcoming workshops, bootcamps, and CTF challenges.</li>
          <li>Maintaining academic audit trails and competition scores.</li>
        </ul>

        <h3 style={{ marginTop: '1.5rem' }}>3. Data Protection & Security</h3>
        <p className="muted">
          We implement industry-standard safeguards including HTTP-only secure session cookies, scrypt password hashing, parameter-bound database operations, and restricted role-based administrative access. Data is never sold or shared with external marketing third parties.
        </p>

        <h3 style={{ marginTop: '1.5rem' }}>4. Contact & Inquiries</h3>
        <p className="muted">
          For data access or deletion requests, contact the faculty coordinator or write to us at{' '}
          <a href="mailto:securityclubdbit@gmail.com">securityclubdbit@gmail.com</a>.
        </p>
      </div>
    </DraggableWorkspace>
  )
}

export default PrivacyPage
