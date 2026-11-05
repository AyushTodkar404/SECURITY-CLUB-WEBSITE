import { useState, type FormEvent } from 'react'
import { submitContact } from '../../api/client'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') || '')
    const email = String(form.get('email') || '')
    const message = String(form.get('message') || '')

    setSubmitting(true)
    setError(null)

    try {
      await submitContact({ name, email, message })
      setSubmitted(true)
      e.currentTarget.reset()
    } catch {
      // Fallback: compose mailto/Gmail URL
      const params = new URLSearchParams({
        view: 'cm',
        fs: '1',
        to: 'securityclubdbit@gmail.com',
        su: `Inquiry from ${name}`,
        body: message,
      })
      window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank')
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Reach the club</p>
          <h1>Have a question? Start a conversation.</h1>
          <p className="hero-lede">
            Whether you want to learn more, collaborate on an event or ask a question about
            cybersecurity, we are here.
          </p>
        </div>
      </section>

      <div className="split-content" style={{ marginTop: '2rem' }}>
        <article className="info-panel">
          <p className="eyebrow">Direct Contact</p>
          <h2>Connect with our team</h2>
          <p>
            You can reach us through email, WhatsApp, or drop a message using the desk form.
          </p>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.2rem' }}>Email Desk</p>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=securityclubdbit%40gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', fontWeight: 500 }}
              >
                securityclubdbit@gmail.com ↗
              </a>
            </div>

            <div>
              <p className="eyebrow" style={{ marginBottom: '0.2rem' }}>WhatsApp Coordinator</p>
              <a
                href="https://wa.me/918369448072"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', fontWeight: 500 }}
              >
                +91 83694 48072 ↗
              </a>
            </div>

            <div>
              <p className="eyebrow" style={{ marginBottom: '0.2rem' }}>Campus Venue</p>
              <p style={{ margin: 0, color: 'var(--text)' }}>
                Don Bosco Institute of Technology, Premier Automobiles Road, Kurla West, Mumbai 400070
              </p>
            </div>
          </div>
        </article>

        <form
          className="contact-panel contact-form"
          onSubmit={handleSubmit}
        >
          <div className="form-section-header">
            <span className="form-step-num">✉</span>
            <div className="form-step-meta">
              <h3>Message Desk</h3>
              <p>Send an inquiry directly to the club coordinators.</p>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="contact-name">Your Name <span className="req">*</span></label>
            <input id="contact-name" name="name" required placeholder="Aarav Sharma" />
          </div>

          <div className="form-field">
            <label htmlFor="contact-email">Email Address <span className="req">*</span></label>
            <input id="contact-email" name="email" type="email" required placeholder="name@domain.com" />
          </div>

          <div className="form-field">
            <label htmlFor="contact-message">Message <span className="req">*</span></label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              required
              placeholder="How can we help you? Ask about bootcamps, CTF training, or memberships..."
            />
          </div>

          {submitted && (
            <div className="form-feedback is-success" role="status">
              <strong>Message received!</strong> Thank you for reaching out. A coordinator will get back to you shortly.
            </div>
          )}

          {error && (
            <div className="form-feedback is-error" role="alert" style={{ color: '#ef4444' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            className="button button-primary"
            type="submit"
            disabled={submitting}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {submitting ? 'Sending Message...' : 'Send Message →'}
          </button>
        </form>
      </div>
    </div>
  )
}
