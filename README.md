# 🕹️ Multiplayer Arcade

A private two-player arcade. One global leaderboard, one avatar per player, and a plugin system built so that adding a new mini-game takes about five minutes.

- **Stack:** React + Vite, React Router (HashRouter), Firebase (Firestore + Anonymous Auth), plain CSS.
- **Players:** two fixed seats (`p1`, `p2`). Each device picks which seat it is; that's stored locally.
- **Persistence:** every match is appended to Firestore and folded into aggregate stats inside a transaction, so totals can never be corrupted by both of you finishing games at once.

---

## 1. Local setup

```bash
npm install          # requires Node 18+ (this repo was built on Node 20)
cp .env.example .env # then paste your Firebase config values
npm run dev
```

Open the printed URL. Without a `.env`, the app runs on a **localStorage backend** — fully playable, but nothing syncs between devices. A banner tells you when you're in that mode.

### Plugging in your Firebase config

1. Firebase console → *Project settings* → *Your apps* → **Web app** → copy the `firebaseConfig` object.
2. Fill in `.env` (never committed — it's in `.gitignore`):

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

3. In the console, enable **Authentication → Sign-in method → Anonymous**, and create a **Firestore database**.
4. Restart `npm run dev` (Vite only reads env vars at startup).

> Firebase web config values are identifiers, not secrets — access is controlled by the security rules below. They still live in `.env` so the repo stays clean and you can swap projects.

---

## 2. How to add a new game in 3 steps

**Step 1 — copy the template.**

```bash
cp -r src/games/_template src/games/rock-paper-scissors
```

**Step 2 — fill in the manifest and the component.**

`src/games/rock-paper-scissors/manifest.js`:

```js
export const manifest = {
  id: 'rock-paper-scissors',  // must equal the folder name
  title: 'Rock Paper Scissors',
  description: 'Best of five. No takebacks.',
  icon: '✂️',
  minPlayers: 2,
  maxPlayers: 2,
  createdAt: '2026-08-21',
  scoring: { win: 10, draw: 4, loss: 1 }, // optional
}
```

The component receives exactly three props and calls `onGameEnd` once per finished round:

```jsx
export default function RockPaperScissors({ players, currentUser, onGameEnd }) {
  // players[0] and players[1] are { id, name, avatar }
  // currentUser is whoever this device is signed in as
  onGameEnd({
    winnerId: players[0].id, // or null
    draw: false,             // true for a tie
    scores: { p1: 3, p2: 2 }, // optional, feeds pointsPerScore
    meta: { rounds: 5 },      // optional, stored on the match doc
  })
}
```

`index.js` stays as-is: `export default { manifest, Component }`.

**Pick a `mode`** — the registry rejects anything else:

| `mode` | Meaning | What you write |
|---|---|---|
| `online` | One shared board, both devices, turn-locked | `useGameSession(gameId, makeInitialState)` |
| `solo-vs` | You play alone; the result scores against your partner | plain local state |
| `hotseat` | Both players on one device | plain local state |

For an `online` game, keep all game state in the session and derive the rest:

```jsx
import { useGameSession } from '../../hooks/useGameSession'

const { state, commit, syncing } = useGameSession(manifest.id, () => ({ turn: 'X', board: [] }))
const isMyTurn = state.turn === myMark          // disable your UI when false
await commit({ ...state, board: next, turn: 'O' })  // rejected if they moved first
```

`commit` uses a version check, so a move made against a stale board is refused instead of overwriting your partner. Pass `matchId` to `onGameEnd` (e.g. `` `${manifest.id}-r${round}` ``) so a round reported by both devices only scores once.

**Step 3 — register it.**

`src/games/registry.js` — the only shared file you ever touch:

```js
import ticTacToe from './tic-tac-toe'
import rockPaperScissors from './rock-paper-scissors'   // 1. import

const GAMES = [ticTacToe, rockPaperScissors]            // 2. add
```

Done. The arcade grid, routing (`/#/play/rock-paper-scissors`), leaderboard breakdown, match history and scoring all pick it up automatically. In dev, the registry validates each manifest and throws a clear error if a field or the `Component` export is missing.

---

## 3. Games in the cabinet

### ⭕ Tic-Tac-Toe — `mode: 'online'`
Shared board synced through Firestore: you each play from your own device, and the board is locked when it isn't your turn. Avatars are the X and O seats, with a win-line animation. Rematch starts a new round and alternates who opens. Win 10 / draw 4 / loss 1.

### 🧂 GOTCHA! The Salt Mine — `mode: 'solo-vs'`
An insultingly easy task that betrays you. You are always **the victim** on your own device — you can volunteer yourself, never sign your partner up — and every Gotcha scores for them — and that number is on the leaderboard forever.

- 6 levels, one trick each: **runaway button** (dodges your cursor, gets lazier as you land hits), **fake win** (99% → `lol` → 0, exactly once), **trust fall** (genuinely honest, purely to set up the next level), **reverse day** (labels lie, colour is truth), **decoy** (the huge button is decoration; the real one is 11px in a corner), **jump-scare** (a gentle `WRONG!` flash — clicking mid-flash is flinching).
- Every bait taken = one **Gotcha**: +1 point to the opponent, salt-particle burst, a taunt, and a soft buzz (mutable via 🔊).
- **Baits Survived** is the positive stat to chase: +1 per level cleared, +2 for a clean sweep.
- A deliberately tempting **RAGE QUIT** button ends the round and hands the opponent **+3**.
- The victim always gets release: clear all 6 levels and you win the round outright. The rage is the joke, not a wall.

Scoring: win 8, loss 2, `pointsPerScore: 1` — so the loser's payout literally scales with how much salt they produced.

**Adding an evil level (the daily pipeline):** append one object to `src/games/gotcha-salt-mine/levels.js`. If the mechanic is new, drop a component in `traps/` and add one line to `traps/index.js`. The engine, HUD, scoring and leaderboard never change.

```js
// levels.js
{ id: 'captcha-hell', trap: 'captcha_hell', goal: 3,
  brief: 'Tick the "I am not a robot" box.', hint: 'Trivial.' }
```

Traps all receive the same props: `{ level, progress, onHit(event), onGotcha(reason, { at: event, reset }), fx }`. Call `onHit` when the victim does the right thing, `onGotcha` when they get baited. `fx` gives you `pop / swoosh / buzz / gotcha / win / burst(x, y)`.

---

## 4. Architecture

```
src/
  constants.js              two player seats
  firebase/
    config.js               env-driven config + isFirebaseConfigured
    client.js               app init, offline cache, anonymous sign-in
  backend/                  data layer behind one interface
    firestoreBackend.js     transactional match + leaderboard writes
    localBackend.js         localStorage twin (same API, no sync)
    index.js                picks a backend from the env
  services/
    statsMath.js            pure aggregation (wins/streaks/perGame/h2h)
    scoring.js              result -> points, one pipeline for all games
    profileService.js       seats, names, avatar configs
    leaderboardService.js   standings + match history subscriptions
    matchService.js         submit a finished game
  hooks/                    useProfiles, useLeaderboard, useMatches
  context/AppContext.jsx    auth bootstrap, profiles, "who am I" per device
  avatar/
    parts.jsx               data-driven SVG part catalog (add options here)
    AvatarSvg.jsx           layered renderer
    AvatarStudio.jsx        picker UI generated from the catalog
  components/               Avatar, NavBar, Layout, GameCard, LeaderboardWidget
  pages/                    Arcade, Leaderboard, Profile, GameHost
  games/
    registry.js             <- the one file you edit per new game
    tic-tac-toe/            first plugin
  gotcha-salt-mine/       rage-bait engine: levels.js + traps/ + fx.js
    _template/              copy this to start a game
```

**Why this shape**

- Games never import Firebase. They emit a result; `GameHost` + `matchService` do the writing. Swapping the database later means editing `backend/` only.
- `statsMath.js` is pure and shared by both backends, so Firestore and localStorage can't disagree on how a streak is counted.
- The avatar part catalog is data. Adding a hairstyle means appending one object with a `render()` to `parts.jsx`; the studio UI regenerates itself.

### Data model (Firestore)

| Collection | Doc id | Contents |
|---|---|---|
| `profiles` | `p1`, `p2` | `name`, `avatar` (part config), `createdAt`, `updatedAt` |
| `matches` | auto | `gameId`, `players[]`, `entries[]` (`playerId`, `outcome`, `score`, `points`), `winnerId`, `draw`, `meta`, `playedAt` — **append-only** |
| `sessions` | `<gameId>` | `state` (whatever the game puts there), `version`, `updatedBy`, `updatedAt` — live shared board for online games |
| `leaderboard` | `p1`, `p2` | `games`, `wins`, `losses`, `draws`, `points`, `streak`, `bestStreak`, `counters{}`, `perGame{gameId:{...}}`, `headToHead{opponentId:{...}}`, `lastPlayedAt` |

Every match write is a single Firestore transaction: read both leaderboard docs → create the match doc → write both updated aggregates. Nothing is ever overwritten in `matches`, so the leaderboard can always be rebuilt from history.

### Counters (permanent bragging rights)

Any game can report free-form numeric tallies that live on the leaderboard forever:

```js
onGameEnd({ winnerId, counters: { p2: { gotchas: 9, baitsSurvived: 8 } } })
```

Declare their labels in the manifest and the leaderboard renders them automatically — no page edits:

```js
counters: [
  { key: 'gotchas', label: 'Rage count', icon: '🧂', tone: 'bad' },
  { key: 'baitsSurvived', label: 'Baits survived', icon: '🛡️', tone: 'good' },
]
```

Non-numeric values are dropped, and counters are summed globally *and* per game.

### Scoring

`DEFAULT_SCORING` in `services/scoring.js` — win 10, draw 4, loss 1 (a participation point, because showing up daily counts). A manifest can override any of those, and `pointsPerScore` lets score-based games (say, a reflex game) convert raw score into leaderboard points, so all games feed the same total fairly.

---

## 5. Firestore security rules

Both of you sign in anonymously, so each device gets a stable UID. Open the app once on each device, copy the two UIDs from **Firebase console → Authentication → Users**, paste them into `firestore.rules`, and publish it (paste into console → Firestore → Rules, or `firebase deploy --only firestore:rules`).

```
rules_version = '2';
service cloud.firestore {
  function isUs() {
    return request.auth != null && request.auth.uid in ['PASTE_UID_1', 'PASTE_UID_2'];
  }
  match /databases/{database}/documents {
    match /profiles/{playerId}    { allow read, write: if isUs(); }
    match /leaderboard/{playerId} { allow read, write: if isUs(); }
    match /sessions/{gameId}      { allow read, write: if isUs(); }
    match /matches/{matchId} {
      allow read, create: if isUs();
      allow update, delete: if false;   // history is append-only
    }
  }
}
```

If you add a third device (new phone, reinstall), its anonymous UID will be new — add it to the list. A looser starting point while you're setting up is `allow read, write: if request.auth != null;`, but tighten it to the UID list once both of you are in.

---

## 6. Deploy to GitHub Pages

1. Set `homepage` in `package.json` and the `base` in `vite.config.js` to match your repo name (default: `/multiplayer-game/`).
2. Push the repo to GitHub.
3. Deploy:

```bash
npm run deploy      # builds, then pushes dist/ to the gh-pages branch
```

4. GitHub repo → *Settings* → *Pages* → source **Deploy from a branch**, branch **gh-pages**, folder **/ (root)**.

Live at `https://<user>.github.io/multiplayer-game/`. The app uses `HashRouter`, so deep links like `/#/leaderboard` work without any 404 rewrite hack.

> `npm run deploy` builds from your local `.env`, which means the Firebase config is baked into the published JS. That's expected for Firebase web apps — the security rules are what keep the data yours.

---

## 7. Daily-game checklist

- `cp -r src/games/_template src/games/<id>`
- fill manifest (`id`, `createdAt` = today) and write the component
- import + add to `GAMES` in `src/games/registry.js`
- `npm run dev`, play one round, confirm it shows up in the leaderboard breakdown
- `npm run deploy`
