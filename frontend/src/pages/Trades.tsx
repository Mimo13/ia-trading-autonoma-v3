import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

interface Trade {
  id: string
  pair: string
  side: string
  amount: number
  price: number
  profit_abs: number | null
  profit_pct: number | null
  opened_at: string
  closed_at: string | null
}

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrades()
  }, [])

  async function loadTrades() {
    const { data } = await supabase
      .from('unified_trades')
      .select('*')
      .order('opened_at', { ascending: false })
      .limit(100)
    
    setTrades(data || [])
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Trades</h2>
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-4 text-sm text-slate-400">Par</th>
              <th className="text-left p-4 text-sm text-slate-400">Tipo</th>
              <th className="text-right p-4 text-sm text-slate-400">Cantidad</th>
              <th className="text-right p-4 text-sm text-slate-400">Precio</th>
              <th className="text-right p-4 text-sm text-slate-400">P&L</th>
              <th className="text-left p-4 text-sm text-slate-400">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No hay trades registrados
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <tr key={trade.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-4 font-medium">{trade.pair}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.side === 'buy' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                    }`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">{trade.amount}</td>
                  <td className="p-4 text-right">${trade.price.toLocaleString()}</td>
                  <td className={`p-4 text-right font-medium ${
                    (trade.profit_abs || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.profit_abs !== null ? `$${trade.profit_abs.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(trade.opened_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
