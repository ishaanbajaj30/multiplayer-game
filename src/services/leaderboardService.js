import { dataBackend } from '../backend'
import { PLAYER_IDS } from '../constants'
import { emptyStats, winRate } from './statsMath'

export const leaderboardService = {
  subscribe(cb, onError) {
    return dataBackend.subscribeLeaderboard((docs) => {
      const byId = Object.fromEntries(docs.map((d) => [d.id, d]))
      const rows = PLAYER_IDS.map((id) => ({ ...emptyStats(id), ...(byId[id] || {}) }))
      rows.sort((a, b) => b.points - a.points || b.wins - a.wins || winRate(b) - winRate(a))
      cb(rows)
    }, onError)
  },

  subscribeMatches(cb, count, onError) {
    return dataBackend.subscribeMatches(cb, count, onError)
  },
}
