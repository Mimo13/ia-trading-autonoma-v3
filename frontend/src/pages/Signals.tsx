import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

interface Signal {
  id: string
  pair: string
  signal_type: string
  confidence: number | null
  model_name: string | null
  reasoning: string | null
  executed: boolean
  created_at: string
}

export default function Signals() {
  const [signals, setSignals] = useState<Signal[]>([])

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
  }

  const signalColors: Record<string, string> = {
    buy: 'bg-green-400/20 text-green-400',
    sell: 'bg-red-400/20 text-red-400',
    hold: 'bg-yellow-400/20 text-yellow-400',
    force_action: 'bg-purple-400/20 text-purple-400'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Señales IA</h2>
      <div className="grid gap-4">
        {signals.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400 border border-slate-700">
            No hay señales registradas
          </div>
        ) : (
          signals.map((signal) => (
            <div key={signal.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{signal.pair}</span>
                    <span className={`px-2 py-1 rounded text-sm ${signalColors[signal.signal_type]}`}>
                      {signal.signal_type.toUpperCase()}
                    </span>
                    {signal.executed && (
                      <span className="text-xs px-2 py-1 bg-blue-400/20 text-blue-400 rounded">
                        Ejecutada
                      </span>
                    )}
                  </div>
                  {signal.model_name && (
                    <p className="text-sm text-slate-400 mt-1">Modelo: {signal.model_name}</p>
                  )}
                  {signal.reasoning && (
                    <p className="text-sm text-slate-300 mt-2">{signal.reasoning}</p>
                  )}
                </div>
                <div className="text-right">
                  {signal.confidence !== null && (
                    <div>
                      <p className="text-sm text-slate-400">Confianza</p>
                      <p className="text-lg font-semibold">{(signal.confidence * 100).toFixed(1)}%</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(signal.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
