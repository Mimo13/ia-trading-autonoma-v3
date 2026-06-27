import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { SupabaseProvider } from '../services/SupabaseProvider'
import Layout from '../components/Layout'

// Mock Supabase
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          then: vi.fn()
        }))
      }))
    }))
  }
}))

describe('Layout', () => {
  it('renders navigation items', () => {
    render(
      <SupabaseProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </SupabaseProvider>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Trades')).toBeInTheDocument()
    expect(screen.getByText('Estrategias')).toBeInTheDocument()
    expect(screen.getByText('Señales IA')).toBeInTheDocument()
    expect(screen.getByText('Alertas')).toBeInTheDocument()
  })

  it('renders mobile header', () => {
    render(
      <SupabaseProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </SupabaseProvider>
    )

    // Mobile header should be present (hidden on desktop via CSS)
    expect(screen.getByText('IA Trading')).toBeInTheDocument()
  })
})
