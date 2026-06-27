import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BarChart3, Bot, Brain, Bell } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/trades', label: 'Trades', icon: BarChart3 },
  { path: '/strategies', label: 'Estrategias', icon: Bot },
  { path: '/signals', label: 'Señales IA', icon: Brain },
  { path: '/alerts', label: 'Alertas', icon: Bell },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">IA Trading</h1>
          <p className="text-sm text-slate-400">Autónoma v3</p>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
