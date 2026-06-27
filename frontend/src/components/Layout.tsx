import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { 
  LayoutDashboard, BarChart3, Bot, Brain, Bell, LineChart, Wallet, Settings, 
  Wifi, WifiOff, Menu, X, ChevronRight 
} from 'lucide-react'
import { useSupabase } from '../services/SupabaseProvider'
import { NotificationBell, NotificationPanel } from './Notifications'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const currentPage = navItems.find(item => item.path === location.pathname)

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h1 className="text-xl font-bold text-white">IA Trading</h1>
            <p className="text-sm text-slate-400">Autónoma v3</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={18} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
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
      
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            {currentPage && <currentPage.icon size={18} className="text-blue-400" />}
            <span className="font-medium text-white">
              {currentPage?.label || 'Dashboard'}
            </span>
          </div>
          <NotificationBell onClick={() => setNotificationsOpen(true)} />
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  )
}
