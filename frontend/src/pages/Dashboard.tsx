import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Activity, Bot, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { supabase } from '../services/supabase'
import { StatCard, Card, Badge } from '../components/ui'

interface Stats {
  totalBalance: number
  dailyPnL: number
  dailyPnLPercent: number
  totalTrades: number
  activeStrategies: number
  winRate: number
}

interface RecentTrade {
  id: string
  pair: string
  side: string
  profit_abs: number | null
  opened_at: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBalance: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0,
    totalTrades: 0,
    activeStrategies: 0,
    winRate: 0
  })
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      const [balanceRes, tradesRes, strategiesRes, recentTradesRes] = await Promise.all([
        supabase
          .from('portfolio_snapshots')
          .select('balance_total, balance_free, balance_used')
          .order('snapshot_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('unified_trades')
          .select('id, profit_abs, profit_pct', { count: 'exact' }),
        supabase
          .from('strategies')
          .select('id', { count: 'exact' })
          .eq('status', 'running'),
        supabase
          .from('unified_trades')
          .select('id, pair, side, profit_abs, opened_at')
          .order('opened_at', { ascending: false })
          .limit(5)
      ])

      const trades = tradesRes.data || []
      const totalProfit = trades.reduce((sum, t) => sum + (t.profit_abs || 0), 0)
      const winningTrades = trades.filter(t => (t.profit_abs || 0) > 0).length
      const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0

      setStats({
        totalBalance: balanceRes.data?.balance_total || 0,
        dailyPnL: totalProfit,
        dailyPnLPercent: trades.length > 0 ? totalProfit / (balanceRes.data?.balance_total || 1) * 100 : 0,
        totalTrades: tradesRes.count || 0,
        activeStrategies: strategiesRes.count || 0,
        winRate
      })

      setRecentTrades(recentTradesRes.data || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-slate-400">En línea</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Balance Total"
          value={`$${stats.totalBalance.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          trend="neutral"
        />
        <StatCard
          title="P&L Total"
          value={`${stats.dailyPnL >= 0 ? '+' : ''}$${stats.dailyPnL.toFixed(2)}`}
          change={stats.dailyPnLPercent}
          icon={stats.dailyPnL >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
          trend={stats.dailyPnL >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Total Trades"
          value={stats.totalTrades}
          icon={<Activity size={24} />}
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          icon={<TrendingUp size={24} />}
          trend={stats.winRate >= 50 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Estrategias Activas" subtitle={`${stats.activeStrategies} en ejecución`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-blue-400" />
                <div>
                  <p className="font-medium text-white">FreqAI Main</p>
                  <p className="text-sm text-slate-400">Multi-pair • 5m</p>
                </div>
              </div>
              <Badge variant="warning">Paused</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-purple-400" />
                <div>
                  <p className="font-medium text-white">Grid SOL/USDT</p>
                  <p className="text-sm text-slate-400">SOL/USDT • Grid</p>
                </div>
              </div>
              <Badge variant="warning">Paused</Badge>
            </div>
          </div>
        </Card>

        <Card title="Últimos Trades" subtitle="Operaciones recientes">
          <div className="space-y-3">
            {recentTrades.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No hay trades registrados</p>
            ) : (
              recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      trade.side === 'buy' ? 'bg-green-400/20' : 'bg-red-400/20'
                    }`}>
                      {trade.side === 'buy' ? (
                        <ArrowUpRight size={16} className="text-green-400" />
                      ) : (
                        <ArrowDownRight size={16} className="text-red-400" />
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
                    <p className={`font-medium ${
                      (trade.profit_abs || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.profit_abs !== null ? `$${trade.profit_abs.toFixed(2)}` : '-'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
