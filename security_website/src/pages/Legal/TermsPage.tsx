export default function TermsPage() {
  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Institutional Guidelines</p>
          <h1>Terms of Service</h1>
          <p className="hero-lede">
            By participating in Security Club activities, you agree to uphold academic integrity and ethical technical standards.
          </p>
        </div>
      </section>

      <div className="split-content" style={{ marginTop: '2rem' }}>
        <article className="info-panel">
          <p className="eyebrow">Participation</p>
          <h2>Club Standards</h2>
          <p>
            Membership is open to active students of Don Bosco Institute of Technology. Members are expected
            to attend scheduled labs, support fellow beginners, and conduct themselves respectfully in all
            workshops, competitions, and online channels.
          </p>
        </article>

        <article className="info-panel">
          <p className="eyebrow">Accountability</p>
          <h2>Disciplinary Policy</h2>
          <p>
            Violations of college network policies or malicious exploitation of technical knowledge
            results in immediate expulsion from the club and referral to departmental academic authorities.
          </p>
        </article>
      </div>
    </div>
  )
}
