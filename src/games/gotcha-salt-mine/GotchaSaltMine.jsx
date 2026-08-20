import { useCallback, useMemo, useRef, useState } from 'react'
import Avatar from '../../components/Avatar'
import { LEVELS, taunt } from './levels'
import { TRAPS } from './traps'
import { createFx } from './fx'
import './styles.css'

const RAGE_QUIT_PENALTY = 3

export default function GotchaSaltMine({ players, currentUser, onGameEnd }) {
  // The victim is always whoever is holding this device: you can volunteer for
  // the salt mine, never sign your partner up for it from your own browser.
  const [phase, setPhase] = useState('intro') // intro | playing | done
  const [levelIndex, setLevelIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [gotchas, setGotchas] = useState(0)
  const [levelGotchas, setLevelGotchas] = useState(0)
  const [baitsSurvived, setBaitsSurvived] = useState(0)
  const [rageQuit, setRageQuit] = useState(false)
  const [toast, setToast] = useState(null)
  const [salt, setSalt] = useState([])
  const [muted, setMuted] = useState(false)
  const [outcome, setOutcome] = useState(null)

  const submitted = useRef(false)
  const mutedRef = useRef(muted)
  mutedRef.current = muted
  const stageRef = useRef(null)

  const victim = players.find((p) => p.id === currentUser?.id) || players[0]
  const opponent = players.find((p) => p.id !== victim.id) || players[1]

  const burst = useCallback((clientX, clientY) => {
    const box = stageRef.current?.getBoundingClientRect()
    const x = box ? clientX - box.left : 0
    const y = box ? clientY - box.top : 0
    const id = `${Date.now()}-${Math.random()}`
    const grains = Array.from({ length: 14 }, (_, i) => ({
      i,
      dx: (Math.random() - 0.5) * 220,
      dy: -40 - Math.random() * 180,
      r: Math.random() * 360,
    }))
    setSalt((s) => [...s, { id, x, y, grains }])
    setTimeout(() => setSalt((s) => s.filter((b) => b.id !== id)), 900)
  }, [])

  const fx = useMemo(() => createFx({ muted: () => mutedRef.current, burst }), [burst])

  const level = LEVELS[levelIndex]
  const Trap = level ? TRAPS[level.trap] : null

  /** Report the round to the shared leaderboard exactly once. */
  const finish = useCallback(
    ({ quit, extraBaits = 0 }) => {
      if (submitted.current) return
      submitted.current = true

      // extraBaits covers the level cleared in this same tick, whose state
      // update has not landed yet.
      const survived = baitsSurvived + extraBaits
      const totalGotchas = gotchas + (quit ? 1 : 0)
      const gotchaPoints = totalGotchas + (quit ? RAGE_QUIT_PENALTY : 0)
      const winnerId = quit ? opponent.id : victim.id

      setOutcome({ quit, totalGotchas, gotchaPoints, survived })
      setPhase('done')
      if (quit) fx.gotcha()
      else fx.win()

      onGameEnd({
        winnerId,
        draw: false,
        // Points ride on the shared pipeline: the victim banks survived baits,
        // the opponent banks every Gotcha they caused.
        scores: { [victim.id]: survived, [opponent.id]: gotchaPoints },
        counters: {
          [victim.id]: { gotchas: totalGotchas, baitsSurvived: survived, rageQuits: quit ? 1 : 0 },
          [opponent.id]: { gotchasCaused: totalGotchas },
        },
        meta: {
          victimId: victim.id,
          levelsCleared: quit ? levelIndex : LEVELS.length,
          rageQuit: quit,
        },
      })
    },
    [gotchas, baitsSurvived, levelIndex, victim, opponent, onGameEnd, fx],
  )

  function registerGotcha(reason, opts = {}) {
    setGotchas((g) => g + 1)
    setLevelGotchas((g) => g + 1)
    setToast({ text: taunt(gotchas), reason })
    fx.gotcha()
    if (opts.at) fx.burst(opts.at.clientX, opts.at.clientY)
    if (opts.reset) setProgress(0)
    setTimeout(() => setToast(null), 1400)
  }

  function registerHit() {
    const next = progress + 1
    if (next < level.goal) {
      setProgress(next)
      return
    }
    // Level cleared: always at least one bait survived, +1 for a clean sweep.
    const earned = levelGotchas === 0 ? 2 : 1
    setBaitsSurvived((b) => b + earned)
    setProgress(0)
    setLevelGotchas(0)

    if (levelIndex + 1 >= LEVELS.length) {
      finish({ quit: false, extraBaits: earned })
    } else {
      setLevelIndex(levelIndex + 1)
      setToast({ text: levelGotchas === 0 ? 'clean. suspicious.' : 'level survived', reason: null })
      setTimeout(() => setToast(null), 1200)
    }
  }

  function restart() {
    submitted.current = false
    setPhase('intro')
    setLevelIndex(0)
    setProgress(0)
    setGotchas(0)
    setLevelGotchas(0)
    setBaitsSurvived(0)
    setRageQuit(false)
    setOutcome(null)
  }

  return (
    <div className="gt" ref={stageRef}>
      <div className="gt-hud">
        <div className="gt-hud-side">
          <Avatar profile={victim} size={44} />
          <div>
            <div className="gt-hud-name">{victim.name}</div>
            <div className="gt-hud-role">victim</div>
          </div>
        </div>

        <div className="gt-rage" title="every Gotcha lives on the leaderboard forever">
          <span className="gt-rage-num" key={gotchas}>
            {gotchas}
          </span>
          <span className="gt-rage-label">rage count</span>
          <span className="gt-rage-sub">🛡️ {baitsSurvived} baits survived</span>
        </div>

        <div className="gt-hud-side gt-hud-right">
          <div>
            <div className="gt-hud-name">{opponent.name}</div>
            <div className="gt-hud-role">collecting salt</div>
          </div>
          <Avatar profile={opponent} size={44} />
        </div>
      </div>

      {phase === 'intro' && (
        <div className="gt-panel">
          <h3>{victim.name}, into the mine.</h3>
          <div className="gt-row">
            <span className="gt-pick is-on">
              <Avatar profile={victim} size={40} />
              {victim.name}
              <span className="gt-you">you</span>
            </span>
          </div>
          <p className="gt-fineprint">
            {LEVELS.length} levels. Each one is trivial. Each one is lying. Every Gotcha scores a point for{' '}
            {opponent.name}.
          </p>
          <button className="gt-btn gt-btn-green gt-btn-big" onClick={() => setPhase('playing')}>
            ENTER THE SALT MINE
          </button>
        </div>
      )}

      {phase === 'playing' && level && (
        <>
          <div className="gt-brief">
            <span className="gt-level-tag">
              Level {levelIndex + 1}/{LEVELS.length}
            </span>
            <strong>{level.brief}</strong>
            <span className="muted small">{level.hint}</span>
          </div>

          <Trap
            key={level.id}
            level={level}
            progress={progress}
            onHit={registerHit}
            onGotcha={registerGotcha}
            fx={fx}
          />

          <button
            className={`gt-quit ${rageQuit ? 'is-armed' : ''}`}
            onMouseEnter={() => setRageQuit(true)}
            onMouseLeave={() => setRageQuit(false)}
            onClick={() => finish({ quit: true })}
          >
            😤 RAGE QUIT
            <span>+{RAGE_QUIT_PENALTY} to {opponent.name}. Everyone presses it once.</span>
          </button>
        </>
      )}

      {phase === 'done' && outcome && (
        <div className="gt-panel gt-panel-done">
          <h3>{outcome.quit ? `${victim.name} rage quit 😤` : `${victim.name} escaped the mine 🎉`}</h3>
          <p className="muted">
            {outcome.quit
              ? `${opponent.name} collects ${outcome.gotchaPoints} salt points.`
              : `Survived all ${LEVELS.length} levels. Release granted.`}
          </p>
          <div className="gt-tally">
            <div>
              <strong>{outcome.totalGotchas}</strong>
              <span>Gotchas (forever)</span>
            </div>
            <div>
              <strong>{outcome.survived}</strong>
              <span>Baits survived</span>
            </div>
            <div>
              <strong>{outcome.gotchaPoints}</strong>
              <span>Points to {opponent.name}</span>
            </div>
          </div>
          <button className="gt-btn gt-btn-green" onClick={restart}>
            Again (bad idea)
          </button>
        </div>
      )}

      {toast && (
        <div className="gt-toast">
          <strong>{toast.text}</strong>
          {toast.reason && <span>{toast.reason}</span>}
        </div>
      )}

      {salt.map((b) => (
        <div key={b.id} className="gt-salt" style={{ left: b.x, top: b.y }}>
          {b.grains.map((g) => (
            <span
              key={g.i}
              style={{ '--dx': `${g.dx}px`, '--dy': `${g.dy}px`, '--r': `${g.r}deg` }}
            >
              🧂
            </span>
          ))}
        </div>
      ))}

      <button className="gt-mute" onClick={() => setMuted((m) => !m)} title="toggle noises">
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}
