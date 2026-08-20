import { useEffect, useState } from 'react'
import { leaderboardService } from '../services/leaderboardService'

export function useMatches(count = 15) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = leaderboardService.subscribeMatches(
      (next) => {
        setMatches(next)
        setLoading(false)
      },
      count,
      () => setLoading(false),
    )
    return unsub
  }, [count])

  return { matches, loading }
}
