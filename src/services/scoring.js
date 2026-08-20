// One scoring pipeline for every game, so points from Tic-Tac-Toe and from
// whatever you add tomorrow land in the same global leaderboard.
//
// A game can tune its payout by exporting `scoring` on its manifest:
//   scoring: { win: 12, draw: 4, loss: 1, pointsPerScore: 0.5 }
// Anything omitted falls back to DEFAULT_SCORING.

export const DEFAULT_SCORING = {
  win: 10,
  draw: 4,
  loss: 1, // participation point — playing daily should always be worth something
  pointsPerScore: 0, // optional multiplier over result.scores[playerId]
}

/**
 * Normalize a game's `onGameEnd(result)` payload into leaderboard entries.
 * @param {object} args
 * @param {object} args.manifest  game manifest (for scoring weights + id)
 * @param {string[]} args.playerIds players who took part, in seat order
 * @param {object} args.result    { winnerId, draw, scores?, counters?, meta? }
 * @returns {{gameId, winnerId, draw, meta, entries}}
 */
/** Keep only finite numbers, so a game can't poison the aggregates. */
function sanitizeCounters(raw) {
  const out = {}
  for (const [key, value] of Object.entries(raw || {})) {
    const n = Number(value)
    if (Number.isFinite(n)) out[key] = n
  }
  return out
}

export function buildMatchRecord({ manifest, playerIds, result }) {
  const rules = { ...DEFAULT_SCORING, ...(manifest.scoring || {}) }
  const draw = Boolean(result.draw) || (!result.winnerId && !result.forfeit)
  const scores = result.scores || {}
  const counters = result.counters || {}

  const entries = playerIds.map((playerId) => {
    const outcome = draw ? 'draw' : result.winnerId === playerId ? 'win' : 'loss'
    const base = rules[outcome]
    const bonus = Math.round((Number(scores[playerId]) || 0) * rules.pointsPerScore)
    return {
      playerId,
      outcome,
      score: Number(scores[playerId]) || 0,
      points: base + bonus,
      // Free-form numeric tallies a game wants remembered forever
      // (rage counts, baits survived, combos...). Summed by statsMath.
      counters: sanitizeCounters(counters[playerId]),
    }
  })

  return {
    gameId: manifest.id,
    winnerId: draw ? null : result.winnerId ?? null,
    draw,
    meta: result.meta || {},
    entries,
  }
}
