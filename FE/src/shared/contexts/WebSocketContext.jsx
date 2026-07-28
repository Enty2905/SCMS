import { createContext, useContext, useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { env } from '@/shared/config/env.js'

const WebSocketContext = createContext(null)

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
      if (stompClient?.active) stompClient.deactivate()
      setStompClient(null)
      setIsConnected(false)
      return
    }

    // Use standard WebSockets
    const wsUrl = env.apiUrl.replace(/^http/, 'ws') + '/ws'
    
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: function (str) {
        // console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = (frame) => {
      setIsConnected(true)
      console.log('Connected to WebSocket')
    }

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message'])
      console.error('Additional details: ' + frame.body)
    }

    client.onWebSocketClose = () => {
      setIsConnected(false)
    }

    client.activate()
    setStompClient(client)

    return () => {
      if (client.active) {
        client.deactivate()
      }
    }
  }, [token])

  return (
    <WebSocketContext.Provider value={{ stompClient, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}
