import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { AuthSession } from '../../types'

interface SiteHeaderProps {
  session: AuthSession | null
  matrixActive: boolean
  onToggleMatrix: () => void
  onLogout: () => void
}

export default function SiteHeader({
  session,
  matrixActive,
  onToggleMatrix,
  onLogout,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  const navLinks = [
    { path: '/', label: 'Welcome' },
    { path: '/about', label: 'About Us' },
    { path: '/awareness', label: 'Security Awareness' },
    { path: '/events', label: 'Events' },
    { path: '/flagships', label: 'Flagships' },
    { path: '/team', label: 'Team' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/membership', label: 'Membership' },
    { path: '/submission', label: 'Submission' },
    { path: '/contact', label: 'Contact' },
    { path: '/ctf', label: 'CTF' },
  ]

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Security Club home" onClick={closeMenu}>
        <img
          src="/assets/security-club-logo-small.png"
          alt="Security Club DBIT logo"
          width="42"
          height="42"
          fetchPriority="high"
          decoding="async"
        />
        <span>
          Security Club <small>DBIT</small>
          <span className="brand-tagline">Stay connected, stay secure.</span>
        </span>
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={mobileMenuOpen}
        aria-controls="site-navigation"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span />
        <span />
        <span />
        <span className="sr-only">Toggle navigation</span>
      </button>

      <nav
        id="site-navigation"
        className={`site-nav ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-label="Main navigation"
      >
        {navLinks.map((link) => {
          const isActive =
            link.path === '/'
              ? currentPath === '/'
              : currentPath.startsWith(link.path)
          return (
            <Link
              key={link.path}
              to={link.path}
              className={isActive ? 'active' : ''}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          )
        })}

        {session?.authenticated ? (
          <>
            <Link
              to="/dashboard"
              className={currentPath.startsWith('/dashboard') ? 'is-active' : ''}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
            {session.role === 'admin' ? (
              <Link
                to="/admin"
                className={currentPath.startsWith('/admin') ? 'is-active' : ''}
                onClick={closeMenu}
              >
                Admin
              </Link>
            ) : null}
            <button
              type="button"
              className="nav-logout-btn"
              onClick={() => {
                closeMenu()
                onLogout()
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                font: 'inherit',
                cursor: 'pointer',
                padding: '0 0.5rem',
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className={currentPath.startsWith('/auth') ? 'is-active' : ''}
            onClick={closeMenu}
          >
            Sign in
          </Link>
        )}
      </nav>

      <div className="header-actions">
        <button
          id="matrix-toggle"
          className="hud-toggle-btn"
          type="button"
          aria-pressed={matrixActive}
          title="Toggle flowing matrix background"
          onClick={onToggleMatrix}
        >
          <span className="hud-toggle-led" aria-hidden="true" />
          <span className="hud-toggle-text">
            {matrixActive ? 'STREAM: ON' : 'STREAM: OFF'}
          </span>
        </button>

        <div className="social-links" aria-label="Social media links">
          <a
            href="https://www.linkedin.com/in/security-club-dbit-801708404/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
              <path
                fill="currentColor"
                d="M5.2 3.5a2.2 2.2 0 1 1-.1 4.4 2.2 2.2 0 0 1 .1-4.4ZM3.3 9.5h3.8v11.2H3.3zM9.2 9.5h3.6V11h.1a4 4 0 0 1 3.6-2c3.9 0 4.6 2.5 4.6 5.7v6h-3.8v-5.3c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.4H9.2z"
              />
            </svg>
          </a>
          <a
            href="https://wa.me/918369448072"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
              <path
                fill="currentColor"
                d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.5 23.2l5.7-1.5a11.8 11.8 0 0 0 14.3-18.2ZM12 21a9.7 9.7 0 0 1-5-1.4l-.4-.2-3.4.9.9-3.3-.2-.4A9.8 9.8 0 1 1 12 21Zm5.4-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6s0-.4 0-.5c-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1.1 1.1-1.1 2.6 1.2 3 1.3 3.2c.2.2 2.3 3.5 5.6 4.9.8.3 1.4.5 1.8.6.8.3 1.5.2 2 .1.6-.1 1.8-.7 2.1-1.4.2-.7.2-1.3.2-1.4s-.2-.2-.5-.4Z"
              />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/securityclubdbit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            title="Instagram"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
              <path
                fill="currentColor"
                d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.3-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"
              />
            </svg>
          </a>
          <a
            href="https://github.com/AyushTodkar404/STATIC-VERSION-SECURITY-CLUB-WEBSITE"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
              <path
                fill="currentColor"
                d="M12 .8a11.2 11.2 0 0 0-3.5 21.8c.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.5-.3-5.2-1.3-5.2-5.6 0-1.2.4-2.2 1.2-3-.1-.3-.5-1.5.1-3 0 0 1-.3 3.1 1.2a10.8 10.8 0 0 1 5.6 0c2.1-1.5 3.1-1.2 3.1-1.2.6 1.5.2 2.7.1 3 .8.8 1.2 1.8 1.2 3 0 4.3-2.6 5.3-5.2 5.6.4.3.8 1 .8 2v3c0 .3.2.7.8.6A11.2 11.2 0 0 0 12 .8Z"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}

