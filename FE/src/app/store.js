import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from '@/features/auth/store/auth.reducer.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})
