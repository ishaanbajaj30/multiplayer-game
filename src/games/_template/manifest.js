// Copy this folder to src/games/<your-game-id>/ to start a new game.
export const manifest = {
  id: 'my-game', // must match the folder name and be unique
  title: 'My Game',
  description: 'One line of flavour text for the arcade card.',
  icon: '🎲',
  minPlayers: 2,
  maxPlayers: 2,
  createdAt: '2026-01-01', // YYYY-MM-DD; newest games float to the top
  scoring: { win: 10, draw: 4, loss: 1 }, // optional, falls back to DEFAULT_SCORING
}
