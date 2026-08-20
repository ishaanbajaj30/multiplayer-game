import Avatar from '../components/Avatar'
import { useApp } from '../context/AppContext'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useMatches } from '../hooks/useMatches'
import { gameRegistry, games } from '../games/registry'
import { winRate } from '../services/statsMath'

// Counter labels are declared by the games themselves (manifest.counters), so
// a new game's tallies show up here with no edits to this page.
const COUNTER_META = Object.fromEntries(
  games.flatMap((g) => (g.manifest.counters || []).map((c) => [c.key, c])),
)

function streakLabel(streak) {
  if (!streak) return '—'
  return streak > 0 ? `🔥 ${streak}W` : `❄️ ${Math.abs(streak)}L`
}

function CounterChips({ counters }) {
  const entries = Object.entries(counters || {}).filter(([, v]) => v)
  if (!entries.length) return null
  return (
    <div className="counter-chips">
      {entries.map(([key, value]) => {
        const meta = COUNTER_META[key] || { label: key, icon: '•' }
        return (
          <span key={key} className={`counter-chip tone-${meta.tone || 'neutral'}`} title={meta.label}>
            <span aria-hidden="true">{meta.icon}</span> {value} {meta.label}
          </span>
        )
      })}
    </div>
  )
}

export default function Leaderboard() {
  const { profiles, profilesById } = useApp()
  const { rows, loading } = useLeaderboard()
  const { matches } = useMatches(20)

  if (loading) return <p className="muted">Counting…</p>

  const playedGameIds = [
    ...new Set([
      ...games.map((g) => g.manifest.id),
      ...rows.flatMap((r) => Object.keys(r.perGame || {})),
    ]),
  ]

  return (
    <div className="page">
      <h1>Global Leaderboard</h1>

      <div className="standings">
        {rows.map((row, i) => {
          const profile = profilesById[row.playerId]
          return (
            <section key={row.playerId} className={`card standing ${i === 0 && row.games ? 'is-leader' : ''}`}>
              <div className="standing-head">
                <Avatar profile={profile} size={72} ring={i === 0 && row.games ? 'var(--accent)' : null} />
                <div>
                  <h2>
                    {profile?.name} {i === 0 && row.games > 0 && <span className="crown">👑</span>}
                  </h2>
                  <p className="muted small">{row.games} games played</p>
                </div>
                <div className="standing-points">
                  <strong>{row.points}</strong>
                  <span className="muted small">points</span>
                </div>
              </div>
              <dl className="stat-grid">
                <div><dt>Wins</dt><dd>{row.wins}</dd></div>
                <div><dt>Losses</dt><dd>{row.losses}</dd></div>
                <div><dt>Draws</dt><dd>{row.draws}</dd></div>
                <div><dt>Win rate</dt><dd>{Math.round(winRate(row) * 100)}%</dd></div>
                <div><dt>Streak</dt><dd>{streakLabel(row.streak)}</dd></div>
                <div><dt>Best</dt><dd>{row.bestStreak || 0}W</dd></div>
              </dl>
              <CounterChips counters={row.counters} />
            </section>
          )
        })}
      </div>

      <section className="card">
        <h2>Head to head</h2>
        <div className="h2h">
          {profiles.map((p) => {
            const row = rows.find((r) => r.playerId === p.id)
            const opponents = Object.entries(row?.headToHead || {})
            if (!opponents.length) return null
            return opponents.map(([oppId, h]) => (
              <div key={`${p.id}-${oppId}`} className="h2h-row">
                <Avatar profile={p} size={40} />
                <strong>{h.wins}</strong>
                <span className="muted small">
                  {h.draws} draw{h.draws === 1 ? '' : 's'} · {h.games} played
                </span>
                <strong>{h.losses}</strong>
                <Avatar profile={profilesById[oppId]} size={40} />
              </div>
            ))
          })}
          {!rows.some((r) => r.games) && <p className="muted">No matches yet. Go play something.</p>}
        </div>
      </section>

      <section className="card">
        <h2>Per-game breakdown</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Game</th>
                {rows.map((r) => (
                  <th key={r.playerId}>{profilesById[r.playerId]?.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {playedGameIds.map((gid) => (
                <tr key={gid}>
                  <td>
                    {gameRegistry[gid]?.manifest.icon || '🎮'} {gameRegistry[gid]?.manifest.title || gid}
                  </td>
                  {rows.map((r) => {
                    const g = r.perGame?.[gid]
                    return (
                      <td key={r.playerId}>
                        {g ? `${g.wins}W · ${g.draws}D · ${g.losses}L · ${g.points}pts` : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Recent matches</h2>
        {matches.length === 0 && <p className="muted">Nothing logged yet.</p>}
        <ul className="match-list">
          {matches.map((m) => (
            <li key={m.id}>
              <span className="match-icon">{gameRegistry[m.gameId]?.manifest.icon || '🎮'}</span>
              <span className="match-title">{gameRegistry[m.gameId]?.manifest.title || m.gameId}</span>
              <span className="match-result">
                {m.draw ? 'Draw' : `${profilesById[m.winnerId]?.name || m.winnerId} won`}
              </span>
              <span className="muted small">{(m.playedAtIso || '').slice(0, 16).replace('T', ' ')}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
