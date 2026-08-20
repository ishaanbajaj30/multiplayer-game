import { useState } from 'react'

const STEP = 17

/** Fills to 100%… then betrays you exactly once. Then it actually works. */
export default function FakeWin({ onHit, onGotcha, fx }) {
  const [fill, setFill] = useState(0)
  const [betrayed, setBetrayed] = useState(false)
  const [note, setNote] = useState(null)

  function charge(e) {
    const next = Math.min(100, fill + STEP)
    if (next < 100) {
      setFill(next)
      fx.pop()
      return
    }
    if (!betrayed) {
      setFill(99)
      setNote('lol')
      setBetrayed(true)
      setTimeout(() => {
        setFill(0)
        onGotcha('99% is not 100%', { at: e })
      }, 420)
      return
    }
    setFill(100)
    setNote('…fine. you win.')
    onHit(e)
  }

  return (
    <div className="gt-arena gt-arena-center">
      <div className="gt-bar">
        <div className="gt-bar-fill" style={{ width: `${fill}%` }} />
        <span className="gt-bar-label">{Math.round(fill)}%</span>
      </div>
      {note && <p className="gt-note">{note}</p>}
      <button className="gt-btn gt-btn-green" onClick={charge}>
        CHARGE
      </button>
    </div>
  )
}
