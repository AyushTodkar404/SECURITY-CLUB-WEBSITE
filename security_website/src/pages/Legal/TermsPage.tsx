import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'

function TermsPage() {
  return (
    <DraggableWorkspace pageKey="terms">
      <SectionHeader
        eyebrow="Rules & Ethics"
        title="Terms of Service & Code of Conduct"
        subtitle="Operational rules, ethical hacking boundaries, and member responsibilities."
      />

      <div className="card" style={{ maxWidth: '840px', margin: '0 auto', lineHeight: '1.7' }}>
        <h3>1. Acceptance of Terms</h3>
        <p className="muted">
          By accessing the Security Club DBIT platform or registering as a member, you agree to comply with college regulations, applicable IT security laws, and this Code of Conduct.
        </p>

        <h3 style={{ marginTop: '1.5rem' }}>2. Ethical Hacking & Security Rules</h3>
        <p className="muted">
          All offensive security techniques, penetration testing tools, and exploit concepts taught within Security Club workshops and labs are strictly for educational and defensive purposes:
        </p>
        <ul className="plain-list">
          <li><strong>Authorized Targets Only:</strong> Security testing is permitted ONLY within designated sandbox environments, intentionally vulnerable VMs, and authorized CTF challenges.</li>
          <li><strong>Zero Tolerance for Unauthorized Access:</strong> Targeting campus networks, student systems, external infrastructure, or public servers without written permission will result in immediate expulsion and disciplinary action.</li>
          <li><strong>Responsible Disclosure:</strong> Any vulnerabilities discovered during club research must be reported directly to administrators following responsible disclosure practices.</li>
        </ul>

        <h3 style={{ marginTop: '1.5rem' }}>3. Account Integrity</h3>
        <p className="muted">
          Members must maintain confidentiality of their account credentials. Sharing CTF flags, collusion during competitive events, or submitting flags on behalf of other participants is strictly prohibited.
        </p>

        <h3 style={{ marginTop: '1.5rem' }}>4. Amendments</h3>
        <p className="muted">
          Security Club reserves the right to modify these terms in consultation with the faculty coordinator. Continued use of the platform denotes acceptance of any updates.
        </p>
      </div>
    </DraggableWorkspace>
  )
}

export default TermsPage
