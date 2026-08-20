import { Link } from 'react-router-dom'

export default function GameCard({ manifest }) {
  return (
    <Link to={`/play/${manifest.id}`} className="game-card">
      <span className="game-card-icon" aria-hidden="true">
        {manifest.icon}
      </span>
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
