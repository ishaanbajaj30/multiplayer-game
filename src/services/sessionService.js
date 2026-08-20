import { dataBackend } from '../backend'

/**
 * Live shared state for one game, so both devices see the same board.
 * Writes use optimistic concurrency (version check) — a move made against a
 * stale view is rejected rather than silently overwriting the other player.
 */
export const sessionService = {
  subscribe(gameId, cb, onError) {
    return dataBackend.subscribeSession(gameId, cb, onError)
  },

  init(gameId, state) {
    return dataBackend.initSession(gameId, state)
  },

  commit(gameId, expectedVersion, state) {
    return dataBackend.commitSession(gameId, { expectedVersion, state })
  },
}

export const STALE = 'STALE_SESSION'
