export const selectHrEmployees = (state) => state.hrDirectory.employees
export const selectHrEmployeeResults = (state) => state.hrDirectory.employeeResults
export const selectHrEmployeeSearching = (state) => state.hrDirectory.searching
export const selectHrEmployeePage = (state) => state.hrDirectory.employeePage
export const selectHrEmployeeFilters = (state) => state.hrDirectory.employeeFilters
export const selectHrEmployeeOptions = (state) => state.hrDirectory.employeeOptions
export const selectHrDepartments = (state) => state.hrDirectory.departments
export const selectHrDepartmentSearch = (state) => state.hrDirectory.departmentSearch
export const selectHrDepartmentEmployees = (state) => state.hrDirectory.departmentEmployees
export const selectHrDepartmentEmployeesLoading = (state) =>
  state.hrDirectory.departmentEmployeesLoading
export const selectHrPositions = (state) => state.hrDirectory.positions
export const selectHrDirectoryLoading = (state) => state.hrDirectory.loading
export const selectHrDirectorySaving = (state) => state.hrDirectory.saving
export const selectHrDirectoryError = (state) => state.hrDirectory.error
