import { useState } from 'react'
import Avatar from './Avatar'
import { useApp } from '../context/AppContext'

/**
 * First-run gate: this browser picks a seat, and the seat is then bound to its
 * anonymous uid. Taking over a seat someone else holds is possible but explicit
 * — a browser's anonymous uid changes if storage gets cleared.
 */
export default function ClaimSeat() {
  const { profiles, uid, claimSeat } = useApp()
  const [busy, setBusy] = useState(null)
  const [err, setErr] = useState(null)

  async function claim(playerId, force) {
    setBusy(playerId)
    setErr(null)
    try {
      await claimSeat(playerId, { force })
    } catch (e) {
      setErr(e.message === 'SEAT_TAKEN' ? 'That seat belongs to another device.' : String(e.message || e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="page claim">
      <h1>Which one are you?</h1>
      <p className="muted">Pick once. This device stays that player — scores land on the right name automatically.</p>

      <div className="claim-grid">
        {profiles.map((p) => {
          const taken = Boolean(p.claimedUid && p.claimedUid !== uid)
          return (
            <div key={p.id} className={`card claim-card ${taken ? 'is-taken' : ''}`}>
              <Avatar profile={p} size={96} />
              <h2>{p.name}</h2>
              {taken ? (
                <>
                  <p className="muted small">Already claimed on another device.</p>
                  <button className="btn" disabled={busy === p.id} onClick={() => claim(p.id, true)}>
                    That&rsquo;s still me — take it over
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" disabled={busy === p.id} onClick={() => claim(p.id, false)}>
                  {busy === p.id ? 'Claiming…' : `I'm ${p.name}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {err && <p className="banner banner-error">{err}</p>}
      <p className="muted small">You can rename yourself and build your avatar right after this.</p>
    </div>
  )
}
