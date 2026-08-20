import { useEffect, useMemo, useState } from 'react'
import { leaderboardService } from '../services/leaderboardService'

export function useLeaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = leaderboardService.subscribe(
      (next) => {
        setRows(next)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  const byId = useMemo(() => Object.fromEntries(rows.map((r) => [r.playerId || r.id, r])), [rows])
  return { rows, byId, loading, error }
}
