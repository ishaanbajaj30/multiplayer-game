import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Avatar from './Avatar'

const LINKS = [
  { to: '/', label: 'Arcade' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/profile', label: 'Avatar Studio' },
]

export default function NavBar() {
  const { currentUser, myId, releaseSeat } = useApp()

  return (
    <header className="nav">
      <NavLink to="/" className="nav-brand">
        <span className="nav-logo">🕹️</span> Couple Arcade
      </NavLink>

      <nav className="nav-links">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className="nav-link">
            {l.label}
          </NavLink>
        ))}
      </nav>

      {currentUser && (
        <div className="nav-me">
          <Avatar profile={currentUser} size={36} />
          <div className="nav-me-text">
            <span className="nav-me-name">{currentUser.name}</span>
            <button
              className="nav-me-release"
              title="release this seat on this device"
              onClick={() => {
                if (confirm(`Stop being ${currentUser.name} on this device?`)) releaseSeat(myId)
              }}
            >
              not you?
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
