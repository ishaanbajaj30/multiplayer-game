import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { backendKind, dataBackend } from '../backend'
import { profileService } from '../services/profileService'
import { useProfiles } from '../hooks/useProfiles'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { profiles, byId, loading, error, saveProfile } = useProfiles()
  const [ready, setReady] = useState(false)
  const [uid, setUid] = useState(null)
  const [initError, setInitError] = useState(null)

  useEffect(() => {
    dataBackend
      .init()
      .then(() => profileService.getUid())
      .then((id) => {
        setUid(id)
        setReady(true)
      })
      .catch((err) => {
        setInitError(err)
        setReady(true)
      })
  }, [])

  // Seed missing profile docs once, so both seats always exist.
  useEffect(() => {
    if (!ready || loading) return
    profiles.filter((p) => !p.exists).forEach((p) => profileService.ensureExists(p))
  }, [ready, loading, profiles])

  // Your seat is whichever profile this browser's anonymous uid holds.
  const mine = useMemo(() => profiles.find((p) => p.claimedUid && p.claimedUid === uid) || null, [profiles, uid])

  const claimSeat = useCallback((playerId, opts) => profileService.claim(playerId, opts), [])
  const releaseSeat = useCallback((playerId) => profileService.release(playerId), [])

  const value = useMemo(
    () => ({
      profiles,
      profilesById: byId,
      loading: loading || !ready,
      error: error || initError,
      saveProfile,
      backendKind,
      uid,
      currentUser: mine,
      myId: mine?.id || null,
      needsClaim: Boolean(ready && !loading && uid && !mine),
      claimSeat,
      releaseSeat,
    }),
    [profiles, byId, loading, ready, error, initError, saveProfile, uid, mine, claimSeat, releaseSeat],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
