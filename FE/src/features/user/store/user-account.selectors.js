export const selectUserAccounts = (state) => state.userAccounts.accounts
export const selectUserAccountPagination = (state) => state.userAccounts.pagination
export const selectUserAccountFilters = (state) => state.userAccounts.filters
export const selectEmployeesWithoutAccount = (state) =>
  state.userAccounts.employeesWithoutAccount
export const selectAssignableRoles = (state) => state.userAccounts.roles
export const selectUserAccountDepartments = (state) => state.userAccounts.departments
export const selectUserAccountLoading = (state) => state.userAccounts.loading
export const selectUserAccountSaving = (state) => state.userAccounts.saving
export const selectUserAccountError = (state) => state.userAccounts.error
export const selectUserAccountSuccessMessage = (state) =>
  state.userAccounts.successMessage
