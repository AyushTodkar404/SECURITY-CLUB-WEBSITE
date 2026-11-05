export default function PrivacyPage() {
  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Code of conduct &amp; disclosure</p>
          <h1>Privacy &amp; Ethics</h1>
          <p className="hero-lede">
            Responsible practice. Student privacy. Transparent guidelines for ethical research and defensive cybersecurity.
          </p>
        </div>
      </section>

      <div className="about-vision-mission" style={{ marginTop: '2rem' }}>
        <section className="info-panel course-panel">
          <p className="eyebrow">Code of Ethics</p>
          <h2>Ethical Hacking &amp; Responsible Disclosure</h2>
          <ul className="mission-list">
            <li>
              All tools, challenge environments, and defensive techniques taught at Security Club DBIT
              must be practiced only on designated authorized sandboxes.
            </li>
            <li>
              Unauthorized access, network scanning, or testing against institutional systems, student
              data, or third-party targets without explicit authorization is strictly prohibited.
            </li>
            <li>
              Any discovered vulnerabilities must be responsibly disclosed directly to the respective
              system owners following industry-standard Coordinated Vulnerability Disclosure (CVD).
            </li>
          </ul>
        </section>

        <section className="info-panel course-panel">
          <p className="eyebrow">Student Privacy</p>
          <h2>Data Protection</h2>
          <p>
            We collect only necessary student identity details for membership administration, event
            registration, and certification verification. Your data is stored locally or in secure
            encrypted database instances, and is never shared, marketed, or sold.
          </p>
        </section>
      </div>
    </div>
  )
}
