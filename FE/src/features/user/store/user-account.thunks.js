import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  createAccountService,
  deleteAccountService,
  fetchAccountsService,
  fetchEmployeesWithoutAccountService,
  updateAccountStatusService,
} from '../services/user-account.service.js'

export const fetchUserAccountPageData = createAsyncThunk(
  'userAccounts/fetchPageData',
  async () => {
    const [accounts, employeesWithoutAccount] = await Promise.all([
      fetchAccountsService(),
      fetchEmployeesWithoutAccountService(),
    ])

    return { accounts, employeesWithoutAccount }
  },
)

export const createUserAccount = createAsyncThunk(
  'userAccounts/create',
  async (payload) => {
    const account = await createAccountService(payload)
    const employeesWithoutAccount = await fetchEmployeesWithoutAccountService()

    return { account, employeesWithoutAccount }
  },
)

export const updateUserAccountStatus = createAsyncThunk(
  'userAccounts/updateStatus',
  async ({ userId, active }) => updateAccountStatusService(userId, active),
)

export const deleteUserAccount = createAsyncThunk(
  'userAccounts/delete',
  async (userId) => {
    await deleteAccountService(userId)
    const employeesWithoutAccount = await fetchEmployeesWithoutAccountService()

    return { userId, employeesWithoutAccount }
  },
)
