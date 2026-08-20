import GameCard from '../components/GameCard'
import LeaderboardWidget from '../components/LeaderboardWidget'
import Avatar from '../components/Avatar'
import { gamesByNewest } from '../games/registry'
import { useApp } from '../context/AppContext'

export default function Arcade() {
  const { profiles } = useApp()

  return (
    <div className="page arcade">
      <section className="hero card">
        <div className="hero-players">
          {profiles.map((p) => (
            <Avatar key={p.id} profile={p} size={72} showName subtitle="ready" />
          ))}
        </div>
        <div>
          <h1>Multiplayer Arcade</h1>
          <p className="muted">
            {gamesByNewest.length} game{gamesByNewest.length === 1 ? '' : 's'} in the cabinet. Every result feeds one
            leaderboard.
          </p>
        </div>
      </section>

      <div className="arcade-body">
        <section>
          <h2 className="section-title">Games</h2>
          <div className="game-grid">
            {gamesByNewest.map((g) => (
              <GameCard key={g.manifest.id} manifest={g.manifest} />
            ))}
          </div>
        </section>
        <LeaderboardWidget />
      </div>
    </div>
  )
}
