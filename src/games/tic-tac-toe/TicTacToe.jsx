import { useCallback, useEffect, useMemo, useRef } from 'react'
import Avatar from '../../components/Avatar'
import { useGameSession } from '../../hooks/useGameSession'
import { manifest } from './manifest'
import './styles.css'

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

const CELL = 100
const center = (i) => [(i % 3) * CELL + CELL / 2, Math.floor(i / 3) * CELL + CELL / 2]

function findWin(board) {
  for (const line of LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { mark: board[a], line }
  }
  return null
}

/**
 * Board state lives in Firestore, so both devices see the same game and only
 * the player whose turn it is can move. Round 1 starts with X; the starting
 * mark alternates each round.
 */
export default function TicTacToe({ players, currentUser, onGameEnd }) {
  const marks = useMemo(() => ({ X: players[0], O: players[1] }), [players])
  const seatOf = useCallback((mark) => marks[mark]?.id, [marks])

  const makeInitialState = useCallback(
    () => ({ board: Array(9).fill(null), turn: 'X', round: 1, endedAt: null }),
    [],
  )

  const { state, loading, syncing, commit, error } = useGameSession(manifest.id, makeInitialState)
  const reported = useRef(null)

  const board = state?.board || null
  const win = useMemo(() => (board ? findWin(board) : null), [board])
  const full = Boolean(board) && board.every(Boolean)
  const over = Boolean(win) || full

  const myMark =
    players[0]?.id === currentUser?.id ? 'X' : players[1]?.id === currentUser?.id ? 'O' : null

  // The player who completed the round reports it — they are the one whose mark
  // is no longer to move. The match id is derived from the round, so a
  // duplicate report from the other device scores nothing.
  useEffect(() => {
    if (!state || !over || !myMark) return
    if (reported.current === state.round) return
    if (state.turn === myMark) return // opponent made the closing move
    reported.current = state.round
    onGameEnd({
      winnerId: win ? seatOf(win.mark) : null,
      draw: !win && full,
      matchId: `${manifest.id}-r${state.round}`,
      meta: { board, round: state.round, moves: board.filter(Boolean).length },
    })
  }, [state, over, myMark, win, full, board, seatOf, onGameEnd])

  if (loading || !state) return <p className="muted">Syncing the board…</p>

  const isMyTurn = Boolean(myMark) && myMark === state.turn && !over
  const turnProfile = marks[state.turn]
  const winnerProfile = win ? marks[win.mark] : null

  async function play(i) {
    if (board[i] || over || !isMyTurn || syncing) return
    const next = board.slice()
    next[i] = myMark
    await commit({ ...state, board: next, turn: myMark === 'X' ? 'O' : 'X' })
  }

  async function rematch() {
    const round = state.round + 1
    await commit({
      board: Array(9).fill(null),
      turn: round % 2 === 1 ? 'X' : 'O', // alternate who opens
      round,
      endedAt: null,
    })
  }

  const linePath = win
    ? (() => {
        const [x1, y1] = center(win.line[0])
        const [x2, y2] = center(win.line[2])
        return { x1, y1, x2, y2 }
      })()
    : null

  return (
    <div className="ttt">
      <div className="ttt-seats">
        {['X', 'O'].map((mark) => {
          const p = marks[mark]
          const active = !over && mark === state.turn
          return (
            <div key={mark} className={`ttt-seat ${active ? 'is-active' : ''}`}>
              <Avatar profile={p} size={56} ring={active ? 'var(--accent)' : null} />
              <div>
                <div className="ttt-seat-name">
                  {p?.name}
                  {currentUser?.id === p?.id && <span className="ttt-you">you</span>}
                </div>
                <div className="ttt-seat-mark">plays {mark}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="ttt-status">
        {win && <>🎉 {winnerProfile?.name} takes it</>}
        {!win && full && <>🤝 Dead heat</>}
        {!over && (isMyTurn ? <>Your move</> : <>Waiting for {turnProfile?.name}…</>)}
      </div>

      <div className={`ttt-board-wrap ${!isMyTurn && !over ? 'is-locked' : ''}`}>
        <div className="ttt-board">
          {board.map((cell, i) => (
            <button
              key={i}
              className={`ttt-cell ${cell ? `is-${cell.toLowerCase()}` : ''} ${
                win && win.line.includes(i) ? 'is-win' : ''
              }`}
              onClick={() => play(i)}
              disabled={Boolean(cell) || over || !isMyTurn}
              aria-label={`cell ${i + 1}${cell ? `, ${cell}` : ''}`}
            >
              {cell}
            </button>
          ))}
        </div>
        {linePath && (
          <svg className="ttt-winline" viewBox="0 0 300 300" aria-hidden="true">
            <line x1={linePath.x1} y1={linePath.y1} x2={linePath.x2} y2={linePath.y2} />
          </svg>
        )}
      </div>

      {!myMark && <p className="muted small">You are not seated in this match.</p>}
      {error && <p className="banner banner-error">Sync issue: {String(error.message || error)}</p>}

      {over && (
        <button className="btn btn-primary" onClick={rematch} disabled={syncing}>
          Rematch (round {state.round + 1})
        </button>
      )}
    </div>
  )
}
