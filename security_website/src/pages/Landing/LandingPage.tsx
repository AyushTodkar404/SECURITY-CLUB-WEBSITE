import { Link } from 'react-router-dom'
import SecurityLogoTrace from '../../assets/icon/SecurityLogoTrace'

const startingPoints = [
  {
    icon: '</>',
    title: 'Learn by doing',
    text: 'Begin with guided workshops, friendly labs, and clear explanations—no experience required.',
  },
  {
    icon: '⚑',
    title: 'Find your people',
    text: 'Meet curious students who want to explore technology, ask questions, and grow together.',
  },
  {
    icon: '⌘',
    title: 'Build real skills',
    text: 'Practice secure coding, digital safety, CTFs, and defense techniques at your own pace.',
  },
]

const journey = [
  ['01', 'Start curious', 'Join an open session and see which area of cybersecurity sparks your interest.'],
  ['02', 'Try a lab', 'Learn the fundamentals with a team around you and zero pressure to be an expert.'],
  ['03', 'Grow with us', 'Take on challenges, contribute to events, and become part of the community.'],
]

export default function LandingPage() {
  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Don Bosco Institute of Technology</p>
          <h1>Curious about cybersecurity? You belong here.</h1>
          <p className="hero-lede">
            Security Club is a welcoming campus community for beginners, builders and problem-solvers.
            Explore cybersecurity through workshops, CTFs, projects and hands-on learning.
          </p>
        </div>
      </section>

      <div className="home-hero-visual" style={{ display: 'grid', placeItems: 'center', margin: '1.5rem 0 2rem' }}>
        <SecurityLogoTrace size={380} />
      </div>

      <div className="home-actions" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', margin: '1rem 0 2.5rem' }}>
        <Link className="button button-primary" to="/events">
          Explore events →
        </Link>
        <Link className="button button-ghost" to="/about">
          Meet the club
        </Link>
      </div>

      <section className="intro" style={{ margin: '3rem 0 1.5rem' }}>
        <p className="eyebrow">A club for first steps</p>
        <h2>You do not need to be a hacker to start.</h2>
        <p>
          We make the first step practical, social and fun. Find your people, try a lab and
          build real skills at your own pace.
        </p>
      </section>

      <section className="opportunities">
        <div className="stat">
          <strong>20+</strong>
          <span>Core mentors and student leads</span>
        </div>
        <div className="stat">
          <strong>30+</strong>
          <span>Hands-on labs and photo archives</span>
        </div>
        <div className="stat">
          <strong>100%</strong>
          <span>Open to all DBIT departments</span>
        </div>
      </section>

      <div className="card-grid" style={{ margin: '2.5rem 0' }}>
        {startingPoints.map((point) => (
          <article className="card" key={point.title}>
            <div className="card-body">
              <span className="feature-icon" style={{ fontSize: '1.4rem', color: 'var(--cyan)' }}>
                {point.icon}
              </span>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </div>
          </article>
        ))}
      </div>

      <section style={{ margin: '3.5rem 0 2rem' }}>
        <div className="section-heading-meta">
          <p className="eyebrow">Your route in</p>
        </div>
        <h2>A simple path from visitor to contributor.</h2>
        <div className="card-grid" style={{ marginTop: '1.5rem' }}>
          {journey.map(([number, title, text]) => (
            <article className="card" key={number}>
              <div className="card-body">
                <span className="form-step-num" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                  {number}
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ margin: '3.5rem 0 1.5rem', padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <p className="eyebrow">Interactive CTF Sandbox</p>
        <h2>Test your security intuition right now.</h2>
        <p style={{ maxWidth: '680px', color: 'var(--muted)', margin: '0.5rem 0 1.5rem' }}>
          Solve introductory web reconnaissance, classical cryptography, and network header challenges designed specifically for DBIT beginners.
        </p>
        <Link className="button button-primary" to="/ctf">
          Launch CTF Arena →
        </Link>
      </section>
    </div>
  )
}
