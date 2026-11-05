import { Link } from 'react-router-dom'

export default function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-inner section-shell">
        <div>
          <Link className="brand" to="/" aria-label="Security Club DBIT">
            <img
              src="/assets/security-club-logo-small.png"
              alt="Security Club DBIT logo"
              width="36"
              height="36"
              loading="lazy"
              decoding="async"
            />
            <span>
              Security Club <small>DBIT</small>
            </span>
          </Link>
          <p>
            <strong className="footer-tagline">Stay connected, stay secure.</strong>{' '}
            Building practical cybersecurity skills at campus scale.
          </p>
        </div>

        <div>
          <h3>Contact</h3>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=securityclubdbit%40gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            securityclubdbit@gmail.com
          </a>
          <a href="tel:+918369448072">+91 83694 48072</a>
          <a
            href="https://wa.me/918369448072"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp ↗
          </a>
          <a
            href="https://www.instagram.com/securityclubdbit"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram ↗
          </a>
          <a
            href="https://www.linkedin.com/in/security-club-dbit-801708404/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
        </div>

        <div>
          <h3>Explore</h3>
          <Link to="/events">Events</Link>
          <Link to="/team">Team</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/awareness">Security Awareness</Link>
          <Link to="/membership">Membership</Link>
          <Link to="/privacy">Privacy &amp; Ethics</Link>
        </div>
      </div>

      <p className="copyright">
        &copy; <span>{currentYear}</span> Security Club DBIT. Built by students, for students.
      </p>
      <p className="credits">
        Made by Ayush Todkar - T.E , Computer Engineering &amp; Mohammad Owais Shaikh - B.E , I.T
      </p>
    </footer>
  )
}
