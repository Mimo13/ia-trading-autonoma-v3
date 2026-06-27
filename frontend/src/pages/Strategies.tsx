import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Play, Pause, Square } from 'lucide-react'

interface Strategy {
  id: string
  name: string
  source_type: string
  exchange: string
  pair: string | null
  status: string
  is_paper_trading: boolean
}

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])

  useEffect(() => {
    loadStrategies()
  }, [])

  async function loadStrategies() {
    const { data } = await supabase
      .from('strategies')
      .select('*')
      .order('created_at', { ascending: false })
    
    setStrategies(data || [])
  }

  const statusColors: Record<string, string> = {
    running: 'bg-green-400/20 text-green-400',
    paused: 'bg-yellow-400/20 text-yellow-400',
    stopped: 'bg-slate-400/20 text-slate-400',
    error: 'bg-red-400/20 text-red-400'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Estrategias</h2>
      <div className="grid gap-4">
        {strategies.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400 border border-slate-700">
            No hay estrategias configuradas
          </div>
        ) : (
          strategies.map((strategy) => (
            <div key={strategy.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{strategy.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-slate-700 rounded">
                      {strategy.source_type}
                    </span>
                    <span className="text-xs px-2 py-1 bg-slate-700 rounded">
                      {strategy.exchange}
                    </span>
                    {strategy.pair && (
                      <span className="text-xs px-2 py-1 bg-slate-700 rounded">
                        {strategy.pair}
                      </span>
                    )}
                    {strategy.is_paper_trading && (
                      <span className="text-xs px-2 py-1 bg-blue-400/20 text-blue-400 rounded">
                        Paper Trading
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[strategy.status]}`}>
                    {strategy.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
