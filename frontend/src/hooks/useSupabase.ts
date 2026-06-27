import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'

interface UseSupabaseQueryOptions {
  table: string
  select?: string
  filters?: Record<string, unknown>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  schema?: string
}

export function useSupabaseQuery<T>(options: UseSupabaseQueryOptions) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from(options.table)
        .select(options.select || '*')

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false
        })
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: result, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }, [options.table, options.select, JSON.stringify(options.filters), JSON.stringify(options.orderBy), options.limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useSupabaseInsert<T>(table: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insert = async (data: Partial<T>) => {
    try {
      setLoading(true)
      setError(null)

      const { data: result, error: insertError } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()

      if (insertError) throw insertError
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inserting data')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { insert, loading, error }
}

export function useSupabaseUpdate<T>(table: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = async (id: string, data: Partial<T>) => {
    try {
      setLoading(true)
      setError(null)

      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating data')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error }
}

export function useSupabaseDelete(table: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting data')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { remove, loading, error }
}
