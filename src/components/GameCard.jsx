import { Link } from 'react-router-dom'

const MODE_LABEL = {
  online: { text: 'live · turn-based', tone: 'online' },
  'solo-vs': { text: 'solo · scores vs partner', tone: 'solo' },
  hotseat: { text: 'same screen', tone: 'hotseat' },
}

export default function GameCard({ manifest }) {
  const mode = MODE_LABEL[manifest.mode] || null
  return (
    <Link to={`/play/${manifest.id}`} className="game-card">
      <span className="game-card-icon" aria-hidden="true">
        {manifest.icon}
      </span>
      {mode && <span className={`game-mode tone-${mode.tone}`}>{mode.text}</span>}
      <h3>{manifest.title}</h3>
      <p>{manifest.description}</p>
      <span className="game-card-meta">
        {manifest.minPlayers === manifest.maxPlayers
          ? `${manifest.minPlayers} players`
          : `${manifest.minPlayers}–${manifest.maxPlayers} players`}
        {' · added '}
        {manifest.createdAt}
      </span>
    </Link>
  )
}
