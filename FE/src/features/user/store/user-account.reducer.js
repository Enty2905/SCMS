import { createSlice } from '@reduxjs/toolkit'

import {
  createUserAccount,
  deleteUserAccount,
  fetchUserAccountPageData,
  updateUserAccountStatus,
} from './user-account.thunks.js'

const initialState = {
  accounts: [],
  employeesWithoutAccount: [],
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
        state.accounts = action.payload.accounts
        state.employeesWithoutAccount =
          action.payload.employeesWithoutAccount
      })
      .addCase(fetchUserAccountPageData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createUserAccount.pending, (state) => {
        state.saving = true
        state.error = null
        state.successMessage = null
      })
      .addCase(createUserAccount.fulfilled, (state, action) => {
        state.saving = false
        state.accounts = [action.payload.account, ...state.accounts]
        state.employeesWithoutAccount =
          action.payload.employeesWithoutAccount
        state.successMessage = 'Da cap tai khoan cho nhan vien.'
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })
      .addCase(updateUserAccountStatus.pending, (state) => {
        state.saving = true
        state.error = null
        state.successMessage = null
      })
      .addCase(updateUserAccountStatus.fulfilled, (state, action) => {
        state.saving = false
        state.accounts = state.accounts.map((account) =>
          account.userId === action.payload.userId ? action.payload : account,
        )
        state.successMessage = action.payload.active
          ? 'Da mo khoa tai khoan.'
          : 'Da khoa tai khoan.'
      })
      .addCase(updateUserAccountStatus.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })
      .addCase(deleteUserAccount.pending, (state) => {
        state.saving = true
        state.error = null
        state.successMessage = null
      })
      .addCase(deleteUserAccount.fulfilled, (state, action) => {
        state.saving = false
        state.accounts = state.accounts.filter(
          (account) => account.userId !== action.payload.userId,
        )
        state.employeesWithoutAccount =
          action.payload.employeesWithoutAccount
        state.successMessage = 'Da xoa tai khoan.'
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })
  },
})

export const { clearUserAccountNotice } = userAccountSlice.actions
export const userAccountReducer = userAccountSlice.reducer
