// ---------------------------------------------------------------------------
// The evil, in data form. One new level per day = one object appended here
// (plus a trap component in ./traps if the mechanic is new).
//
//   trap  — key into TRAPS in ./traps/index.js
//   goal  — how many successful hits the trap must report to clear the level
//   brief — the lie you tell the victim
// Keep the list around 6 levels: the rage is a joke, not a wall.
// ---------------------------------------------------------------------------
export const LEVELS = [
  {
    id: 'runaway',
    trap: 'runaway_button',
    goal: 5,
    brief: 'Click the green button 5 times.',
    hint: 'It is right there. Enormous. Unmissable.',
  },
  {
    id: 'fake-win',
    trap: 'fake_win',
    goal: 1,
    brief: 'Fill the progress bar to 100%.',
    hint: 'Nothing can go wrong with a progress bar.',
  },
  {
    id: 'trust',
    trap: 'trust_fall',
    goal: 4,
    brief: 'Click the button 4 times. No tricks this round.',
    hint: 'Genuinely. No tricks. We would never.',
  },
  {
    id: 'reverse',
    trap: 'reverse_day',
    goal: 5,
    brief: 'Always click the button that is GREEN.',
    hint: 'Labels lie. Colour is truth. Probably.',
  },
  {
    id: 'decoy',
    trap: 'decoy_dot',
    goal: 3,
    brief: 'Press the big obvious button 3 times.',
    hint: 'The biggest button is obviously the button.',
  },
  {
    id: 'jumpscare',
    trap: 'jump_scare',
    goal: 6,
    brief: 'Click 6 times. Ignore any distractions.',
    hint: 'Do not flinch.',
  },
]

export const TAUNTS = [
  'GOTCHA!',
  'lol',
  'skill issue',
  'that was the easy one',
  'salt mined 🧂',
  'she is going to hear about this',
  'documented. permanently.',
  'the leaderboard saw that',
]

export function taunt(index) {
  return TAUNTS[index % TAUNTS.length]
}
