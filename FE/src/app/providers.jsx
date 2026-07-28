import { Provider } from 'react-redux'

import { store } from './store.js'
import { WebSocketProvider } from '@/shared/contexts/WebSocketContext.jsx'

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </Provider>
  )
}
