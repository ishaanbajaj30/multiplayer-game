import { useMemo, useState } from 'react'
import Avatar from '../../components/Avatar'
import './styles.css'

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

// Endpoint coordinates (in a 300x300 board space) for the win-line animation.
const CELL = 100
const center = (i) => [(i % 3) * CELL + CELL / 2, Math.floor(i / 3) * CELL + CELL / 2]

function findWin(board) {
  for (const line of LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line }
    }
  }
  return null
}

export default function TicTacToe({ players, currentUser, onGameEnd }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const marks = useMemo(() => ({ X: players[0], O: players[1] }), [players])
  const win = useMemo(() => findWin(board), [board])
  const full = board.every(Boolean)
  const over = Boolean(win) || full

  function play(i) {
    if (board[i] || over) return
    const next = board.slice()
    next[i] = xIsNext ? 'X' : 'O'
    setBoard(next)
    setXIsNext(!xIsNext)

    const result = findWin(next)
    const isDraw = !result && next.every(Boolean)
    if ((result || isDraw) && !submitted) {
      setSubmitted(true)
      onGameEnd({
        winnerId: result ? marks[result.mark].id : null,
        draw: isDraw,
        meta: { board: next, moves: next.filter(Boolean).length },
      })
    }
  }

  function rematch() {
    setBoard(Array(9).fill(null))
    setXIsNext(true)
    setSubmitted(false)
  }

  const turnProfile = xIsNext ? marks.X : marks.O
  const winnerProfile = win ? marks[win.mark] : null

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
          const active = !over && (mark === 'X') === xIsNext
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
        {!over && <>{turnProfile?.name}&rsquo;s turn</>}
      </div>

      <div className="ttt-board-wrap">
        <div className="ttt-board">
          {board.map((cell, i) => (
            <button
              key={i}
              className={`ttt-cell ${cell ? `is-${cell.toLowerCase()}` : ''} ${
                win && win.line.includes(i) ? 'is-win' : ''
              }`}
              onClick={() => play(i)}
              disabled={Boolean(cell) || over}
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

      {over && (
        <button className="btn btn-primary" onClick={rematch}>
          Rematch
        </button>
      )}
    </div>
  )
}
