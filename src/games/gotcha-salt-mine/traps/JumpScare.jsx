import { useEffect, useRef, useState } from 'react'

/**
 * Gentle jump-scare: a WRONG! flash lands at random. Clicking during the flash
 * counts as flinching. Visual + a soft buzz only — funny, not mean.
 */
export default function JumpScare({ progress, level, onHit, onGotcha, fx }) {
  const [scare, setScare] = useState(false)
  const scaring = useRef(false)

  useEffect(() => {
    let timer
    const schedule = () => {
      timer = setTimeout(() => {
        setScare(true)
        scaring.current = true
        fx.buzz()
        setTimeout(() => {
          setScare(false)
          scaring.current = false
          schedule()
        }, 650)
      }, 1100 + Math.random() * 1600)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [fx])

  return (
    <div className={`gt-arena gt-arena-center ${scare ? 'is-scared' : ''}`}>
      {scare && <div className="gt-scare">WRONG!</div>}
      <button
        className="gt-btn gt-btn-green gt-btn-big"
        onClick={(e) => {
          if (scaring.current) {
            onGotcha('flinched mid-click', { at: e })
            return
          }
          fx.pop()
          onHit(e)
        }}
      >
        CLICK ({progress}/{level.goal})
      </button>
      <span className="gt-arena-note">do not flinch</span>
    </div>
  )
}
