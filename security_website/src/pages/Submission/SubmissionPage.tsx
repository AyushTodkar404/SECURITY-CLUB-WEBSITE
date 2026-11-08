import { useState, type FormEvent } from 'react'
import { submitContact } from '../../api/client'

export default function SubmissionPage() {
  const [submitted, setSubmitted] = useState(false)
  const [draftUrl, setDraftUrl] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') || '')
    const email = String(form.get('email') || '')
    const phone = String(form.get('phone') || '')
    const year = String(form.get('year') || '')
    const division = String(form.get('division') || '')
    const interests = String(form.get('interests') || '')

    const subject = `Student Interest Submission: ${name} (${year} Div ${division})`
    const body = `Full Name: ${name}
Gmail: ${email}
Phone: ${phone}
Year: ${year}
Division: ${division}
Area of Interest: ${interests}
Sent via Security Club DBIT Website Submission Form`

    // Asynchronously record submission to backend contact messages table
    submitContact({
      name,
      email,
      message: `[Student Interest Submission]\nPhone: ${phone}\nYear: ${year}\nDivision: ${division}\nInterests: ${interests}`,
    }).catch(() => {
      // Backend log attempt; continue to compose URL
    })

    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: 'securityclubdbit@gmail.com',
      su: subject,
      body: body,
    })
    const url = `https://mail.google.com/mail/?${params.toString()}`
    setDraftUrl(url)
    setSubmitted(true)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Student submission</p>
          <h1>Submit your interest in the club.</h1>
          <p className="hero-lede">
            Let us know about your interests, division, and background so we can connect you with
            upcoming workshops, labs, and cohorts.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '780px', margin: '2rem auto' }}>
        <form
          className="contact-panel contact-form submission-form-panel"
          onSubmit={handleSubmit}
        >
          <div className="form-section-header">
            <span className="form-step-num">01</span>
            <div className="form-step-meta">
              <h3>Personal Details</h3>
              <p>Your name and primary contact information.</p>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="submission-name">Full Name <span className="req">*</span></label>
              <input id="submission-name" name="name" placeholder="e.g. Aarav Sharma" required />
            </div>
            <div className="form-field">
              <label htmlFor="submission-email">Gmail Address <span className="req">*</span></label>
              <input id="submission-email" name="email" type="email" placeholder="aarav.sharma@gmail.com" required />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="submission-phone">WhatsApp / Phone Number <span className="req">*</span></label>
            <input id="submission-phone" name="phone" type="tel" placeholder="+91 98201 23456" required />
          </div>

          <div className="form-section-header">
            <span className="form-step-num">02</span>
            <div className="form-step-meta">
              <h3>Academic Details</h3>
              <p>Your current year and division at DBIT.</p>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="submission-year">Year of Study <span className="req">*</span></label>
              <div className="select-wrapper">
                <select id="submission-year" name="year" required defaultValue="">
                  <option value="" disabled>Choose your year</option>
                  <option value="FE">FE (First Year)</option>
                  <option value="SE">SE (Second Year)</option>
                  <option value="TE">TE (Third Year)</option>
                  <option value="BE">BE (Fourth Year)</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="submission-division">Division <span className="req">*</span></label>
              <div className="select-wrapper">
                <select id="submission-division" name="division" required defaultValue="">
                  <option value="" disabled>Choose your division</option>
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                  <option value="C">Division C</option>
                  <option value="Other">Other / not listed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section-header">
            <span className="form-step-num">03</span>
            <div className="form-step-meta">
              <h3>Interests</h3>
              <p>Tell us what topics you want to explore.</p>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="submission-interests">Areas of Interest</label>
            <textarea
              id="submission-interests"
              name="interests"
              rows={3}
              placeholder="e.g. Linux fundamentals, Web application security, Reverse engineering..."
            />
          </div>

          <p className="form-help" style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '1rem 0' }}>
            Submitting opens a verified Gmail draft directed to Security Club DBIT. Review and send it from Gmail.
          </p>

          {submitted && draftUrl && (
            <div className="form-feedback is-success" role="status" style={{ marginBottom: '1rem' }}>
              <strong>Draft ready.</strong> Opening Gmail… If blocked by popup settings,{' '}
              <a href={draftUrl} target="_blank" rel="noopener noreferrer">
                click here to open manually ↗
              </a>
            </div>
          )}

          <button className="button button-primary" type="submit">
            Open Gmail draft &rarr;
          </button>
        </form>
      </div>
    </div>
  )
}

