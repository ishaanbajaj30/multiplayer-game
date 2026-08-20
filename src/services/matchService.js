import { dataBackend } from '../backend'
import { buildMatchRecord } from './scoring'

export const matchService = {
  /**
   * Turn a game's result into an append-only match + leaderboard update.
   * `result.matchId` (optional) makes the write idempotent — pass a value
   * derived from the round (e.g. `${gameId}-r7`) so a round reported by both
   * devices only scores once.
   */
  async submit({ manifest, playerIds, result }) {
    const record = buildMatchRecord({ manifest, playerIds, result })
    if (result.matchId) record.matchId = result.matchId
    const matchId = await dataBackend.recordMatch(record)
    return { matchId, record }
  },
}
