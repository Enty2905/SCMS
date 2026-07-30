import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  createAccountService,
  deleteAccountService,
  fetchAccountsService,
  fetchAssignableRolesService,
  fetchDepartmentOptionsService,
  fetchEmployeesWithoutAccountService,
  resetAccountPasswordService,
  updateAccountRolesService,
  updateAccountStatusService,
} from '../services/user-account.service.js'

/**
 * Bộ lọc đang áp dụng, dùng để tải lại đúng trang sau mỗi lần ghi dữ liệu.
 */
function currentQuery(getState, overrides = {}) {
  const { filters, pagination } = getState().userAccounts

  return {
    ...filters,
    page: pagination.page,
    size: pagination.size,
    ...overrides,
  }
}

export const fetchUserAccountPageData = createAsyncThunk(
  'userAccounts/fetchPageData',
  async (query, { getState }) => {
    const accountQuery = currentQuery(getState, query)

    const [accountPage, employeesWithoutAccount, roles, departments] = await Promise.all([
      fetchAccountsService(accountQuery),
      fetchEmployeesWithoutAccountService(),
      fetchAssignableRolesService(),
      fetchDepartmentOptionsService(),
    ])

    return { accountPage, employeesWithoutAccount, roles, departments, accountQuery }
  },
)

export const fetchUserAccounts = createAsyncThunk(
  'userAccounts/fetchAccounts',
  async (query, { getState }) => {
    const accountQuery = currentQuery(getState, query)
    const accountPage = await fetchAccountsService(accountQuery)

    return { accountPage, accountQuery }
  },
)

export const createUserAccount = createAsyncThunk(
  'userAccounts/create',
  async (payload, { dispatch }) => {
    const account = await createAccountService(payload)
    await dispatch(fetchUserAccountPageData({ page: 0 }))

    return account
  },
)

export const updateUserAccountRoles = createAsyncThunk(
  'userAccounts/updateRoles',
  async ({ userId, roleIds }) => updateAccountRolesService(userId, roleIds),
)

export const resetUserAccountPassword = createAsyncThunk(
  'userAccounts/resetPassword',
  async ({ userId, newPassword }) => resetAccountPasswordService(userId, newPassword),
)

export const updateUserAccountStatus = createAsyncThunk(
  'userAccounts/updateStatus',
  async ({ userId, active }) => updateAccountStatusService(userId, active),
)

export const deleteUserAccount = createAsyncThunk(
  'userAccounts/delete',
  async (userId, { dispatch }) => {
    const account = await deleteAccountService(userId)
    await dispatch(fetchUserAccountPageData())

    return account
  },
)
