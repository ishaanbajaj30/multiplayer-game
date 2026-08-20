import { useState } from 'react'

const CORNERS = [
  { top: '6%', left: '5%' },
  { top: '6%', right: '5%' },
  { bottom: '8%', left: '5%' },
  { bottom: '8%', right: '5%' },
]

/** The enormous button is decoration. The real target is 10 pixels wide. */
export default function DecoyDot({ progress, level, onHit, onGotcha, fx }) {
  const [corner, setCorner] = useState(0)

  return (
    <div className="gt-arena gt-arena-center">
      <button
        className="gt-btn gt-btn-green gt-btn-huge"
        onClick={(e) => onGotcha('that button is purely decorative', { at: e })}
      >
        THE BUTTON
      </button>
      <button
        className="gt-dot"
        style={CORNERS[corner % CORNERS.length]}
        aria-label="the actual button"
        onClick={(e) => {
          fx.pop()
          setCorner((c) => c + 1)
          onHit(e)
        }}
      />
      <span className="gt-arena-note">
        {progress}/{level.goal} real presses
      </span>
    </div>
  )
}
