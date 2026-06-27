import { useEffect, useRef, useState, useCallback } from 'react'

type MessageHandler = (data: unknown) => void

interface WebSocketOptions {
  url: string
  onMessage?: MessageHandler
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: WebSocketOptions) {
  const {
    url,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options

  const ws = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>()
  
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<unknown>(null)

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        setIsConnected(true)
        reconnectAttempts.current = 0
        onConnect?.()
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          onMessage?.(data)
        } catch {
          setLastMessage(event.data)
          onMessage?.(event.data)
        }
      }

      ws.current.onclose = () => {
        setIsConnected(false)
        onDisconnect?.()

        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          reconnectTimeout.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      ws.current.onerror = (error) => {
        onError?.(error)
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
  }, [])

  const send = useCallback((data: unknown) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { isConnected, lastMessage, send, disconnect, reconnect: connect }
}

// Supabase Realtime hook
export function useSupabaseRealtime(table: string, callback: (payload: unknown) => void) {
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    // This would use Supabase Realtime in production
    // For now, we'll use polling as a fallback
    const interval = setInterval(async () => {
      // Poll for changes every 5 seconds
      // In production, replace with Supabase Realtime subscription
    }, 5000)

    setSubscribed(true)

    return () => {
      clearInterval(interval)
      setSubscribed(false)
    }
  }, [table, callback])

  return { subscribed }
}
