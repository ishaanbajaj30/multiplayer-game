// Fallback backend: same interface as Firestore, stored in localStorage.
// Lets the arcade run before Firebase config is pasted in (and offline demos).
import { applyMatchToStats, emptyStats } from '../services/statsMath'

const KEY = 'multiplayer-arcade:db'
const UID_KEY = 'multiplayer-arcade:uid'
const listeners = { profiles: new Set(), leaderboard: new Set(), matches: new Set() }
const sessionListeners = new Map() // gameId -> Set<cb>

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY)) || {}
    return { profiles: {}, leaderboard: {}, matches: [], sessions: {}, ...parsed }
  } catch {
    return { profiles: {}, leaderboard: {}, matches: [], sessions: {} }
  }
}

function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
  emit(state)
}

function emit(state) {
  const profiles = Object.entries(state.profiles).map(([id, v]) => ({ id, ...v }))
  const leaderboard = Object.entries(state.leaderboard).map(([id, v]) => ({ id, ...v }))
  listeners.profiles.forEach((cb) => cb(profiles))
  listeners.leaderboard.forEach((cb) => cb(leaderboard))
  listeners.matches.forEach((cb) => cb(state.matches))
  sessionListeners.forEach((set, gameId) => set.forEach((cb) => cb(state.sessions[gameId] || null)))
}

function subscribe(bucket, cb) {
  listeners[bucket].add(cb)
  const state = read()
  if (bucket === 'matches') cb(state.matches)
  else cb(Object.entries(state[bucket]).map(([id, v]) => ({ id, ...v })))
  return () => listeners[bucket].delete(cb)
}

function localUid() {
  let uid = localStorage.getItem(UID_KEY)
  if (!uid) {
    uid = `local_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(UID_KEY, uid)
  }
  return uid
}

export const localBackend = {
  kind: 'local',
  init: () => Promise.resolve(),

  getUid: () => Promise.resolve(localUid()),

  async claimSeat(playerId, { force = false } = {}) {
    const uid = localUid()
    const state = read()
    const held = state.profiles[playerId]?.claimedUid
    if (held && held !== uid && !force) throw new Error('SEAT_TAKEN')
    state.profiles[playerId] = { ...(state.profiles[playerId] || {}), claimedUid: uid }
    write(state)
    return uid
  },

  async releaseSeat(playerId) {
    const state = read()
    if (state.profiles[playerId]) {
      state.profiles[playerId] = { ...state.profiles[playerId], claimedUid: null }
      write(state)
    }
  },

  subscribeProfiles: (cb) => subscribe('profiles', cb),

  async saveProfile(playerId, patch) {
    const state = read()
    state.profiles[playerId] = { ...(state.profiles[playerId] || {}), ...patch }
    write(state)
  },

  subscribeLeaderboard: (cb) => subscribe('leaderboard', cb),

  subscribeMatches: (cb, count = 25) => subscribe('matches', (all) => cb(all.slice(0, count))),

  subscribeSession(gameId, cb) {
    if (!sessionListeners.has(gameId)) sessionListeners.set(gameId, new Set())
    sessionListeners.get(gameId).add(cb)
    cb(read().sessions[gameId] || null)
    return () => sessionListeners.get(gameId)?.delete(cb)
  },

  async initSession(gameId, state) {
    const db = read()
    if (db.sessions[gameId]) return
    db.sessions[gameId] = { id: gameId, state, version: 1, updatedBy: localUid() }
    write(db)
  },

  async commitSession(gameId, { expectedVersion, state }) {
    const db = read()
    const current = db.sessions[gameId]?.version || 0
    if (current !== expectedVersion) throw new Error('STALE_SESSION')
    db.sessions[gameId] = { id: gameId, state, version: current + 1, updatedBy: localUid() }
    write(db)
  },

  async recordMatch(match) {
    const state = read()
    const playedAt = new Date().toISOString()
    const id = match.matchId || `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    // Idempotent: the same finished round reported twice counts once.
    if (state.matches.some((m) => m.id === id)) return id

    state.matches.unshift({
      id,
      gameId: match.gameId,
      players: match.entries.map((e) => e.playerId),
      entries: match.entries,
      winnerId: match.winnerId ?? null,
      draw: Boolean(match.draw),
      meta: match.meta || {},
      playedAtIso: playedAt,
    })

    for (const entry of match.entries) {
      const prev = state.leaderboard[entry.playerId] || emptyStats(entry.playerId)
      const opponentIds = match.entries.map((e) => e.playerId).filter((x) => x !== entry.playerId)
      state.leaderboard[entry.playerId] = applyMatchToStats(prev, entry, {
        gameId: match.gameId,
        opponentIds,
        playedAt,
      })
    }

    write(state)
    return id
  },
}
