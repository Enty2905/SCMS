import { createSlice } from '@reduxjs/toolkit'

import {
  createUserAccount,
  deleteUserAccount,
  fetchUserAccountPageData,
  fetchUserAccounts,
  resetUserAccountPassword,
  updateUserAccountRoles,
  updateUserAccountStatus,
} from './user-account.thunks.js'

const initialState = {
  accounts: [],
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },
  filters: {
    search: '',
    status: 'all',
    departmentId: '',
    roleCode: '',
  },
  employeesWithoutAccount: [],
  roles: [],
  departments: [],
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
}

const userAccountSlice = createSlice({
  name: 'userAccounts',
  initialState,
  reducers: {
    clearUserAccountNotice(state) {
      state.error = null
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAccountPageData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserAccountPageData.fulfilled, (state, action) => {
        state.loading = false
        applyAccountPage(state, action.payload)
        state.employeesWithoutAccount = action.payload.employeesWithoutAccount
        state.roles = action.payload.roles
        state.departments = action.payload.departments
      })
      .addCase(fetchUserAccountPageData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchUserAccounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserAccounts.fulfilled, (state, action) => {
        state.loading = false
        applyAccountPage(state, action.payload)
      })
      .addCase(fetchUserAccounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createUserAccount.pending, startSaving)
      .addCase(createUserAccount.fulfilled, (state) => {
        state.saving = false
        state.successMessage = 'Đã cấp tài khoản cho nhân viên.'
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })
      .addCase(updateUserAccountRoles.pending, startSaving)
      .addCase(updateUserAccountRoles.fulfilled, (state, action) => {
        state.saving = false
        replaceAccount(state, action.payload)
        state.successMessage = 'Đã cập nhật vai trò của tài khoản.'
      })
      .addCase(updateUserAccountRoles.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })
      .addCase(resetUserAccountPassword.pending, startSaving)
      .addCase(resetUserAccountPassword.fulfilled, (state, action) => {
        state.saving = false
        replaceAccount(state, action.payload)
        state.successMessage =
          `Đã đặt lại mật khẩu cho tài khoản ${action.payload.username}. Hãy báo mật khẩu tạm cho nhân viên.`
      })
      .addCase(resetUserAccountPassword.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })
      .addCase(updateUserAccountStatus.pending, startSaving)
      .addCase(updateUserAccountStatus.fulfilled, (state, action) => {
        state.saving = false
        replaceAccount(state, action.payload)
        state.successMessage = action.payload.active
          ? 'Đã mở khóa tài khoản.'
          : 'Đã khóa tài khoản.'
      })
      .addCase(updateUserAccountStatus.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })
      .addCase(deleteUserAccount.pending, startSaving)
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.saving = false
        state.successMessage = 'Đã xóa mềm tài khoản.'
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })
  },
})

/**
 * Ghi lại trang kết quả và bộ lọc vừa dùng để lần tải sau giữ nguyên ngữ cảnh.
 */
function applyAccountPage(state, { accountPage, accountQuery }) {
  state.accounts = accountPage.content || []
  state.pagination = {
    page: accountPage.page ?? 0,
    size: accountPage.size ?? state.pagination.size,
    totalElements: accountPage.totalElements ?? 0,
    totalPages: accountPage.totalPages ?? 0,
    last: accountPage.last ?? true,
  }

  if (accountQuery) {
    state.filters = {
      search: accountQuery.search ?? '',
      status: accountQuery.status ?? 'all',
      departmentId: accountQuery.departmentId ?? '',
      roleCode: accountQuery.roleCode ?? '',
    }
  }
}

function replaceAccount(state, account) {
  state.accounts = state.accounts.map((item) =>
    item.userId === account.userId ? account : item,
  )
}

function startSaving(state) {
  state.saving = true
  state.error = null
  state.successMessage = null
}

export const { clearUserAccountNotice } = userAccountSlice.actions
export const userAccountReducer = userAccountSlice.reducer
