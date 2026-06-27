import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Card, Badge, Button } from '../components/ui'
import { Bot, Settings, Play, Pause, Square, MoreVertical } from 'lucide-react'

interface Strategy {
  id: string
  name: string
  source_type: string
  exchange: string
  pair: string | null
  status: string
  is_paper_trading: boolean
  config: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStrategies()
  }, [])

  async function loadStrategies() {
    const { data } = await supabase
      .from('strategies')
      .select('*')
      .order('created_at', { ascending: false })
    
    setStrategies(data || [])
    setLoading(false)
  }

  const statusConfig: Record<string, { variant: 'success' | 'warning' | 'default' | 'danger'; label: string }> = {
    running: { variant: 'success', label: 'En ejecución' },
    paused: { variant: 'warning', label: 'Pausada' },
    stopped: { variant: 'default', label: 'Detenida' },
    error: { variant: 'danger', label: 'Error' }
  }

  const sourceIcons: Record<string, string> = {
    freqtrade: '🤖',
    grid_bot: '📊',
    manual: '✋'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Estrategias</h2>
        <Button>
          <Bot size={16} className="mr-2" />
          Nueva Estrategia
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bot size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No hay estrategias configuradas</p>
            <Button className="mt-4">Crear primera estrategia</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {strategies.map((strategy) => {
            const status = statusConfig[strategy.status] || statusConfig.paused
            return (
              <Card key={strategy.id} className="hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                      {sourceIcons[strategy.source_type] || '🔧'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">{strategy.source_type}</Badge>
                        <Badge variant="info">{strategy.exchange}</Badge>
                        {strategy.pair && <Badge variant="default">{strategy.pair}</Badge>}
                        {strategy.is_paper_trading && <Badge variant="warning">Paper Trading</Badge>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={status.variant} size="md">{status.label}</Badge>
                    <div className="flex items-center gap-1">
                      {strategy.status === 'running' ? (
                        <Button variant="secondary" size="sm">
                          <Pause size={14} />
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm">
                          <Play size={14} />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Settings size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {strategy.config && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(strategy.config).map(([key, value]) => (
                        <span key={key} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
