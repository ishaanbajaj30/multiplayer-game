import Avatar from '../../components/Avatar'

/**
 * Game plugin contract:
 *   players     — profiles in seat order [{ id, name, avatar }, ...]
 *   currentUser — whoever this device says it is (for "you" badges)
 *   onGameEnd   — call once per finished round:
 *                 { winnerId: string|null, draw?: boolean,
 *                   scores?: { [playerId]: number }, meta?: object }
 * The host writes the match + leaderboard update. Never touch Firestore here.
 */
export default function MyGame({ players, currentUser, onGameEnd }) {
  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'center' }}>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {players.map((p) => (
          <Avatar key={p.id} profile={p} size={56} showName subtitle={p.id === currentUser?.id ? 'you' : null} />
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => onGameEnd({ winnerId: players[0].id })}>
        {players[0].name} wins
      </button>
      <button className="btn" onClick={() => onGameEnd({ draw: true })}>
        Draw
      </button>
    </div>
  )
}

// For an `online` game, replace the local state above with shared state:
//
//   import { useGameSession } from '../../hooks/useGameSession'
//   import { manifest } from './manifest'
//
//   const { state, commit, syncing, loading } = useGameSession(
//     manifest.id,
//     () => ({ turn: 'X', board: Array(9).fill(null), round: 1 }),
//   )
//
//   const isMyTurn = state?.turn === myMark   // gate every control on this
//   await commit({ ...state, turn: 'O' })     // false if they moved first
//
// And report the round idempotently, from the mover's device only:
//   onGameEnd({ winnerId, matchId: `${manifest.id}-r${state.round}` })
