import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'

interface SupabaseContextType {
  isConnected: boolean
  isLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({
  isConnected: false,
  isLoading: true
})

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from('strategies').select('id').limit(1)
        setIsConnected(!error)
      } catch {
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsConnected(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SupabaseContext.Provider value={{ isConnected, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  return useContext(SupabaseContext)
}
