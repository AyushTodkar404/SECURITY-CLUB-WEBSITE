import { useState, type FormEvent } from 'react'
import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import Button from '../../components/ui/Button'
import { sendContactMessage } from '../../api/client'

function ContactPage() {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      await sendContactMessage({
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        message: String(formData.get('message') ?? '').trim(),
      })
      setMessage('Your message has been sent to the Security Club. Thank you for reaching out.')
      form.reset()
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to send your message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DraggableWorkspace pageKey="contact">
      <SectionHeader
        eyebrow="Contact"
        title="Get in Touch"
        subtitle="Reach out for collaborations, event invites, or workshop partnerships."
      />

      <div className="grid two">
        <article className="card">
          <h3>Contact Info</h3>
          <p>Email: <a href="mailto:securityclub@college.edu">securityclub@college.edu</a></p>
          <p>Location: DBIT Innovation Lab</p>
          <p>Office Hours: Tue and Thu, 4 PM to 6 PM</p>
        </article>

        <form className="card form" onSubmit={submit}>
          <h3>Contact Form</h3>
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" autoComplete="name" required maxLength={160} />

          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} />

          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={5} required maxLength={5000} />

          {message ? <p className="form-success" role="status">{message}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <Button type="submit" variant="secondary" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</Button>
        </form>
      </div>
    </DraggableWorkspace>
  )
}

export default ContactPage
