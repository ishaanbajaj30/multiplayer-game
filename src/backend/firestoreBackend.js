import {
  collection,
  doc,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { auth, db, ensureSignedIn } from '../firebase/client'
import { applyMatchToStats, emptyStats } from '../services/statsMath'

const PROFILES = 'profiles'
const MATCHES = 'matches'
const LEADERBOARD = 'leaderboard'

export const firestoreBackend = {
  kind: 'firestore',

  init: () => ensureSignedIn().then(() => undefined),

  async getUid() {
    const user = await ensureSignedIn()
    return user.uid
  },

  /**
   * Bind a seat to this device's anonymous uid. Refuses a seat someone else
   * holds unless force is passed (needed when a browser's uid resets).
   */
  async claimSeat(playerId, { force = false } = {}) {
    const user = await ensureSignedIn()
    const ref = doc(db, PROFILES, playerId)
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref)
      const held = snap.exists() ? snap.data().claimedUid : null
      if (held && held !== user.uid && !force) throw new Error('SEAT_TAKEN')
      tx.set(ref, { claimedUid: user.uid, claimedAt: serverTimestamp() }, { merge: true })
    })
    return user.uid
  },

  async releaseSeat(playerId) {
    await ensureSignedIn()
    await setDoc(doc(db, PROFILES, playerId), { claimedUid: null }, { merge: true })
  },

  subscribeProfiles(cb, onError) {
    return onSnapshot(
      collection(db, PROFILES),
      (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      onError,
    )
  },

  async saveProfile(playerId, patch) {
    await ensureSignedIn()
    await setDoc(
      doc(db, PROFILES, playerId),
      { ...patch, updatedAt: serverTimestamp() },
      { merge: true },
    )
  },

  subscribeLeaderboard(cb, onError) {
    return onSnapshot(
      collection(db, LEADERBOARD),
      (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      onError,
    )
  },

  subscribeMatches(cb, count = 25, onError) {
    const q = query(collection(db, MATCHES), orderBy('playedAt', 'desc'), fsLimit(count))
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError)
  },

  /**
   * Append-only match write + transactional leaderboard aggregation.
   * Reads every leaderboard doc first, then writes — so two devices finishing
   * games at the same time can't clobber each other's totals.
   */
  async recordMatch(match) {
    await ensureSignedIn()
    const matchRef = doc(collection(db, MATCHES))
    const playedAt = new Date().toISOString()

    await runTransaction(db, async (tx) => {
      const refs = match.entries.map((e) => doc(db, LEADERBOARD, e.playerId))
      const snaps = await Promise.all(refs.map((ref) => tx.get(ref)))

      tx.set(matchRef, {
        gameId: match.gameId,
        players: match.entries.map((e) => e.playerId),
        entries: match.entries,
        winnerId: match.winnerId ?? null,
        draw: Boolean(match.draw),
        meta: match.meta || {},
        playedAt: serverTimestamp(),
        playedAtIso: playedAt,
      })

      match.entries.forEach((entry, i) => {
        const prev = snaps[i].exists() ? snaps[i].data() : emptyStats(entry.playerId)
        const opponentIds = match.entries.map((e) => e.playerId).filter((id) => id !== entry.playerId)
        const next = applyMatchToStats(prev, entry, {
          gameId: match.gameId,
          opponentIds,
          playedAt,
        })
        tx.set(refs[i], { ...next, updatedAt: serverTimestamp() }, { merge: true })
      })
    })

    return matchRef.id
  },
}
