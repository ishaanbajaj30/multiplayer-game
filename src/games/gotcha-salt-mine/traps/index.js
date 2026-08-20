import RunawayButton from './RunawayButton'
import FakeWin from './FakeWin'
import TrustFall from './TrustFall'
import ReverseDay from './ReverseDay'
import DecoyDot from './DecoyDot'
import JumpScare from './JumpScare'

// Trap registry. A new mechanic = one component + one line here + one level
// object in ../levels.js. The engine never changes.
//
// Every trap gets the same props:
//   level, progress, onHit(event), onGotcha(reason, { at: event }), fx
export const TRAPS = {
  runaway_button: RunawayButton,
  fake_win: FakeWin,
  trust_fall: TrustFall,
  reverse_day: ReverseDay,
  decoy_dot: DecoyDot,
  jump_scare: JumpScare,
}
