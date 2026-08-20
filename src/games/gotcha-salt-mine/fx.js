// Silly noises + salt bursts. WebAudio only, so there are no asset files and
// nothing to load. Muting is respected everywhere.

let ctx = null

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq, type = 'square', duration = 0.12, gain = 0.05, slide = 0 }) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime)
  if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, ac.currentTime + duration)
  amp.gain.setValueAtTime(gain, ac.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
  osc.connect(amp).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

/**
 * @param {object} opts
 * @param {() => boolean} opts.muted   read the current mute state
 * @param {(x:number,y:number)=>void} opts.burst  spawn salt particles
 */
export function createFx({ muted, burst }) {
  const guard = (fn) => (...args) => {
    if (!muted()) fn(...args)
  }
  return {
    pop: guard(() => tone({ freq: 660, type: 'triangle', duration: 0.07, gain: 0.04 })),
    swoosh: guard(() => tone({ freq: 380, type: 'sine', duration: 0.09, gain: 0.03, slide: 260 })),
    buzz: guard(() => tone({ freq: 110, type: 'sawtooth', duration: 0.22, gain: 0.05, slide: -50 })),
    gotcha: guard(() => {
      tone({ freq: 180, type: 'sawtooth', duration: 0.18, gain: 0.06, slide: -110 })
      setTimeout(() => tone({ freq: 120, type: 'square', duration: 0.22, gain: 0.05, slide: -60 }), 110)
    }),
    win: guard(() => {
      ;[523, 659, 784, 1046].forEach((f, i) =>
        setTimeout(() => tone({ freq: f, type: 'triangle', duration: 0.14, gain: 0.045 }), i * 90),
      )
    }),
    burst,
  }
}
