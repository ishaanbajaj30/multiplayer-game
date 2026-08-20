import { useCallback, useEffect, useMemo, useState } from 'react'
import { profileService } from '../services/profileService'

export function useProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = profileService.subscribe(
      (next) => {
        setProfiles(next)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  const byId = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles])
  const saveProfile = useCallback((id, patch) => profileService.save(id, patch), [])

  return { profiles, byId, loading, error, saveProfile }
}
