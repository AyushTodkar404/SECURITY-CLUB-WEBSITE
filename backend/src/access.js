export const roles = ['admin', 'core', 'member', 'visitor']

export const pageAccess = {
  '/': 'visitor',
  '/about': 'visitor',
  '/awareness': 'visitor',
  '/events': 'visitor',
  '/flagships': 'visitor',
  '/team': 'visitor',
  '/gallery': 'visitor',
  '/leaderboard': 'visitor',
  '/membership': 'visitor',
  '/submission': 'visitor',
  '/contact': 'visitor',
  '/ctf': 'visitor',
  '/dashboard': 'member',
  '/profile': 'member',
  '/admin': 'admin',
}

const rank = { visitor: 0, member: 1, core: 2, admin: 3 }

export function canAccess(role, requiredRole) {
  return rank[role] >= rank[requiredRole]
}
