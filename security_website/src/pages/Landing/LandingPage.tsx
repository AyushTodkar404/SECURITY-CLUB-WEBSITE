import { Link } from 'react-router-dom'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import Button from '../../components/ui/Button'
// @ts-expect-error - JSX file without type definitions
import SecurityLogoTrace from '../../assets/icon/SecurityLogoTrace'

function LinkedInIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 10H5.67v8h2.67v-8Zm7.01-.19c-1.28 0-2.14.7-2.49 1.37h-.04V10h-2.56v8h2.67v-3.96c0-1.04.2-2.05 1.49-2.05 1.27 0 1.29 1.19 1.29 2.12V18h2.67v-4.39c0-2.16-.46-3.8-3.03-3.8ZM7 6a1.55 1.55 0 1 0 0 3.1A1.55 1.55 0 0 0 7 6Z" /></svg>
}

function InstagramIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.7" r="1.2" fill="currentColor"/></svg>
}

const startingPoints = [
  { icon: '</>', title: 'Learn by doing', text: 'Begin with guided workshops, friendly labs, and clear explanations—no experience required.' },
  { icon: '⚑', title: 'Find your people', text: 'Meet curious students who want to explore technology, ask questions, and grow together.' },
  { icon: '⌘', title: 'Build real skills', text: 'Practice secure coding, digital safety, CTFs, and defense techniques at your own pace.' },
]

const journey = [
  ['01', 'Start curious', 'Join an open session and see which area of cybersecurity sparks your interest.'],
  ['02', 'Try a lab', 'Learn the fundamentals with a team around you and zero pressure to be an expert.'],
  ['03', 'Grow with us', 'Take on challenges, contribute to events, and become part of the community.'],
]

function LandingPage() {
  return (
    <DraggableWorkspace pageKey="landing">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">Security Club · Welcome terminal</p>
          <p className="terminal-line">$ whoami <span>→ future security builder</span></p>
          <div className="live-status" aria-label="Club status: accepting beginners"><span /> OPEN TO BEGINNERS</div>
          <h1>Curious about cybersecurity? You belong here.</h1>
          <p className="landing-lede">
            Security Club is a welcoming campus community for beginners, builders, and
            problem-solvers. Learn how the digital world works—and how to help protect it.
          </p>
          <div className="actions">
            <Link to="/membership"><Button>Start your journey</Button></Link>
            <Link to="/about"><Button variant="outline">Meet the club</Button></Link>
          </div>
          <p className="landing-reassurance">No prior knowledge. No gatekeeping. Just curiosity.</p>
          <div className="landing-social" aria-label="Follow Security Club DBIT">
            <span>Follow us on</span>
            <a href="https://www.linkedin.com/in/security-club-dbit-801708404/" target="_blank" rel="noreferrer" aria-label="Security Club DBIT on LinkedIn">
              <LinkedInIcon /><span>LinkedIn</span>
            </a>
            <a href="https://www.instagram.com/securityclubdbit" target="_blank" rel="noreferrer" aria-label="Security Club DBIT on Instagram">
              <InstagramIcon /><span>Instagram</span>
            </a>
          </div>
        </div>
        <div className="landing-signal" aria-label="Security Club signal illustration">
          <SecurityLogoTrace size={400} />
        </div>
      </section>

      <section className="landing-intro">
        <p className="eyebrow">A club for first steps</p>
        <h2>You do not need to be a hacker to start.</h2>
        <p>
          Whether you are visiting to understand cybersecurity, looking for a community,
          or ready to explore a new skill, we make the first step simple and practical.
        </p>
      </section>

      <section className="landing-section">
        <div className="landing-stats" aria-label="Club opportunities">
          <div><strong>01</strong><span>community</span></div>
          <div><strong>∞</strong><span>questions welcome</span></div>
          <div><strong>100%</strong><span>hands-on energy</span></div>
        </div>
        <div className="grid three landing-feature-grid">
          {startingPoints.map((point) => (
            <article className="card landing-feature" key={point.title}>
              <span className="feature-icon" aria-hidden="true">{point.icon}</span>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section journey-section">
        <div>
          <p className="eyebrow">Your route in</p>
          <h2>A simple path from visitor to contributor.</h2>
        </div>
        <ol className="journey-list">
          {journey.map(([number, title, text]) => (
            <li key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-cta">
        <p className="eyebrow">Your next safe move</p>
        <h2>Explore, ask, and learn with Security Club.</h2>
        <Link to="/events"><Button>See upcoming events</Button></Link>
      </section>
    </DraggableWorkspace>
  )
}

export default LandingPage
