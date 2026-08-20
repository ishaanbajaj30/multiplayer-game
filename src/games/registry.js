// ---------------------------------------------------------------------------
// THE ONLY FILE YOU EDIT WHEN ADDING A GAME.
// 1. Create src/games/<game-id>/ with manifest.js + a component + index.js
// 2. Import it here and add it to GAMES.
// ---------------------------------------------------------------------------
import ticTacToe from './tic-tac-toe'
import gotchaSaltMine from './gotcha-salt-mine'

const GAMES = [ticTacToe, gotchaSaltMine]

const REQUIRED_MANIFEST_FIELDS = [
  'id', 'title', 'description', 'icon', 'minPlayers', 'maxPlayers', 'createdAt', 'mode',
]
const VALID_MODES = ['online', 'solo-vs', 'hotseat']

// Fail loudly in dev if a new game forgets part of the contract.
if (import.meta.env.DEV) {
  const seen = new Set()
  for (const game of GAMES) {
    const m = game?.manifest
    if (!m) throw new Error('A registered game is missing its manifest export')
    for (const field of REQUIRED_MANIFEST_FIELDS) {
      if (m[field] === undefined) throw new Error(`Game "${m.id || '?'}" manifest is missing "${field}"`)
    }
    if (!VALID_MODES.includes(m.mode)) {
      throw new Error(`Game "${m.id}" has mode "${m.mode}"; expected one of ${VALID_MODES.join(', ')}`)
    }
    if (typeof game.Component !== 'function') throw new Error(`Game "${m.id}" must export a Component`)
    if (seen.has(m.id)) throw new Error(`Duplicate game id "${m.id}" in the registry`)
    seen.add(m.id)
  }
}

export const games = GAMES

/** Newest games first, so today's addition sits at the top of the arcade. */
export const gamesByNewest = [...GAMES].sort(
  (a, b) => new Date(b.manifest.createdAt) - new Date(a.manifest.createdAt),
)

export const gameRegistry = Object.fromEntries(GAMES.map((g) => [g.manifest.id, g]))

export function getGame(id) {
  return gameRegistry[id] || null
}
