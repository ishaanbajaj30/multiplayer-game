import { useCallback, useEffect, useRef, useState } from 'react'
import { sessionService, STALE } from '../services/sessionService'

/**
 * Shared game state for turn-based plugins.
 *
 *   const { state, version, commit, syncing } = useGameSession(gameId, makeInitialState)
 *
 * `commit(nextState)` writes only if nobody moved first; a rejected write is
 * harmless — the snapshot listener has already delivered the newer state.
 * Returns `false` when the write was rejected as stale.
 */
export function useGameSession(gameId, makeInitialState) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const seeded = useRef(false)
  const makeInitial = useRef(makeInitialState)
  makeInitial.current = makeInitialState

  useEffect(() => {
    seeded.current = false
    setLoading(true)
    const unsub = sessionService.subscribe(
      gameId,
      (next) => {
        setSession(next)
        setLoading(false)
        // First device to arrive seeds the board.
        if (!next && !seeded.current) {
          seeded.current = true
          sessionService.init(gameId, makeInitial.current()).catch((err) => setError(err))
        }
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [gameId])

  const commit = useCallback(
    async (nextState) => {
      if (!session) return false
      setSyncing(true)
      try {
        await sessionService.commit(gameId, session.version, nextState)
        return true
      } catch (err) {
        if (err.message === STALE) return false // someone moved first; snapshot wins
        setError(err)
        return false
      } finally {
        setSyncing(false)
      }
    },
    [gameId, session],
  )

  return {
    state: session?.state || null,
    version: session?.version || 0,
    loading,
    error,
    syncing,
    commit,
  }
}
