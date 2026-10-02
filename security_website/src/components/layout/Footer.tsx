import { Link } from 'react-router-dom'

function LinkedInIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 10H5.67v8h2.67v-8Zm7.01-.19c-1.28 0-2.14.7-2.49 1.37h-.04V10h-2.56v8h2.67v-3.96c0-1.04.2-2.05 1.49-2.05 1.27 0 1.29 1.19 1.29 2.12V18h2.67v-4.39c0-2.16-.46-3.8-3.03-3.8ZM7 6a1.55 1.55 0 1 0 0 3.1A1.55 1.55 0 0 0 7 6Z" /></svg>
}

function InstagramIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.7" r="1.2" fill="currentColor"/></svg>
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Security Club</h3>
          <p>Hack. Defend. Secure. Building practical cybersecurity skills at campus scale.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/ctf">CTF</Link></li>
            <li><Link to="/membership">Membership</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:securityclub@college.edu">securityclub@college.edu</a></li>
          </ul>
          <h4 className="footer-follow-heading">Follow us on</h4>
          <div className="footer-social-links">
            <a href="https://www.linkedin.com/in/security-club-dbit-801708404/" target="_blank" rel="noreferrer" aria-label="Security Club DBIT on LinkedIn">
              <LinkedInIcon /><span>LinkedIn</span>
            </a>
            <a href="https://www.instagram.com/securityclubdbit" target="_blank" rel="noreferrer" aria-label="Security Club DBIT on Instagram">
              <InstagramIcon /><span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
