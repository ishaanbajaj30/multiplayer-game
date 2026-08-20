import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import ClaimSeat from './ClaimSeat'
import { useApp } from '../context/AppContext'

export default function Layout() {
  const { backendKind, error, loading, needsClaim } = useApp()

  return (
    <div className="app-shell">
      <NavBar />
      {backendKind === 'local' && (
        <div className="banner banner-warn">
          Running on local storage only — add your Firebase config to <code>.env</code> to sync across devices.
        </div>
      )}
      {error && <div className="banner banner-error">Sync problem: {String(error.message || error)}</div>}
      <main className="app-main">
        {loading ? (
          <div className="loading">Warming up the cabinet…</div>
        ) : needsClaim ? (
          <ClaimSeat />
        ) : (
          <Outlet />
        )}
      </main>
      <footer className="app-footer">two players · one leaderboard · new game most days</footer>
    </div>
  )
}
