import type { FormEvent } from 'react'
import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import Button from '../../components/ui/Button'

function ContactPage() {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    const text = `Hello Security Club DBIT,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`
    const whatsappUrl = `https://wa.me/919819582340?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
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
          <p>Email: <a href="mailto:securityclubdbit@gmail.com">securityclubdbit@gmail.com</a></p>
          <p>WhatsApp: <a href="https://wa.me/919819582340" target="_blank" rel="noreferrer">+91 98195 82340</a></p>
          <p>Location: DBIT Innovation Lab</p>
          <p>Office Hours: Tue and Thu, 4 PM to 6 PM</p>
        </article>

        <form className="card form" onSubmit={submit}>
          <h3>Message us on WhatsApp</h3>
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" autoComplete="name" required maxLength={160} />

          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} />

          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={5} required maxLength={5000} />

          <p className="form-help">WhatsApp will open with your message filled in. Review it and tap Send there.</p>
          <Button type="submit" variant="secondary">Continue in WhatsApp</Button>
        </form>
      </div>
    </DraggableWorkspace>
  )
}

export default ContactPage
