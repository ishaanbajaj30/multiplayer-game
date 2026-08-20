import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AppProvider } from './context/AppContext'
import Arcade from './pages/Arcade'
import GameHost from './pages/GameHost'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'

// HashRouter keeps deep links working on GitHub Pages without a 404 rewrite.
export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Arcade />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/play/:gameId" element={<GameHost />} />
            <Route path="*" element={<Arcade />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
