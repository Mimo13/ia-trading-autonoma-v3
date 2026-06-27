import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SupabaseProvider } from './services/SupabaseProvider'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Trades from './pages/Trades'
import Strategies from './pages/Strategies'
import Signals from './pages/Signals'
import Alerts from './pages/Alerts'
import Charts from './pages/Charts'
import Portfolio from './pages/Portfolio'
import Settings from './pages/Settings'

function App() {
  return (
    <SupabaseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="trades" element={<Trades />} />
            <Route path="strategies" element={<Strategies />} />
            <Route path="signals" element={<Signals />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="charts" element={<Charts />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SupabaseProvider>
  )
}

export default App
