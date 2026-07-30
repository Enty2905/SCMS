import { Provider } from 'react-redux'

import { ChatProvider } from '@/features/chat/components/ChatProvider.jsx'
import { WebSocketProvider } from '@/shared/contexts/WebSocketContext.jsx'

import { store } from './store.js'

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <WebSocketProvider>
        <ChatProvider>{children}</ChatProvider>
      </WebSocketProvider>
    </Provider>
  )
}
