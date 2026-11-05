import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { appRoutes, canAccessRoute } from './app/routes'
import { getAuthSession, logout } from './api/client'
import type { AuthSession } from './types'
import SiteLoader from './components/layout/SiteLoader'
import MatrixCanvas from './components/layout/MatrixCanvas'
import TargetCursor from './components/layout/TargetCursor'
import SiteHeader from './components/layout/SiteHeader'
import SiteFooter from './components/layout/SiteFooter'
import AccessDeniedPage from './pages/AccessDeniedPage'
import './styles.css'
import './App.css'

export default function App() {
  const [matrixActive, setMatrixActive] = useState(true)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  useEffect(() => {
    getAuthSession()
      .then((s) => {
        setSession(s)
      })
      .catch(() => {
        setSession({
          authenticated: false,
          role: 'visitor',
          user: null,
          permissions: [],
          positions: [],
        })
      })
      .finally(() => {
        setSessionLoaded(true)
      })
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      setSession({
        authenticated: false,
        role: 'visitor',
        user: null,
        permissions: [],
        positions: [],
      })
    }
  }

  return (
    <BrowserRouter>
      <SiteLoader />
      <MatrixCanvas active={matrixActive} />
      <TargetCursor />

      <SiteHeader
        session={session}
        matrixActive={matrixActive}
        onToggleMatrix={() => setMatrixActive(!matrixActive)}
        onLogout={handleLogout}
      />

      <main id="app" tabIndex={-1}>
        <Routes>
          {appRoutes.map((route) => {
            const hasAccess = !sessionLoaded || canAccessRoute(route, session)
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  hasAccess ? (
                    route.element
                  ) : session?.authenticated ? (
                    <AccessDeniedPage />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
            )
          })}
        </Routes>
      </main>

      <SiteFooter />
    </BrowserRouter>
  )
}
