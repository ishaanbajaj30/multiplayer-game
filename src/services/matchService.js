import { dataBackend } from '../backend'
import { buildMatchRecord } from './scoring'

export const matchService = {
  /** Turn a game's result into an append-only match + leaderboard update. */
  async submit({ manifest, playerIds, result }) {
    const record = buildMatchRecord({ manifest, playerIds, result })
    const matchId = await dataBackend.recordMatch(record)
    return { matchId, record }
  },
}
