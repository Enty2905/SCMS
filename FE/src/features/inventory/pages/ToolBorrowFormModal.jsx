import { Loader2, Search, User, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/Button.jsx'
import { fetchEmployeesService } from '@/features/hr/services/hr-directory.service.js'
import { createToolBorrow } from '../services/toolBorrow.service.js'

/**
 * Modal tạo phiếu mượn CCDC.
 * @param {{ tool?: object, onClose: () => void, onSuccess: () => void }} props
 */
export function ToolBorrowFormModal({ tool, onClose, onSuccess }) {
  // ── Nhân viên ──────────────────────────────────────────────
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [allEmployees, setAllEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const debounceRef = useRef(null)
  const dropdownRef = useRef(null)

  // ── Phiếu mượn ─────────────────────────────────────────────
  const [quantity, setQuantity] = useState(1)
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Tải danh sách nhân viên một lần khi mở modal
  useEffect(() => {
    let mounted = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingEmployees(true)
    fetchEmployeesService()
      .then((data) => {
        if (mounted) {
          const list = Array.isArray(data) ? data : (data?.data || [])
          setAllEmployees(list)
          setFilteredEmployees(list)
        }
      })
      .catch(() => {
        if (mounted) setAllEmployees([])
      })
      .finally(() => {
        if (mounted) setLoadingEmployees(false)
      })
    return () => { mounted = false }
  }, [])

  // Lọc nhân viên với debounce khi nhập keyword
  const handleEmployeeSearch = useCallback((value) => {
    setEmployeeSearch(value)
    setSelectedEmployee(null)
    setShowDropdown(true)
    if (errors.employee) setErrors((prev) => ({ ...prev, employee: null }))

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const kw = value.toLowerCase().trim()
      if (!kw) {
        setFilteredEmployees(allEmployees)
      } else {
        setFilteredEmployees(
          allEmployees.filter((e) =>
            (e.employeeName || '').toLowerCase().includes(kw)
          )
        )
      }
    }, 250)
  }, [allEmployees, errors.employee])

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelectEmployee(employee) {
    setSelectedEmployee(employee)
    setEmployeeSearch(employee.employeeName || '')
    setShowDropdown(false)
  }

  // ── Validate ───────────────────────────────────────────────
  function validate() {
    const newErrors = {}
    if (!selectedEmployee) {
      newErrors.employee = 'Vui lòng chọn nhân viên từ danh sách'
    }
    if (!tool) {
      newErrors.tool = 'Chưa chọn CCDC'
    }
    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      newErrors.quantity = 'Số lượng mượn phải > 0'
    } else if (tool && qty > tool.availableQuantity) {
      newErrors.quantity = `Số lượng mượn không được vượt quá số lượng khả dụng (${tool.availableQuantity})`
    }
    if (!dueDate) {
      newErrors.dueDate = 'Vui lòng chọn hạn trả'
    } else if (new Date(dueDate) <= new Date()) {
      newErrors.dueDate = 'Hạn trả phải sau thời điểm hiện tại'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────
  async function handleSubmit(event) {
    event.preventDefault()
    setApiError(null)
    if (!validate() || submitting) return

    // Giữ nguyên múi giờ Local của máy tính (VN), chỉ thêm giây ':00' để Backend parse được
    const dueDateIso = dueDate + ':00'

    const payload = {
      toolId: tool.toolId,
      employeeId: selectedEmployee.employeeId,
      quantity: Number(quantity),
      dueDate: dueDateIso,
      note: note.trim() || null,
    }

    try {
      setSubmitting(true)
      await createToolBorrow(payload)
      onSuccess()
    } catch (err) {
      setApiError(err.message || 'Lỗi khi tạo phiếu mượn')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Min datetime cho dueDate input ──────────────────────────
  const minDueDate = new Date()
  minDueDate.setMinutes(minDueDate.getMinutes() + 1)
  const minDueDateStr = minDueDate.toISOString().slice(0, 16)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-slate-950">Phiếu mượn CCDC</h2>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form className="px-6 py-5 space-y-6" onSubmit={handleSubmit}>
          {apiError && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {apiError}
            </p>
          )}

          {/* ── Phần 1: Thông tin người mượn ────────────────── */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1">
              1. Thông tin người mượn
            </h3>

            <div className="relative" ref={dropdownRef}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Tìm nhân viên <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  className={[
                    'h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none transition focus:ring-4',
                    errors.employee
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/10',
                  ].join(' ')}
                  onChange={(e) => handleEmployeeSearch(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Tìm theo tên nhân viên..."
                  value={employeeSearch}
                />
              </div>
              {errors.employee && (
                <p className="mt-1 text-xs text-rose-600">{errors.employee}</p>
              )}

              {/* Dropdown kết quả */}
              {showDropdown && (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                  {loadingEmployees ? (
                    <p className="px-3 py-2 text-sm text-slate-500">Đang tải...</p>
                  ) : filteredEmployees.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-slate-500">Không tìm thấy nhân viên</p>
                  ) : (
                    filteredEmployees.slice(0, 20).map((emp) => (
                      <button
                        key={emp.employeeId}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-violet-50 hover:text-violet-700"
                        onClick={() => handleSelectEmployee(emp)}
                      >
                        <User size={14} className="shrink-0 text-slate-400" />
                        <span className="font-medium">{emp.employeeName}</span>
                        {emp.departmentName && (
                          <span className="ml-auto text-xs text-slate-400 shrink-0">
                            {emp.departmentName}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Thông tin nhân viên đã chọn */}
            {selectedEmployee && (
              <div className="mt-3 rounded-md border border-violet-100 bg-violet-50 px-4 py-3">
                <p className="text-sm font-semibold text-violet-800">
                  {selectedEmployee.employeeName}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-violet-700">
                  {selectedEmployee.departmentName && (
                    <span>Phòng: {selectedEmployee.departmentName}</span>
                  )}
                  {selectedEmployee.positionName && (
                    <span>Chức vụ: {selectedEmployee.positionName}</span>
                  )}
                  {selectedEmployee.phone && (
                    <span>ĐT: {selectedEmployee.phone}</span>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ── Phần 2: Thông tin CCDC ──────────────────────── */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1">
              2. Thông tin CCDC
            </h3>

            {tool ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 mb-4">
                <p className="text-sm font-semibold text-slate-950">{tool.name}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-600">
                  {tool.category && <span>Chủng loại: <strong>{tool.category}</strong></span>}
                  <span>
                    Khả dụng:{' '}
                    <strong className="text-emerald-600">{tool.availableQuantity}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mb-4">Chưa chọn CCDC</p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Số lượng mượn <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={tool?.availableQuantity || 1}
                className={[
                  'h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:ring-4',
                  errors.quantity
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/10',
                ].join(' ')}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value)
                  if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: null }))
                }}
                placeholder={`Tối đa ${tool?.availableQuantity || 0}`}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-rose-600">{errors.quantity}</p>
              )}
            </div>
          </section>

          {/* ── Phần 3: Thông tin phiếu ─────────────────────── */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1">
              3. Thông tin phiếu
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Ngày mượn{' '}
                  <span className="text-xs font-normal text-slate-400">(hệ thống tự tạo)</span>
                </label>
                <input
                  className="h-10 w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  disabled
                  readOnly
                  value={new Date().toLocaleString('vi-VN')}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Hạn trả <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  min={minDueDateStr}
                  className={[
                    'h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:ring-4',
                    errors.dueDate
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/10',
                  ].join(' ')}
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value)
                    if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: null }))
                  }}
                />
                {errors.dueDate && (
                  <p className="mt-1 text-xs text-rose-600">{errors.dueDate}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Ghi chú
                </label>
                <textarea
                  className="h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Mượn phục vụ sửa chữa đường điện..."
                  value={note}
                />
              </div>
            </div>
          </section>

          {/* ── Actions ─────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button onClick={onClose} variant="secondary" type="button">
              Hủy
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              disabled={submitting}
              type="submit"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
              Xác nhận cho mượn
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
