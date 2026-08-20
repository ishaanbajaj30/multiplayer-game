// Pure aggregation math, shared by every backend so Firestore and the local
// fallback can never drift apart. No I/O in here — easy to reason about.

export function emptyStats(playerId) {
  return {
    playerId,
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
    streak: 0,
    bestStreak: 0,
    counters: {},
    perGame: {},
    headToHead: {},
    lastPlayedAt: null,
  }
}

function emptyGameStats() {
  return { games: 0, wins: 0, losses: 0, draws: 0, points: 0, counters: {} }
}

/** Add b's numeric keys into a copy of a. Unknown keys start at 0. */
function addCounters(a, b) {
  const out = { ...(a || {}) }
  for (const [key, value] of Object.entries(b || {})) {
    out[key] = (out[key] || 0) + value
  }
  return out
}

function emptyH2H() {
  return { games: 0, wins: 0, losses: 0, draws: 0 }
}

/**
 * Fold one match entry into a player's aggregate stats.
 * @param {object} stats   previous stats doc (or undefined)
 * @param {object} entry   { playerId, outcome: 'win'|'loss'|'draw', points, counters? }
 * @param {object} ctx     { gameId, opponentIds: string[], playedAt }
 */
export function applyMatchToStats(stats, entry, ctx) {
  const next = { ...emptyStats(entry.playerId), ...(stats || {}) }
  next.perGame = { ...(next.perGame || {}) }
  next.headToHead = { ...(next.headToHead || {}) }
  next.counters = addCounters(next.counters, entry.counters)

  const game = { ...emptyGameStats(), ...(next.perGame[ctx.gameId] || {}) }

  next.games += 1
  game.games += 1
  next.points += entry.points
  game.points += entry.points

  if (entry.outcome === 'win') {
    next.wins += 1
    game.wins += 1
    next.streak = next.streak > 0 ? next.streak + 1 : 1
  } else if (entry.outcome === 'loss') {
    next.losses += 1
    game.losses += 1
    next.streak = next.streak < 0 ? next.streak - 1 : -1
  } else {
    next.draws += 1
    game.draws += 1
    next.streak = 0
  }

  next.bestStreak = Math.max(next.bestStreak || 0, next.streak)
  game.counters = addCounters(game.counters, entry.counters)
  next.perGame[ctx.gameId] = game

  for (const opponentId of ctx.opponentIds) {
    const h2h = { ...emptyH2H(), ...(next.headToHead[opponentId] || {}) }
    h2h.games += 1
    if (entry.outcome === 'win') h2h.wins += 1
    else if (entry.outcome === 'loss') h2h.losses += 1
    else h2h.draws += 1
    next.headToHead[opponentId] = h2h
  }

  next.lastPlayedAt = ctx.playedAt
  return next
}

export function winRate(stats) {
  if (!stats || !stats.games) return 0
  return stats.wins / stats.games
}
