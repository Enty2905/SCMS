import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from '@/features/auth/store/auth.reducer.js'
import { hrDirectoryReducer } from '@/features/hr/store/hr-directory.reducer.js'
import { userAccountReducer } from '@/features/user/store/user-account.reducer.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hrDirectory: hrDirectoryReducer,
    userAccounts: userAccountReducer,
  },
})
