import { useState } from 'react'

/**
 * The rule never changes — click the GREEN one — but after two easy hits the
 * labels and positions start lying about which one that is.
 */
export default function ReverseDay({ progress, level, onHit, onGotcha, fx }) {
  const [greenFirst, setGreenFirst] = useState(true)
  const [swapped, setSwapped] = useState(false) // labels vs colours disagree
  const reversing = progress >= 2

  function shuffle() {
    setGreenFirst(Math.random() > 0.5)
    setSwapped(reversing ? Math.random() > 0.35 : false)
  }

  function press(isGreen, e) {
    if (isGreen) {
      fx.pop()
      onHit(e)
    } else {
      onGotcha('the label lied and you believed it', { at: e })
    }
    shuffle()
  }

  // Two seats; the green button occupies one of them.
  const seats = [greenFirst, !greenFirst]

  return (
    <div className="gt-arena gt-arena-center">
      <p className="gt-note">{reversing ? 'REVERSE DAY ACTIVE' : 'warming up…'}</p>
      <div className="gt-row">
        {seats.map((isGreen, i) => (
          <button
            key={i}
            className={`gt-btn ${isGreen ? 'gt-btn-green' : 'gt-btn-red'}`}
            onClick={(e) => press(isGreen, e)}
          >
            {swapped ? (isGreen ? 'RED' : 'GREEN') : isGreen ? 'GREEN' : 'RED'}
          </button>
        ))}
      </div>
      <span className="gt-arena-note">
        {progress}/{level.goal} correct
      </span>
    </div>
  )
}
