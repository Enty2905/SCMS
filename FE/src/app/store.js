import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from '@/features/auth/store/auth.reducer.js'
import { hrDirectoryReducer } from '@/features/hr/store/hr-directory.reducer.js'
import { materialReducer } from '@/features/inventory/store/material.reducer.js'
import { toolReducer } from '@/features/inventory/store/tool.reducer.js'
import { userAccountReducer } from '@/features/user/store/user-account.reducer.js'
import { maintenanceReducer } from '@/features/maintenance/store/maintenance.reducer.js'
import { repairRequestReducer } from '@/features/repairrequest/store/repairrequest.reducer.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hrDirectory: hrDirectoryReducer,
    materials: materialReducer,
    tools: toolReducer,
    userAccounts: userAccountReducer,
    maintenance: maintenanceReducer,
    repairRequest: repairRequestReducer,
  },
})
