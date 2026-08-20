// The arcade is intentionally a two-seat cabinet: two fixed player slots.
// Everything else (names, avatars) is editable in the Avatar Studio.
export const PLAYER_SLOTS = [
  { id: 'p1', defaultName: 'Player One' },
  { id: 'p2', defaultName: 'Player Two' },
]

export const PLAYER_IDS = PLAYER_SLOTS.map((s) => s.id)
