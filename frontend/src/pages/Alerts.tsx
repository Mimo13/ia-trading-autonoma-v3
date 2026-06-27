import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface Alert {
  id: string
  level: string
  message: string
  acknowledged: boolean
  created_at: string
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])

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
  }

  async function acknowledgeAlert(id: string) {
    await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', id)
    
    loadAlerts()
  }

  const levelConfig: Record<string, { icon: typeof Info; color: string; bgColor: string }> = {
    info: { icon: Info, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
    critical: { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-400/10' }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Alertas</h2>
      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400 border border-slate-700">
            No hay alertas
          </div>
        ) : (
          alerts.map((alert) => {
            const config = levelConfig[alert.level] || levelConfig.info
            const Icon = config.icon
            return (
              <div
                key={alert.id}
                className={`bg-slate-800 rounded-lg p-6 border border-slate-700 ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${config.bgColor} ${config.color} p-2 rounded-lg`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={alert.acknowledged ? 'line-through' : ''}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-sm text-slate-400 hover:text-white px-3 py-1 border border-slate-600 rounded"
                    >
                      Marcar leída
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
