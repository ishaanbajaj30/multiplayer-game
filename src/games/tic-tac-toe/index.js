import { manifest } from './manifest'
import TicTacToe from './TicTacToe'

// Every game module exports the same shape: { manifest, Component }.
export default { manifest, Component: TicTacToe }
