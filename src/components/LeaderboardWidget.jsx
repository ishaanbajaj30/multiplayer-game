import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { useApp } from '../context/AppContext'
import { useLeaderboard } from '../hooks/useLeaderboard'

export default function LeaderboardWidget() {
  const { profilesById } = useApp()
  const { rows, loading } = useLeaderboard()

  return (
    <section className="card widget">
      <div className="widget-head">
        <h2>Standings</h2>
        <Link to="/leaderboard" className="link-quiet">
          full board →
        </Link>
      </div>
      {loading ? (
        <p className="muted">Counting…</p>
      ) : (
        <ol className="widget-list">
          {rows.map((row, i) => (
            <li key={row.playerId}>
              <span className="widget-rank">{i + 1}</span>
              <Avatar profile={profilesById[row.playerId]} size={40} />
              <span className="widget-name">{profilesById[row.playerId]?.name}</span>
              <span className="widget-points">{row.points} pts</span>
              <span className="muted small">
                {row.wins}W · {row.draws}D · {row.losses}L
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
