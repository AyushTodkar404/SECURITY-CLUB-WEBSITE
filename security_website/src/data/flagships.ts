export interface Flagship {
  id: number
  title: string
  meta?: string
  cycle?: string
  format?: string
  description: string
  pillars?: string[]
  badge?: string
  status?: string
  image?: string
  year?: string
}

export const flagships: Flagship[] = [
  {
    "id": 1,
    "title": "Cyber Siege",
    "meta": "Flagship · Annual Summit",
    "cycle": "2026-27 Edition",
    "format": "Inter-College Red vs Blue Tournament",
    "description": "Our premier annual inter-college cybersecurity competition bringing together offensive and defensive student teams to solve real-world scenario challenges in a live sandbox environment.",
    "pillars": [
      "Red Team Exploitation",
      "Blue Team Incident Defense",
      "Network Forensics",
      "Live Attack Feeds"
    ],
    "badge": "siege",
    "status": "Upcoming · Annual Summit",
    "image": "/flagships/siege.png",
    "year": "2026-27"
  },
  {
    "id": 2,
    "title": "Secure Stack Sprint",
    "meta": "Flagship · 48-Hour Buildathon",
    "cycle": "2026-27 Edition",
    "format": "Secure Development & Code Hardening",
    "description": "An intensive hands-on sprint where participants build software systems, subject them to peer security audits, patch emerging zero-days, and deploy hardened defenses under expert faculty and industry mentorship.",
    "pillars": [
      "Threat Modeling",
      "Secure SDLC Practices",
      "Vulnerability Remediation",
      "Industry Mentorship"
    ],
    "badge": "sprint",
    "status": "Registration Open",
    "image": "/flagships/sprint.png",
    "year": "2026-27"
  }
]
