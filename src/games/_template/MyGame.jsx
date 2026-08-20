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
