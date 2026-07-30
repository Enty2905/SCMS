import { createContext, useContext, useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { env } from '@/shared/config/env.js'

const WebSocketContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => useContext(WebSocketContext)

export function WebSocketProvider({ children }) {
  const [stompClient, setStompClient] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Listen to token changes in localStorage (e.g., when logging in/out)
  const [token, setToken] = useState(() => window.localStorage.getItem('scms.auth.token'))

  useEffect(() => {
    const handleStorage = () => {
      setToken(window.localStorage.getItem('scms.auth.token'))
    }
    window.addEventListener('storage', handleStorage)
    
    // Custom event to trigger token refresh on login within the same tab
    window.addEventListener('auth-token-changed', handleStorage)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('auth-token-changed', handleStorage)
    }
  }, [])

  useEffect(() => {
    if (!token) {
      return undefined
    }

    // Use standard WebSockets
    const wsUrl = env.apiUrl.replace(/^http/, 'ws') + '/ws-chat'
    
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      setStompClient(client)
      setIsConnected(true)
    }

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message'])
      console.error('Additional details: ' + frame.body)
    }

    client.onWebSocketClose = () => {
      setIsConnected(false)
    }

    client.activate()

    return () => {
      if (client.active) {
        client.deactivate().finally(() => {
          setStompClient((current) => (current === client ? null : current))
          setIsConnected(false)
        })
      }
    }
  }, [token])

  return (
    <WebSocketContext.Provider value={{ stompClient, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}
