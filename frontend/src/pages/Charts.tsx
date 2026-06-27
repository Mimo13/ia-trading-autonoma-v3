import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Card } from '../components/ui'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'

interface PortfolioData {
  date: string
  balance: number
  free: number
  used: number
}

interface ProfitData {
  date: string
  profit: number
  cumulative: number
}

interface PairPerformance {
  pair: string
  trades: number
  profit: number
  winRate: number
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Charts() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([])
  const [profitData, setProfitData] = useState<ProfitData[]>([])
  const [pairPerformance, setPairPerformance] = useState<PairPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [])

  async function loadChartData() {
    try {
      // Load portfolio snapshots
      const { data: snapshots } = await supabase
        .from('portfolio_snapshots')
        .select('balance_total, balance_free, balance_used, snapshot_at')
        .order('snapshot_at', { ascending: true })
        .limit(30)

      if (snapshots) {
        setPortfolioData(snapshots.map(s => ({
          date: new Date(s.snapshot_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          balance: s.balance_total,
          free: s.balance_free,
          used: s.balance_used
        })))
      }

      // Load trades for profit chart
      const { data: trades } = await supabase
        .from('unified_trades')
        .select('profit_abs, opened_at')
        .not('profit_abs', 'is', null)
        .order('opened_at', { ascending: true })

      if (trades) {
        let cumulative = 0
        const dailyProfits: Record<string, number> = {}
        
        trades.forEach(t => {
          const date = new Date(t.opened_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
          dailyProfits[date] = (dailyProfits[date] || 0) + (t.profit_abs || 0)
        })

        const profitEntries = Object.entries(dailyProfits).map(([date, profit]) => {
          cumulative += profit
          return { date, profit: Math.round(profit * 100) / 100, cumulative: Math.round(cumulative * 100) / 100 }
        })

        setProfitData(profitEntries)
      }

      // Load pair performance
      const { data: pairTrades } = await supabase
        .from('unified_trades')
        .select('pair, profit_abs')
        .not('profit_abs', 'is', null)

      if (pairTrades) {
        const pairStats: Record<string, { trades: number; profit: number; wins: number }> = {}
        
        pairTrades.forEach(t => {
          if (!pairStats[t.pair]) {
            pairStats[t.pair] = { trades: 0, profit: 0, wins: 0 }
          }
          pairStats[t.pair].trades++
          pairStats[t.pair].profit += t.profit_abs || 0
          if ((t.profit_abs || 0) > 0) pairStats[t.pair].wins++
        })

        setPairPerformance(
          Object.entries(pairStats)
            .map(([pair, stats]) => ({
              pair,
              trades: stats.trades,
              profit: Math.round(stats.profit * 100) / 100,
              winRate: Math.round((stats.wins / stats.trades) * 100)
            }))
            .sort((a, b) => b.profit - a.profit)
        )
      }
    } catch (error) {
      console.error('Error loading chart data:', error)
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-64 bg-slate-700 rounded" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gráficos de Rendimiento</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Evolution */}
        <Card title="Evolución del Portfolio" subtitle="Balance últimos 30 días">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioData}>
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

        {/* Cumulative Profit */}
        <Card title="Profit Acumulado" subtitle="Evolución de beneficios">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={false}
                  name="Profit Acumulado"
                />
                <Bar 
                  dataKey="profit" 
                  fill="#3b82f6" 
                  opacity={0.3}
                  name="Profit Diario"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Profit */}
        <Card title="Profit Diario" subtitle="Distribución de beneficios por día">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="profit" name="Profit">
                  {profitData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.profit >= 0 ? '#22c55e' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pair Performance */}
        <Card title="Rendimiento por Par" subtitle="Profit total por par de trading">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pairPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  type="number" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  type="category" 
                  dataKey="pair" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="profit" name="Profit">
                  {pairPerformance.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.profit >= 0 ? '#22c55e' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Win Rate Pie Chart */}
      <Card title="Win Rate por Par" subtitle="Porcentaje de trades ganadores">
        <div className="flex items-center justify-center">
          <div className="w-64 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pairPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ pair, winRate }) => `${pair}: ${winRate}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="winRate"
                >
                  {pairPerformance.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  )
}
