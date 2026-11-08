import { useEffect, useState } from 'react'
import { getAuthSession } from '../api/client'

export function useAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true
    getAuthSession()
      .then((session) => {
        if (active) {
          setIsAdmin(Boolean(session.authenticated && session.role === 'admin'))
        }
      })
      .catch(() => {
        if (active) setIsAdmin(false)
      })
    return () => {
      active = false
    }
  }, [])

  return isAdmin
}

