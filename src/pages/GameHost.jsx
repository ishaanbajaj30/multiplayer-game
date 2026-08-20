import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getGame } from '../games/registry'
import { matchService } from '../services/matchService'
import { useApp } from '../context/AppContext'

/**
 * Generic host for any registered game. It owns the leaderboard write, so a
 * game plugin only has to call onGameEnd(result) and knows nothing about Firestore.
 */
export default function GameHost() {
  const { gameId } = useParams()
  const { profiles, currentUser } = useApp()
  const [lastResult, setLastResult] = useState(null)
  const [saveError, setSaveError] = useState(null)

  const game = getGame(gameId)

  const onGameEnd = useCallback(
    async (result) => {
      setSaveError(null)
      const playerIds = profiles.slice(0, game.manifest.maxPlayers).map((p) => p.id)
      try {
        const { record } = await matchService.submit({ manifest: game.manifest, playerIds, result })
        setLastResult(record)
      } catch (err) {
        console.error(err)
        setSaveError(err)
      }
    },
    [game, profiles],
  )

  if (!game) {
    return (
      <div className="page">
        <h1>Unknown game</h1>
        <p className="muted">
          No plugin registered for “{gameId}”. <Link to="/">Back to the arcade</Link>
        </p>
      </div>
    )
  }

  const { manifest, Component } = game
  const seated = profiles.slice(0, manifest.maxPlayers)

  return (
    <div className="page">
      <div className="game-head">
        <Link to="/" className="link-quiet">
          ← Arcade
        </Link>
        <h1>
          <span aria-hidden="true">{manifest.icon}</span> {manifest.title}
        </h1>
        <p className="muted">{manifest.description}</p>
      </div>

      {seated.length < manifest.minPlayers ? (
        <p className="banner banner-warn">This game needs {manifest.minPlayers} players.</p>
      ) : (
        <div className="card game-stage">
          <Component players={seated} currentUser={currentUser} onGameEnd={onGameEnd} />
        </div>
      )}

      {lastResult && (
        <p className="banner banner-ok">
          Logged to the leaderboard:{' '}
          {lastResult.entries.map((e) => `${e.playerId} ${e.outcome} +${e.points}`).join(' · ')}
        </p>
      )}
      {saveError && <p className="banner banner-error">Could not save that match: {String(saveError.message)}</p>}
    </div>
  )
}
