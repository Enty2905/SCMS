export const selectUserAccounts = (state) => state.userAccounts.accounts
export const selectEmployeesWithoutAccount = (state) =>
  state.userAccounts.employeesWithoutAccount
export const selectUserAccountLoading = (state) => state.userAccounts.loading
export const selectUserAccountSaving = (state) => state.userAccounts.saving
export const selectUserAccountError = (state) => state.userAccounts.error
export const selectUserAccountSuccessMessage = (state) =>
  state.userAccounts.successMessage
