import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Card, Badge } from '../components/ui'
import { Brain, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react'

interface Signal {
  id: string
  pair: string
  signal_type: string
  confidence: number | null
  model_name: string | null
  features: Record<string, unknown> | null
  reasoning: string | null
  executed: boolean
  created_at: string
}

export default function Signals() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSignals()
  }, [])

  async function loadSignals() {
    const { data } = await supabase
      .from('ai_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    setSignals(data || [])
    setLoading(false)
  }

  const signalConfig: Record<string, { icon: typeof Brain; color: string; bgColor: string; label: string }> = {
    buy: { icon: TrendingUp, color: 'text-green-400', bgColor: 'bg-green-400/10', label: 'COMPRA' },
    sell: { icon: TrendingDown, color: 'text-red-400', bgColor: 'bg-red-400/10', label: 'VENTA' },
    hold: { icon: Minus, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', label: 'MANTENER' },
    force_action: { icon: Zap, color: 'text-purple-400', bgColor: 'bg-purple-400/10', label: 'ACCIÓN FORZADA' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Señales IA</h2>
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-purple-400" />
          <span className="text-sm text-slate-400">{signals.length} señales</span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      ) : signals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Brain size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No hay señales registradas</p>
            <p className="text-sm text-slate-500 mt-2">
              Las señales aparecerán cuando FreqAI genere predicciones
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {signals.map((signal) => {
            const config = signalConfig[signal.signal_type] || signalConfig.hold
            const Icon = config.icon
            return (
              <Card key={signal.id} className="hover:border-slate-600 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`${config.bgColor} ${config.color} p-3 rounded-lg`}>
                    <Icon size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg text-white">{signal.pair}</span>
                      <Badge variant={signal.signal_type === 'buy' ? 'success' : signal.signal_type === 'sell' ? 'danger' : 'warning'}>
                        {config.label}
                      </Badge>
                      {signal.executed && (
                        <Badge variant="info">Ejecutada</Badge>
                      )}
                    </div>
                    
                    {signal.model_name && (
                      <p className="text-sm text-slate-400 mb-2">
                        Modelo: <span className="text-slate-300">{signal.model_name}</span>
                      </p>
                    )}
                    
                    {signal.reasoning && (
                      <p className="text-sm text-slate-300 bg-slate-700/50 p-3 rounded-lg">
                        {signal.reasoning}
                      </p>
                    )}
                    
                    {signal.features && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(signal.features).slice(0, 5).map(([key, value]) => (
                          <span key={key} className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">
                            {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    {signal.confidence !== null && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-400">Confianza</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                signal.confidence > 0.7 ? 'bg-green-400' : 
                                signal.confidence > 0.4 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${signal.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white">
                            {(signal.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-slate-500">
                      {new Date(signal.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
