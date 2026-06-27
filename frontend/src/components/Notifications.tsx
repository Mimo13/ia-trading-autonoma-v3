import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { X, Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface Notification {
  id: string
  level: 'info' | 'warning' | 'critical'
  message: string
  timestamp: Date
  read: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000)
    
    return () => clearInterval(interval)
  }, [])

  async function loadNotifications() {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('acknowledged', false)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      const formatted = data.map(n => ({
        id: n.id,
        level: n.level as 'info' | 'warning' | 'critical',
        message: n.message,
        timestamp: new Date(n.created_at),
        read: false
      }))
      setNotifications(formatted)
      setUnreadCount(formatted.length)
    }
  }

  const markAsRead = async (id: string) => {
    await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', id)
    
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const clearAll = async () => {
    const ids = notifications.map(n => n.id)
    await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .in('id', ids)
    
    setNotifications([])
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAsRead, clearAll }
}

interface NotificationBellProps {
  onClick: () => void
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { unreadCount } = useNotifications()

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-slate-400 hover:text-white transition-colors"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, clearAll } = useNotifications()

  const levelConfig = {
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2">
      <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-800 border-l border-slate-700 lg:relative lg:w-96 lg:rounded-lg lg:border lg:shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-semibold text-white">Notificaciones</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="text-sm text-slate-400 hover:text-white"
            >
              Limpiar todo
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-8rem)] lg:max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {notifications.map((notification) => {
                const config = levelConfig[notification.level]
                const Icon = config.icon
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-700/50 transition-colors ${
                      notification.read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`${config.bg} ${config.color} p-2 rounded-lg flex-shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0"
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
