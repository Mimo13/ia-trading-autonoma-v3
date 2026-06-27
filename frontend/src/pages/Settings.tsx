import { useState } from 'react'
import { Card, Button, Badge } from '../components/ui'
import { Settings as SettingsIcon, Save, RefreshCw, Shield, Bell, Database, Key } from 'lucide-react'

interface SettingsSection {
  id: string
  title: string
  icon: typeof SettingsIcon
  description: string
}

const sections: SettingsSection[] = [
  {
    id: 'general',
    title: 'General',
    icon: SettingsIcon,
    description: 'Configuración general del sistema'
  },
  {
    id: 'security',
    title: 'Seguridad',
    icon: Shield,
    description: 'Gestión de credenciales y permisos'
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    icon: Bell,
    description: 'Configurar alertas y notificaciones'
  },
  {
    id: 'database',
    title: 'Base de Datos',
    icon: Database,
    description: 'Configuración de Supabase'
  },
  {
    id: 'api',
    title: 'API Keys',
    icon: Key,
    description: 'Gestión de claves API'
  }
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Configuración</h2>
        <Button onClick={handleSave} loading={saving}>
          <Save size={16} className="mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon size={18} />
                  {section.title}
                </button>
              )
            })}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'general' && (
            <Card title="Configuración General">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Nombre del Proyecto</label>
                  <input
                    type="text"
                    defaultValue="IA Trading Autónoma v3"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Modo de Operación</label>
                  <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="paper">Paper Trading</option>
                    <option value="live">Live Trading</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Exchange Principal</label>
                  <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="binance">Binance</option>
                    <option value="coinbase">Coinbase</option>
                    <option value="kraken">Kraken</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card title="Seguridad">
              <div className="space-y-4">
                <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Shield size={18} />
                    <span className="font-medium">Zona de Seguridad</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    Las credenciales están cifradas y solo se acceden mediante el backend.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">API Key Exchange</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <Button variant="secondary">Mostrar</Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">API Secret Exchange</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <Button variant="secondary">Mostrar</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card title="Notificaciones">
              <div className="space-y-4">
                {[
                  { label: 'Alertas de Precio', description: 'Notificar cuando el precio alcanza un umbral' },
                  { label: 'Alertas de Drawdown', description: 'Notificar cuando el drawdown supera el límite' },
                  { label: 'Trades Ejecutados', description: 'Notificar cada trade ejecutado' },
                  { label: 'Errores del Sistema', description: 'Notificar errores y fallos' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-white">{item.label}</p>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'database' && (
            <Card title="Base de Datos">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="success">Conectado</Badge>
                  <span className="text-sm text-slate-400">Supabase Cloud</span>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">URL del Proyecto</label>
                  <input
                    type="text"
                    value="https://hqndgumqlfkzmaukptsg.supabase.co"
                    readOnly
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-400">Tablas</p>
                    <p className="text-2xl font-bold text-white">6</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-400">Vistas</p>
                    <p className="text-2xl font-bold text-white">1</p>
                  </div>
                </div>
                <Button variant="secondary">
                  <RefreshCw size={16} className="mr-2" />
                  Verificar Conexión
                </Button>
              </div>
            </Card>
          )}

          {activeSection === 'api' && (
            <Card title="API Keys">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">Supabase Anon Key</span>
                    <Badge variant="info">Activa</Badge>
                  </div>
                  <code className="text-sm text-slate-400 break-all">
                    sb_publishable_Lg-6tDIq94wts70SBRmiLw...
                  </code>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">Supabase Service Key</span>
                    <Badge variant="warning">Solo Backend</Badge>
                  </div>
                  <code className="text-sm text-slate-400 break-all">
                    sb_secret_-m-4AUQoAjUCzg3QI57Nuw...
                  </code>
                </div>
                <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    ⚠️ Las service keys solo deben usarse en el backend, nunca en el frontend.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
