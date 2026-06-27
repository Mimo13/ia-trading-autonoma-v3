import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

interface Stats {
  totalBalance: number
  dailyPnL: number
  totalTrades: number
  activeStrategies: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBalance: 0,
    dailyPnL: 0,
    totalTrades: 0,
    activeStrategies: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { data: balance } = await supabase
      .from('portfolio_snapshots')
      .select('balance_total')
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single()

    const { count: tradesCount } = await supabase
      .from('unified_trades')
      .select('*', { count: 'exact', head: true })

    const { count: strategiesCount } = await supabase
      .from('strategies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'running')

    setStats({
      totalBalance: balance?.balance_total || 0,
      dailyPnL: 0,
      totalTrades: tradesCount || 0,
      activeStrategies: strategiesCount || 0
    })
  }

  const cards = [
    {
      title: 'Balance Total',
      value: `$${stats.totalBalance.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'P&L Diario',
      value: `${stats.dailyPnL >= 0 ? '+' : ''}$${stats.dailyPnL.toLocaleString()}`,
      icon: stats.dailyPnL >= 0 ? TrendingUp : TrendingDown,
      color: stats.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: stats.dailyPnL >= 0 ? 'bg-green-400/10' : 'bg-red-400/10'
    },
    {
      title: 'Total Trades',
      value: stats.totalTrades.toString(),
      icon: Activity,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      title: 'Estrategias Activas',
      value: stats.activeStrategies.toString(),
      icon: Activity,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
