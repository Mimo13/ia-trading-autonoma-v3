import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Card, StatCard, Badge } from '../components/ui'
import { DollarSign, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { 
  AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

interface PortfolioStats {
  totalBalance: number
  balanceFree: number
  balanceUsed: number
  totalProfit: number
  profitPercent: number
  bestPair: string
  worstPair: string
}

interface AssetAllocation {
  name: string
  value: number
  color: string
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Portfolio() {
  const [stats, setStats] = useState<PortfolioStats>({
    totalBalance: 0,
    balanceFree: 0,
    balanceUsed: 0,
    totalProfit: 0,
    profitPercent: 0,
    bestPair: '-',
    worstPair: '-'
  })
  const [balanceHistory, setBalanceHistory] = useState<any[]>([])
  const [allocation, setAllocation] = useState<AssetAllocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolioData()
  }, [])

  async function loadPortfolioData() {
    try {
      // Load latest balance
      const { data: snapshot } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .order('snapshot_at', { ascending: false })
        .limit(1)
        .single()

      // Load balance history
      const { data: history } = await supabase
        .from('portfolio_snapshots')
        .select('balance_total, balance_free, balance_used, snapshot_at')
        .order('snapshot_at', { ascending: true })
        .limit(30)

      // Load trades for profit calculation
      const { data: trades } = await supabase
        .from('unified_trades')
        .select('pair, profit_abs')
        .not('profit_abs', 'is', null)

      // Calculate pair performance
      const pairProfits: Record<string, number> = {}
      trades?.forEach(t => {
        pairProfits[t.pair] = (pairProfits[t.pair] || 0) + (t.profit_abs || 0)
      })

      const sortedPairs = Object.entries(pairProfits).sort((a, b) => b[1] - a[1])
      const bestPair = sortedPairs[0]?.[0] || '-'
      const worstPair = sortedPairs[sortedPairs.length - 1]?.[0] || '-'
      const totalProfit = trades?.reduce((sum, t) => sum + (t.profit_abs || 0), 0) || 0

      if (snapshot) {
        setStats({
          totalBalance: snapshot.balance_total,
          balanceFree: snapshot.balance_free,
          balanceUsed: snapshot.balance_used,
          totalProfit,
          profitPercent: snapshot.balance_total > 0 ? (totalProfit / snapshot.balance_total) * 100 : 0,
          bestPair,
          worstPair
        })
      }

      if (history) {
        setBalanceHistory(history.map(h => ({
          date: new Date(h.snapshot_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          balance: h.balance_total,
          free: h.balance_free,
          used: h.balance_used
        })))
      }

      // Create allocation data (simplified - in real app would be per asset)
      setAllocation([
        { name: 'Disponible', value: snapshot?.balance_free || 0, color: '#22c55e' },
        { name: 'En uso', value: snapshot?.balance_used || 0, color: '#3b82f6' }
      ])
    } catch (error) {
      console.error('Error loading portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Portfolio</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Balance Total"
          value={`$${stats.totalBalance.toLocaleString()}`}
          icon={<DollarSign size={24} />}
        />
        <StatCard
          title="Profit Total"
          value={`${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toFixed(2)}`}
          change={stats.profitPercent}
          icon={stats.totalProfit >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
          trend={stats.totalProfit >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Mejor Par"
          value={stats.bestPair}
          icon={<TrendingUp size={24} />}
          trend="up"
        />
        <StatCard
          title="Peor Par"
          value={stats.worstPair}
          icon={<TrendingDown size={24} />}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Chart */}
        <Card title="Evolución del Balance" subtitle="Últimos 30 días" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceHistory}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  name="Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Allocation Pie */}
        <Card title="Distribución" subtitle="Balance disponible vs en uso">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {allocation.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Balance Details */}
      <Card title="Detalles del Balance">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400">Balance Total</p>
            <p className="text-2xl font-bold text-white mt-1">${stats.totalBalance.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400">Disponible</p>
            <p className="text-2xl font-bold text-green-400 mt-1">${stats.balanceFree.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">
              {stats.totalBalance > 0 ? ((stats.balanceFree / stats.totalBalance) * 100).toFixed(1) : 0}% del total
            </p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400">En Uso</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">${stats.balanceUsed.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">
              {stats.totalBalance > 0 ? ((stats.balanceUsed / stats.totalBalance) * 100).toFixed(1) : 0}% del total
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
