import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Card, Badge, Button } from '../components/ui'
import { Bell, AlertTriangle, AlertCircle, Info, Check, Filter } from 'lucide-react'

interface Alert {
  id: string
  level: string
  message: string
  acknowledged: boolean
  created_at: string
  strategy_id: string | null
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')

  useEffect(() => {
    loadAlerts()
  }, [])

  async function loadAlerts() {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    setAlerts(data || [])
    setLoading(false)
  }

  async function acknowledgeAlert(id: string) {
    await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', id)
    
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const levelConfig: Record<string, { icon: typeof Info; variant: 'info' | 'warning' | 'danger'; label: string }> = {
    info: { icon: Info, variant: 'info', label: 'Información' },
    warning: { icon: AlertTriangle, variant: 'warning', label: 'Advertencia' },
    critical: { icon: AlertCircle, variant: 'danger', label: 'Crítico' }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.acknowledged
    if (filter === 'critical') return alert.level === 'critical'
    return true
  })

  const unreadCount = alerts.filter(a => !a.acknowledged).length
  const criticalCount = alerts.filter(a => a.level === 'critical' && !a.acknowledged).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Alertas</h2>
          <p className="text-sm text-slate-400 mt-1">
            {unreadCount} sin leer • {criticalCount} críticas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            {(['all', 'unread', 'critical'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'unread' ? 'Sin leer' : 'Críticas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-16 bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">
              {filter === 'unread' ? 'No hay alertas sin leer' : 
               filter === 'critical' ? 'No hay alertas críticas' : 
               'No hay alertas'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAlerts.map((alert) => {
            const config = levelConfig[alert.level] || levelConfig.info
            const Icon = config.icon
            return (
              <Card 
                key={alert.id} 
                className={`transition-colors ${
                  alert.acknowledged ? 'opacity-60' : 'hover:border-slate-600'
                } ${alert.level === 'critical' && !alert.acknowledged ? 'border-red-500/50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    alert.level === 'critical' ? 'bg-red-400/10 text-red-400' :
                    alert.level === 'warning' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-blue-400/10 text-blue-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={config.variant}>{config.label}</Badge>
                      {alert.acknowledged && <Badge variant="default">Leída</Badge>}
                    </div>
                    <p className={`text-slate-200 ${alert.acknowledged ? 'line-through' : ''}`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  {!alert.acknowledged && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <Check size={14} className="mr-1" />
                      Marcar leída
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
