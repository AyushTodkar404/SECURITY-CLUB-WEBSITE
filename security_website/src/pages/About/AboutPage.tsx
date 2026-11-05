import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">A club for first steps</p>
          <h1>Learn how the digital world works—and how to protect it.</h1>
          <p className="hero-lede">
            A student-led space to understand technology, question assumptions and practise
            defending the systems we depend on.
          </p>
        </div>
      </section>

      <div className="split-content">
        <article className="info-panel">
          <p className="eyebrow">Our purpose</p>
          <h2>Security is a team sport.</h2>
          <p>
            We believe cybersecurity grows through curiosity, responsible practice and people willing
            to share what they learn.
          </p>
        </article>
        <article className="info-panel">
          <p className="eyebrow">Our principles</p>
          <h2>Learn openly. Build responsibly.</h2>
          <p>
            We create beginner-friendly spaces for secure coding, digital safety, ethical hacking,
            research and defence.
          </p>
        </article>
      </div>

      <div className="about-vision-mission">
        <section className="info-panel course-panel" aria-labelledby="about-vision-heading">
          <p className="eyebrow">Our Vision</p>
          <h2 id="about-vision-heading">A secure and socially responsible digital ecosystem</h2>
          <p>
            To establish a center in the field of security that develops ethically grounded,
            industry-ready professionals who innovate, research, and contribute to building a secure
            and socially responsible digital ecosystem.
          </p>
        </section>

        <section className="info-panel course-panel" aria-labelledby="about-mission-heading">
          <p className="eyebrow">Our Mission</p>
          <h2 id="about-mission-heading">Learn, act ethically, and keep innovating</h2>
          <ul className="mission-list">
            <li>
              To develop industry-ready security professionals through hands-on training, practical
              exposure, and modern tools.
            </li>
            <li>
              To foster ethical practices, digital responsibility, and integrity in the use of
              technology.
            </li>
            <li>
              To promote innovation, research, and continuous learning while preparing students for
              certifications, careers, and real-world challenges.
            </li>
          </ul>
        </section>
      </div>

      <div className="about-coursework">
        <section className="info-panel course-panel" aria-labelledby="course-objectives-heading">
          <p className="eyebrow">Course Objectives</p>
          <h2 id="course-objectives-heading">Key objectives of the Security Club</h2>
          <p>The key objectives of the Security Club are:</p>
          <ol className="course-objectives">
            <li>To provide training in industry-relevant cybersecurity tools, frameworks, and methodologies.</li>
            <li>To enhance students’ preparedness for internships, certifications, and placements in cybersecurity roles.</li>
            <li>To encourage research, innovation, and project-based learning within security domains.</li>
            <li>To promote ethical hacking practices through structured awareness programs and practical sessions.</li>
            <li>To foster responsible digital conduct through interactive workshops and seminars.</li>
          </ol>
        </section>

        <section className="info-panel course-panel" aria-labelledby="course-outcomes-heading">
          <p className="eyebrow">Course Outcomes (COs)</p>
          <h2 id="course-outcomes-heading">Students will be able to:</h2>
          <div className="course-outcomes">
            <article className="course-outcome">
              <h3>CO1</h3>
              <p>Define fundamental digital security concepts, threats, vulnerabilities and ethical principles, and explain industry practices, commonly used cybersecurity tools and methodologies.</p>
            </article>
            <article className="course-outcome">
              <h3>CO2</h3>
              <p>Apply digital security concepts, tools, and methodologies to implement security practices and address cybersecurity challenges through practical hands-on activities and competitions.</p>
            </article>
            <article className="course-outcome">
              <h3>CO3</h3>
              <p>Analyze digital security threats, vulnerabilities, security solutions, and ethical implications to determine appropriate mitigation strategies and evaluate their effectiveness in practical scenarios.</p>
            </article>
            <article className="course-outcome">
              <h3>CO4</h3>
              <p>Create innovative digital security solutions, awareness initiatives, and technical portfolios to address identified security challenges while demonstrating teamwork, effective communication, and responsible digital conduct.</p>
            </article>
          </div>
        </section>
      </div>

      <section style={{ margin: '3rem 0', textAlign: 'center' }}>
        <Link className="button button-primary" to="/membership">
          Become part of the story →
        </Link>
      </section>
    </div>
  )
}
