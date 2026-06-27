import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BarChart3, Bot, Brain, Bell, LineChart, Wallet, Settings, Wifi, WifiOff } from 'lucide-react'
import { useSupabase } from '../services/SupabaseProvider'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/portfolio', label: 'Portfolio', icon: Wallet },
  { path: '/trades', label: 'Trades', icon: BarChart3 },
  { path: '/strategies', label: 'Estrategias', icon: Bot },
  { path: '/signals', label: 'Señales IA', icon: Brain },
  { path: '/alerts', label: 'Alertas', icon: Bell },
  { path: '/charts', label: 'Gráficos', icon: LineChart },
  { path: '/settings', label: 'Configuración', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const { isConnected, isLoading } = useSupabase()

  return (
    <div className="flex h-screen bg-slate-900">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">IA Trading</h1>
          <p className="text-sm text-slate-400">Autónoma v3</p>
        </div>
        
        <nav className="flex-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-sm">
            {isLoading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
                Conectando...
              </div>
            ) : isConnected ? (
              <div className="flex items-center gap-2 text-green-400">
                <Wifi size={14} />
                Conectado
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <WifiOff size={14} />
                Desconectado
              </div>
            )}
          </div>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
