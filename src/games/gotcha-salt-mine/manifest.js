export const manifest = {
  id: 'gotcha-salt-mine',
  title: 'GOTCHA! The Salt Mine',
  description: 'An insultingly easy task that fights back. Every Gotcha is on the leaderboard forever.',
  icon: '🧂',
  minPlayers: 2,
  maxPlayers: 2,
  createdAt: '2026-08-20',
  // 'solo-vs' = you play alone on your device; the result scores against your
  // partner. No shared board, so no turn syncing needed.
  mode: 'solo-vs',
  // Surviving the mine is worth a flat win; the loser's payout scales with how
  // many times they got baited, so rage literally feeds the opponent's score.
  scoring: { win: 8, draw: 0, loss: 2, pointsPerScore: 1 },
  // Permanent bragging/shame tallies. Any game can declare counters; the
  // leaderboard renders whatever it finds.
  counters: [
    { key: 'gotchas', label: 'Rage count', icon: '🧂', tone: 'bad' },
    { key: 'baitsSurvived', label: 'Baits survived', icon: '🛡️', tone: 'good' },
    { key: 'rageQuits', label: 'Rage quits', icon: '😤', tone: 'bad' },
    { key: 'gotchasCaused', label: 'Gotchas caused', icon: '😈', tone: 'good' },
  ],
}
