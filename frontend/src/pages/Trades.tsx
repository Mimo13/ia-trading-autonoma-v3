import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Card, Badge, Button } from '../components/ui'
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'

interface Trade {
  id: string
  pair: string
  side: string
  amount: number
  price: number
  fee: number
  profit_abs: number | null
  profit_pct: number | null
  opened_at: string
  closed_at: string | null
  is_paper_trading: boolean
}

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')

  useEffect(() => {
    loadTrades()
  }, [])

  async function loadTrades() {
    setLoading(true)
    const { data } = await supabase
      .from('unified_trades')
      .select('*')
      .order('opened_at', { ascending: false })
      .limit(100)
    
    setTrades(data || [])
    setLoading(false)
  }

  const filteredTrades = filter === 'all' 
    ? trades 
    : trades.filter(t => t.side === filter)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">Trades</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            {(['all', 'buy', 'sell'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'buy' ? 'Compras' : 'Ventas'}
              </button>
            ))}
          </div>
          <Button variant="secondary" onClick={loadTrades} size="sm">
            <RefreshCw size={14} className="mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-20 bg-slate-700 rounded" />
              </Card>
            ))}
          </div>
        ) : filteredTrades.length === 0 ? (
          <Card>
            <p className="text-center text-slate-400 py-4">No hay trades registrados</p>
          </Card>
        ) : (
          filteredTrades.map((trade) => (
            <Card key={trade.id} className="hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    trade.side === 'buy' ? 'bg-green-400/20' : 'bg-red-400/20'
                  }`}>
                    {trade.side === 'buy' ? (
                      <ArrowUpRight size={18} className="text-green-400" />
                    ) : (
                      <ArrowDownRight size={18} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{trade.pair}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(trade.opened_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={trade.side === 'buy' ? 'success' : 'danger'}>
                    {trade.side.toUpperCase()}
                  </Badge>
                  {trade.profit_abs !== null && (
                    <p className={`text-sm font-medium mt-1 ${
                      trade.profit_abs >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.profit_abs >= 0 ? '+' : ''}${trade.profit_abs.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-slate-700 text-sm">
                <span className="text-slate-400">Precio: ${trade.price.toLocaleString()}</span>
                <span className="text-slate-400">Cant: {trade.amount.toFixed(4)}</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Par</th>
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Tipo</th>
                  <th className="text-right p-4 text-sm text-slate-400 font-medium">Cantidad</th>
                  <th className="text-right p-4 text-sm text-slate-400 font-medium">Precio</th>
                  <th className="text-right p-4 text-sm text-slate-400 font-medium">Fee</th>
                  <th className="text-right p-4 text-sm text-slate-400 font-medium">P&L</th>
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Fecha</th>
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Cargando...
                    </td>
                  </tr>
                ) : filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No hay trades registrados
                    </td>
                  </tr>
                ) : (
                  filteredTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                      <td className="p-4">
                        <span className="font-medium text-white">{trade.pair}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={trade.side === 'buy' ? 'success' : 'danger'}>
                          <span className="flex items-center gap-1">
                            {trade.side === 'buy' ? (
                              <ArrowUpRight size={12} />
                            ) : (
                              <ArrowDownRight size={12} />
                            )}
                            {trade.side.toUpperCase()}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-slate-300">{trade.amount.toFixed(4)}</td>
                      <td className="p-4 text-right text-slate-300">${trade.price.toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-400">${trade.fee.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        {trade.profit_abs !== null ? (
                          <span className={`font-medium ${
                            trade.profit_abs >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {trade.profit_abs >= 0 ? '+' : ''}${trade.profit_abs.toFixed(2)}
                            {trade.profit_pct !== null && (
                              <span className="text-xs ml-1">({trade.profit_pct.toFixed(1)}%)</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(trade.opened_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Badge variant={trade.closed_at ? 'default' : 'info'}>
                          {trade.closed_at ? 'Cerrado' : 'Abierto'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
