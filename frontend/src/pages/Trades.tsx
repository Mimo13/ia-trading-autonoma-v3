import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Card, Badge, Table, Button } from '../components/ui'
import { ArrowUpRight, ArrowDownRight, RefreshCw, Filter } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Trades</h2>
        <div className="flex items-center gap-3">
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
          <Button variant="secondary" onClick={loadTrades}>
            <RefreshCw size={16} className="mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      <Card>
        <Table
          headers={['Par', 'Tipo', 'Cantidad', 'Precio', 'Fee', 'P&L', 'Fecha', 'Estado']}
          isLoading={loading}
          emptyMessage="No hay trades registrados"
        >
          {filteredTrades.map((trade) => (
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
              <td className="p-4 text-slate-300">{trade.amount.toFixed(4)}</td>
              <td className="p-4 text-slate-300">${trade.price.toLocaleString()}</td>
              <td className="p-4 text-slate-400">${trade.fee.toFixed(2)}</td>
              <td className="p-4">
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
          ))}
        </Table>
      </Card>
    </div>
  )
}
