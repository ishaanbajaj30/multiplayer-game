import { useRef, useState } from 'react'

/**
 * The button dodges your cursor. It gets lazier every time you land a hit,
 * so the level always ends in a win eventually.
 */
export default function RunawayButton({ progress, level, onHit, onGotcha, fx }) {
  const arena = useRef(null)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const cooling = useRef(false)

  // Later hits are easier: dodge chance decays with progress.
  const dodgeChance = Math.max(0.2, 0.92 - progress * 0.16)

  function maybeDodge(e) {
    if (cooling.current || !arena.current) return
    const box = arena.current.getBoundingClientRect()
    const bx = box.left + (pos.x / 100) * box.width
    const by = box.top + (pos.y / 100) * box.height
    const dist = Math.hypot(e.clientX - bx, e.clientY - by)
    if (dist > 90) return
    if (Math.random() > dodgeChance) return

    cooling.current = true
    setTimeout(() => {
      cooling.current = false
    }, 120)
    setPos({ x: 18 + Math.random() * 64, y: 20 + Math.random() * 60 })
    fx.swoosh()
  }

  return (
    <div
      className="gt-arena"
      ref={arena}
      onPointerMove={maybeDodge}
      onClick={(e) => {
        // A click that lands on the arena instead of the button = chasing air.
        onGotcha('chased the button into thin air', { at: e })
      }}
    >
      <button
        className="gt-btn gt-btn-green gt-floating"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        onClick={(e) => {
          e.stopPropagation()
          onHit(e)
        }}
      >
        CLICK ME
      </button>
      <span className="gt-arena-note">{progress}/{level.goal} caught</span>
    </div>
  )
}
