import type { ReactNode } from 'react'
import CTFPage from '../pages/CTF/CTFPage'
import ContactPage from '../pages/Contact/ContactPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import EventsPage from '../pages/Events/EventsPage'
import FlagshipsPage from '../pages/Flagships/FlagshipsPage'
import GalleryPage from '../pages/Gallery/GalleryPage'
import LandingPage from '../pages/Landing/LandingPage'
import AboutPage from '../pages/About/AboutPage'
import AwarenessPage from '../pages/Awareness/AwarenessPage'
import SubmissionPage from '../pages/Submission/SubmissionPage'
import LeaderboardPage from '../pages/Leaderboard/LeaderboardPage'
import MembershipPage from '../pages/Membership/MembershipPage'
import TeamPage from '../pages/Team/TeamPage'
import ProfilePage from '../pages/Profile/ProfilePage'
import AuthPage from '../pages/Auth/AuthPage'
import ActivatePage from '../pages/Auth/ActivatePage'
import SetPasswordPage from '../pages/Auth/SetPasswordPage'
import AdminPage from '../pages/Admin/AdminPage'
import PrivacyPage from '../pages/Legal/PrivacyPage'
import TermsPage from '../pages/Legal/TermsPage'
import NotFoundPage from '../pages/NotFoundPage'
import type { UserRole } from '../api/client'
import type { AuthSession } from '../types'

export interface NavItem {
  path: string
  label: string
}

export interface AppRoute {
  path: string
  label: string
  element: ReactNode
  requiredRole: UserRole
  requiredPermission?: string
  requiredPosition?: string
  showInNavigation?: boolean
  anonymousOnly?: boolean
}

export const appRoutes: AppRoute[] = [
  { path: '/', label: 'Welcome', element: <LandingPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/about', label: 'About Us', element: <AboutPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/awareness', label: 'Security Awareness', element: <AwarenessPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/events', label: 'Events', element: <EventsPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/flagships', label: 'Flagships', element: <FlagshipsPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/team', label: 'Team', element: <TeamPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/gallery', label: 'Gallery', element: <GalleryPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/membership', label: 'Membership', element: <MembershipPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/submission', label: 'Submission', element: <SubmissionPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/contact', label: 'Contact', element: <ContactPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/ctf', label: 'CTF', element: <CTFPage />, requiredRole: 'visitor', showInNavigation: true },
  { path: '/leaderboard', label: 'Leaderboard', element: <LeaderboardPage />, requiredRole: 'visitor', showInNavigation: false },
  { path: '/dashboard', label: 'Dashboard', element: <DashboardPage />, requiredRole: 'member', showInNavigation: true },
  { path: '/profile', label: 'Profile', element: <ProfilePage />, requiredRole: 'member', showInNavigation: true },
  { path: '/auth', label: 'Member Access', element: <AuthPage />, requiredRole: 'visitor', anonymousOnly: true },
  { path: '/login', label: 'Log in', element: <AuthPage />, requiredRole: 'visitor', anonymousOnly: true },
  { path: '/activate', label: 'Activate', element: <ActivatePage />, requiredRole: 'visitor' },
  { path: '/set-password', label: 'Set password', element: <SetPasswordPage />, requiredRole: 'visitor' },
  { path: '/admin', label: 'Admin', element: <AdminPage />, requiredRole: 'admin', requiredPermission: 'permissions.manage', showInNavigation: true },
  { path: '/privacy', label: 'Privacy Policy', element: <PrivacyPage />, requiredRole: 'visitor', showInNavigation: false },
  { path: '/terms', label: 'Terms of Service', element: <TermsPage />, requiredRole: 'visitor', showInNavigation: false },
  { path: '*', label: '404', element: <NotFoundPage />, requiredRole: 'visitor', showInNavigation: false },
]

const roleRank: Record<UserRole, number> = { visitor: 0, member: 1, core: 2, admin: 3 }

export function canAccessRoute(route: AppRoute, session: AuthSession | null) {
  if (route.anonymousOnly) return !session?.authenticated
  const requiresAccess = route.requiredRole !== 'visitor' || Boolean(route.requiredPermission) || Boolean(route.requiredPosition)
  if (!requiresAccess) return true
  if (!session?.authenticated || roleRank[session.role] < roleRank[route.requiredRole]) return false
  if (route.requiredPermission && !session.permissions.includes(route.requiredPermission)) return false
  if (route.requiredPosition && !session.positions.some((position) => position.key === route.requiredPosition)) return false
  return true
}

export const navItems: NavItem[] = appRoutes.filter((route) => route.showInNavigation).map(({ path, label }) => ({ path, label }))
