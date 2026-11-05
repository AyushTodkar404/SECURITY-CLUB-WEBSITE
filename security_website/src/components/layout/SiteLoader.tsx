import { useEffect, useState } from 'react'

export default function SiteLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div id="site-loader" className="site-loader" role="status" aria-label="Loading Security Club DBIT">
      <div className="loader-content">
        <div className="loader-mark-wrap">
          <div className="loader-spin-ring" aria-hidden="true" />
          <img
            className="loader-logo-img"
            src="/assets/security-club-logo-small.png"
            alt="Security Club DBIT Logo"
            width={62}
            height={62}
          />
        </div>
        <div className="loader-meta">
          <h1 className="loader-title">
            Security Club <small>DBIT</small>
          </h1>
          <p className="loader-tagline">Stay connected, stay secure.</p>
        </div>
      </div>
    </div>
  )
}

