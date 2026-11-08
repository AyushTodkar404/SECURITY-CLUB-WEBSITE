import { useState, type FormEvent } from 'react'
import { submitMembershipApplication } from '../../api/client'

export default function MembershipPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      const result = await submitMembershipApplication({
        fullName: String(form.get('fullName')),
        studentId: String(form.get('studentId')),
        branch: String(form.get('branch')),
        academicYear: Number(form.get('academicYear')),
        rollNumber: String(form.get('rollNumber')),
        collegeEmail: String(form.get('collegeEmail')),
        personalEmail: String(form.get('personalEmail')) || undefined,
        phone: String(form.get('phone')) || undefined,
        graduationYear: form.get('graduationYear')
          ? Number(form.get('graduationYear'))
          : undefined,
        interestArea: String(form.get('interestArea')),
        motivation: String(form.get('motivation')) || undefined,
      })

      setMessage(
        `Application #${result.id} submitted successfully. The core team will review your details.`
      )
      formElement.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit your application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Join the community</p>
          <h1>Your route from visitor to contributor.</h1>
          <p className="hero-lede">
            We welcome students from every discipline at Don Bosco Institute of Technology. Start by
            submitting your membership application.
          </p>
        </div>
      </section>

      <div className="split-content" style={{ marginTop: '2rem' }}>
        <article className="info-panel">
          <p className="eyebrow">Member Benefits</p>
          <h2>Learn. Build. Defend.</h2>
          <ul className="mission-list" style={{ marginTop: '1rem' }}>
            <li>Hands-on access to guided cybersecurity labs and attack/defense scenarios.</li>
            <li>CTF competition training and private student leaderboard access.</li>
            <li>Industry bootcamps with DSCI, Employment Express, and visiting specialists.</li>
            <li>Direct mentorship from faculty coordinators, senior council, and alumni.</li>
            <li>Annual student membership fee: <strong>INR 100</strong>.</li>
          </ul>
          <p style={{ marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.88rem' }}>
            Please use your official college email (e.g. @dbit.in) so your application can be linked
            directly to your club account.
          </p>
        </article>

        <form
          className="contact-panel contact-form"
          onSubmit={handleSubmit}
        >
          <div className="form-section-header">
            <span className="form-step-num">01</span>
            <div className="form-step-meta">
              <h3>Student Application</h3>
              <p>Enter your institutional and academic details.</p>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="fullName">Full Name <span className="req">*</span></label>
              <input id="fullName" name="fullName" required placeholder="Payal Samant" />
            </div>
            <div className="form-field">
              <label htmlFor="studentId">Student ID <span className="req">*</span></label>
              <input id="studentId" name="studentId" required placeholder="DBIT-2026-CS-042" />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="branch">Branch <span className="req">*</span></label>
              <input id="branch" name="branch" required placeholder="Computer Engineering" />
            </div>
            <div className="form-field">
              <label htmlFor="academicYear">Year of Study <span className="req">*</span></label>
              <div className="select-wrapper">
                <select id="academicYear" name="academicYear" defaultValue="" required>
                  <option value="" disabled>Choose your year</option>
                  <option value="1">First Year (FE)</option>
                  <option value="2">Second Year (SE)</option>
                  <option value="3">Third Year (TE)</option>
                  <option value="4">Fourth Year (BE)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="rollNumber">Roll Number <span className="req">*</span></label>
              <input id="rollNumber" name="rollNumber" required placeholder="42" />
            </div>
            <div className="form-field">
              <label htmlFor="collegeEmail">College Email <span className="req">*</span></label>
              <input id="collegeEmail" name="collegeEmail" type="email" required placeholder="name@dbit.in" />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="personalEmail">Personal Email <span className="muted">(optional)</span></label>
              <input id="personalEmail" name="personalEmail" type="email" placeholder="name@gmail.com" />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone / WhatsApp <span className="muted">(optional)</span></label>
              <input id="phone" name="phone" type="tel" placeholder="+91 98201 23456" />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="interestArea">Primary Interest Area</label>
            <div className="select-wrapper">
              <select id="interestArea" name="interestArea" defaultValue="web-security">
                <option value="web-security">Web Security &amp; Exploitation</option>
                <option value="forensics">Digital Forensics &amp; Incident Response</option>
                <option value="network-security">Network Security &amp; Packet Analysis</option>
                <option value="cryptography">Cryptography &amp; Ciphers</option>
                <option value="digital-safety">Digital Safety &amp; Defensive Tooling</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="motivation">Why would you like to join? <span className="muted">(optional)</span></label>
            <textarea id="motivation" name="motivation" rows={3} placeholder="Tell us what sparks your curiosity in cybersecurity..." />
          </div>

          {message && (
            <div className="form-feedback is-success" role="status">
              <strong>Application Received!</strong> {message}
            </div>
          )}

          {error && (
            <div className="form-feedback is-error" role="alert" style={{ color: '#ef4444' }}>
              <strong>Submission Error:</strong> {error}
            </div>
          )}

          <button
            className="button button-primary"
            type="submit"
            disabled={submitting}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {submitting ? 'Submitting Application...' : 'Submit Application (INR 100) →'}
          </button>
        </form>
      </div>
    </div>
  )
}
