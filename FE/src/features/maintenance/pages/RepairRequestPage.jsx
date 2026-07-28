import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { ROLES, hasAnyRole } from '@/features/auth/utils/roles.js'
import { selectHrEmployees } from '@/features/hr/store/hr-directory.selectors.js'
import { fetchHrDirectoryData } from '@/features/hr/store/hr-directory.thunks.js'
import { Button } from '@/shared/components/ui/Button.jsx'

import { clearWorkOrderError } from '../store/maintenance.reducer.js'
import {
  selectRequests,
  selectRequestsError,
  selectRequestsLoading,
  selectWorkOrder,
  selectWorkOrderError,
  selectWorkOrderLoading,
} from '../store/maintenance.selectors.js'
import { createWorkOrder, fetchPendingRequests } from '../store/maintenance.thunks.js'

// ── Priority config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  critical: { label: 'Khẩn cấp', className: 'bg-rose-100 text-rose-700' },
  high: { label: 'Cao', className: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Trung bình', className: 'bg-amber-100 text-amber-700' },
  low: { label: 'Thấp', className: 'bg-slate-100 text-slate-600' },
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Employee Search Input (gợi ý khi gõ) ────────────────────────────────────
function EmployeeSearchInput({ employees, value, onChange, placeholder, required }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  // Tên hiển thị của nhân viên đang được chọn
  const selectedName = useMemo(
    () => employees.find((e) => e.employeeId === value)?.employeeName || '',
    [employees, value],
  )

  // Khi mở dropdown, hiển thị tên hiện tại
  function handleFocus() {
    setQuery(selectedName)
    setOpen(true)
  }

  // Lọc theo từ khoá gõ vào
  const filtered = useMemo(() => {
    const kw = query.trim().toLowerCase()
    if (!kw) return employees.slice(0, 10)
    return employees
      .filter(
        (e) =>
          e.employeeName?.toLowerCase().includes(kw) ||
          e.positionName?.toLowerCase().includes(kw),
      )
      .slice(0, 10)
  }, [employees, query])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        // Nếu người dùng gõ xong mà không chọn → giữ nguyên giá trị cũ
        setQuery(selectedName)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [selectedName])

  function handleSelect(emp) {
    onChange(emp.employeeId)
    setQuery(emp.employeeName)
    setOpen(false)
  }

  function handleClear() {
    onChange('')
    setQuery('')
  }

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={14}
        />
        <input
          className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          onChange={(e) => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
            if (!e.target.value) onChange('')
          }}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required && !value}
          type="text"
          value={open ? query : selectedName}
        />
        {value ? (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onClick={handleClear}
            type="button"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      {open && filtered.length > 0 ? (
        <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.map((emp) => (
            <li key={emp.employeeId}>
              <button
                className="flex w-full flex-col px-3 py-2 text-left hover:bg-violet-50"
                onMouseDown={() => handleSelect(emp)}
                type="button"
              >
                <span className="text-sm font-medium text-slate-800">{emp.employeeName}</span>
                {emp.positionName ? (
                  <span className="text-xs text-slate-400">{emp.positionName}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

// ── Create Work Order Modal ───────────────────────────────────────────────────
function CreateWorkOrderModal({ onClose, requests, employees, defaultRequestId }) {
  const dispatch = useDispatch()
  const loading = useSelector(selectWorkOrderLoading)
  const error = useSelector(selectWorkOrderError)
  const workOrder = useSelector(selectWorkOrder)

  const [form, setForm] = useState({
    requestId: defaultRequestId || '',
    content: '',
    startDate: '',
    endDate: '',
    workLeaderId: '',
    directCommanderId: '',
    safetySupervisorId: '',
    memberIds: [],
  })

  const prevWorkOrder = useRef(workOrder)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (workOrder && workOrder !== prevWorkOrder.current) setSuccess(true)
    prevWorkOrder.current = workOrder
  }, [workOrder])

  useEffect(() => {
    dispatch(clearWorkOrderError())
  }, [dispatch])

  // Tự động xoá nhân viên ra khỏi danh sách thành viên nếu được chọn làm lãnh đạo
  useEffect(() => {
    const leaderIds = new Set([form.workLeaderId, form.directCommanderId, form.safetySupervisorId].filter(Boolean))
    if (leaderIds.size > 0) {
      setForm((prev) => {
        const cleanMembers = prev.memberIds.filter((id) => !leaderIds.has(id))
        if (cleanMembers.length !== prev.memberIds.length) {
          return { ...prev, memberIds: cleanMembers }
        }
        return prev
      })
    }
  }, [form.workLeaderId, form.directCommanderId, form.safetySupervisorId])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleMember(employeeId) {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(employeeId)
        ? prev.memberIds.filter((id) => id !== employeeId)
        : [...prev.memberIds, employeeId],
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setValidationError('')

    if (form.safetySupervisorId === form.workLeaderId || form.safetySupervisorId === form.directCommanderId) {
      setValidationError('Người giám sát an toàn phải khác Lãnh đạo thi công và Chỉ huy trực tiếp')
      return
    }

    const body = {
      ...(form.requestId ? { requestId: form.requestId } : {}),
      ...(form.content ? { content: form.content } : {}),
      ...(form.startDate ? { startDate: form.startDate } : {}),
      ...(form.endDate ? { endDate: form.endDate } : {}),
      workLeaderId: form.workLeaderId,
      directCommanderId: form.directCommanderId,
      safetySupervisorId: form.safetySupervisorId,
      ...(form.memberIds.length ? { memberIds: form.memberIds } : {}),
    }
    dispatch(createWorkOrder(body))
  }

  // Lọc nhân viên thành viên: loại 3 vị trí đã chọn
  const memberCandidates = useMemo(
    () =>
      employees.filter(
        (e) =>
          e.employeeId !== form.workLeaderId &&
          e.employeeId !== form.directCommanderId &&
          e.employeeId !== form.safetySupervisorId,
      ),
    [employees, form.workLeaderId, form.directCommanderId, form.safetySupervisorId],
  )

  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1'
  const textareaCls =
    'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'
  const inputCls =
    'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-base font-bold text-slate-950">Tạo Phiếu Công Tác</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Số PCT sẽ được tự động sinh. Chỉ 3 vị trí lãnh đạo là bắt buộc.
            </p>
          </div>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Success */}
        {success ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-emerald-100">
              <CheckCircle2 className="text-emerald-600" size={28} />
            </div>
            <p className="text-base font-bold text-slate-950">Tạo PCT thành công!</p>
            <p className="mt-1 text-sm text-slate-500">
              Số PCT: <strong className="text-violet-700">{workOrder?.orderNumber}</strong>
            </p>
            {workOrder?.equipmentName ? (
              <p className="mt-0.5 text-sm text-slate-500">
                Thiết bị: <strong className="text-slate-700">{workOrder.equipmentName}</strong>
              </p>
            ) : null}
            <Button className="mt-6 bg-violet-600 hover:bg-violet-700" onClick={onClose}>
              Đóng
            </Button>
          </div>
        ) : (
          <form className="space-y-5 p-6" onSubmit={handleSubmit}>
            {/* Liên kết Request (tuỳ chọn) */}
            <div>
              <label className={labelCls}>Liên kết yêu cầu sửa chữa (tuỳ chọn)</label>
              <select
                className={inputCls}
                onChange={(e) => set('requestId', e.target.value)}
                value={form.requestId}
              >
                <option value="">— Không liên kết request nào —</option>
                {requests.map((r) => (
                  <option key={r.requestId} value={r.requestId}>
                    [{r.priority?.toUpperCase()}] {r.equipmentKksCode} – {r.equipmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* Nội dung (tuỳ chọn) */}
            <div>
              <label className={labelCls}>Nội dung công việc</label>
              <textarea
                className={textareaCls}
                onChange={(e) => set('content', e.target.value)}
                placeholder="Mô tả chi tiết công việc... (có thể bỏ trống, điền thủ công ở bản cứng)"
                rows={3}
                value={form.content}
              />
            </div>

            {/* Thời gian (tuỳ chọn) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Thời gian bắt đầu</label>
                <input
                  className={inputCls}
                  onChange={(e) => set('startDate', e.target.value)}
                  type="datetime-local"
                  value={form.startDate}
                />
              </div>
              <div>
                <label className={labelCls}>Thời gian kết thúc</label>
                <input
                  className={inputCls}
                  onChange={(e) => set('endDate', e.target.value)}
                  type="datetime-local"
                  value={form.endDate}
                />
              </div>
            </div>

            {/* 3 vị trí lãnh đạo (BẮT BUỘC) */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Nhân sự phụ trách <span className="text-rose-500">*</span> (bắt buộc)
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Lãnh đạo thi công</label>
                  <EmployeeSearchInput
                    employees={employees}
                    onChange={(id) => set('workLeaderId', id)}
                    placeholder="Tìm tên nhân viên..."
                    required
                    value={form.workLeaderId}
                  />
                </div>
                <div>
                  <label className={labelCls}>Chỉ huy trực tiếp</label>
                  <EmployeeSearchInput
                    employees={employees}
                    onChange={(id) => set('directCommanderId', id)}
                    placeholder="Tìm tên nhân viên..."
                    required
                    value={form.directCommanderId}
                  />
                </div>
                <div>
                  <label className={labelCls}>Giám sát an toàn</label>
                  <EmployeeSearchInput
                    employees={employees}
                    onChange={(id) => set('safetySupervisorId', id)}
                    placeholder="Tìm tên nhân viên..."
                    required
                    value={form.safetySupervisorId}
                  />
                </div>
              </div>
            </div>

            {/* Thành viên thi công (tuỳ chọn) */}
            <div>
              <label className={labelCls}>Thành viên thi công (tuỳ chọn)</label>
              <div className="max-h-36 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                {memberCandidates.length === 0 ? (
                  <p className="text-xs text-slate-400">Không có nhân viên phù hợp.</p>
                ) : (
                  memberCandidates.map((emp) => (
                    <label
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 hover:bg-white"
                      key={emp.employeeId}
                    >
                      <input
                        checked={form.memberIds.includes(emp.employeeId)}
                        className="accent-violet-600"
                        onChange={() => toggleMember(emp.employeeId)}
                        type="checkbox"
                      />
                      <span className="text-sm text-slate-700">
                        {emp.employeeName}
                        {emp.positionName ? (
                          <span className="ml-1.5 text-xs text-slate-400">({emp.positionName})</span>
                        ) : null}
                      </span>
                    </label>
                  ))
                )}
              </div>
              {form.memberIds.length > 0 ? (
                <p className="mt-1 text-xs text-slate-500">Đã chọn {form.memberIds.length} thành viên</p>
              ) : null}
            </div>

            {error || validationError ? (
              <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 mt-4">
                <AlertTriangle className="shrink-0 text-rose-500 mt-0.5" size={16} />
                <p className="text-sm font-medium text-rose-700">{error || validationError}</p>
              </div>
            ) : null}

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button onClick={onClose} type="button" variant="secondary">
                Huỷ
              </Button>
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                disabled={loading || !form.workLeaderId || !form.directCommanderId || !form.safetySupervisorId}
                type="submit"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                {loading ? 'Đang tạo...' : 'Tạo phiếu công tác'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function RepairRequestPage() {
  const dispatch = useDispatch()
  const requests = useSelector(selectRequests)
  const loading = useSelector(selectRequestsLoading)
  const error = useSelector(selectRequestsError)
  const employees = useSelector(selectHrEmployees)
  const currentUser = useSelector(selectCurrentUser)

  // Search, modal and pagination state
  const [searchKks, setSearchKks] = useState('')
  const [searchName, setSearchName] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [priority, setPriority] = useState('all')
  const [selectedRequestId, setSelectedRequestId] = useState(null)

  const canCreateWorkOrder = useMemo(() => {
    return hasAnyRole(currentUser, [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER])
  }, [currentUser])

  const filteredRequests = useMemo(() => {
    const kksKw = searchKks.trim().toLowerCase()
    const nameKw = searchName.trim().toLowerCase()
    return requests.filter((r) => {
      const matchKks = !kksKw || r.equipmentKksCode?.toLowerCase().includes(kksKw)
      const matchName = !nameKw || r.equipmentName?.toLowerCase().includes(nameKw)
      const matchPriority = priority === 'all' || r.priority === priority
      return matchKks && matchName && matchPriority
    })
  }, [requests, searchKks, searchName, priority])

  const pageSize = 10
  const totalElements = filteredRequests.length
  const totalPages = Math.ceil(totalElements / pageSize)

  const paginatedRequests = useMemo(() => {
    const start = currentPage * pageSize
    return filteredRequests.slice(start, start + pageSize)
  }, [filteredRequests, currentPage])

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  function handlePriorityChange(val) {
    setPriority(val)
    setCurrentPage(0)
  }

  useEffect(() => {
    dispatch(fetchPendingRequests())
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Yêu cầu sửa chữa</h1>
          <p className="mt-1 text-sm text-slate-500">
            Danh sách yêu cầu đang chờ xử lý từ trưởng ca / trưởng kíp.
          </p>
        </div>
      </section>

      {/* Filters với Phân tách 2 trường tìm kiếm */}
      <section className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(e) => {
                setSearchKks(e.target.value)
                setCurrentPage(0)
              }}
              placeholder="Tìm theo Mã KKS..."
              value={searchKks}
            />
          </label>
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(e) => {
                setSearchName(e.target.value)
                setCurrentPage(0)
              }}
              placeholder="Tìm theo Tên thiết bị..."
              value={searchName}
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="h-11 min-w-44 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(e) => handlePriorityChange(e.target.value)}
            value={priority}
          >
            <option value="all">Tất cả mức độ</option>
            <option value="critical">Khẩn cấp</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
          <Button
            onClick={() => dispatch(fetchPendingRequests())}
            size="icon"
            title="Tải lại"
            variant="secondary"
          >
            <RefreshCw size={17} />
          </Button>
        </div>
      </section>

      {/* Table */}
      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {paginatedRequests.length} / {filteredRequests.length} yêu cầu chờ xử lý (Tổng số: {requests.length})
        </div>

        {error ? (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
            <AlertTriangle className="shrink-0 text-rose-500" size={16} />
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
              <tr>
                <th className="px-5 py-3">Thiết bị</th>
                <th className="px-5 py-3">Mô tả sự cố</th>
                <th className="px-5 py-3">Mức độ</th>
                <th className="px-5 py-3">Người tạo</th>
                <th className="px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && requests.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-400" colSpan={6}>
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-violet-500" size={18} />
                      Đang tải dữ liệu...
                    </span>
                  </td>
                </tr>
              ) : null}

              {!loading && !filteredRequests.length ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-400" colSpan={6}>
                    Không có yêu cầu nào phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? paginatedRequests.map((r) => (
                  <tr className="hover:bg-slate-50/80" key={r.requestId}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{r.equipmentKksCode}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {r.equipmentName}
                        {r.equipmentType ? ` · ${r.equipmentType}` : ''}
                      </p>
                      {r.equipmentLocation ? (
                        <p className="mt-0.5 text-xs text-slate-400">{r.equipmentLocation}</p>
                      ) : null}
                    </td>
                    <td className="max-w-xs px-5 py-4">
                      <p className="line-clamp-2 text-slate-700">{r.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={r.priority} />
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {r.createdByName || r.createdByUsername}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {canCreateWorkOrder ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-violet-600 hover:bg-violet-700 active:scale-95 shadow-sm transition-all border border-violet-700/20"
                          onClick={() => setSelectedRequestId(r.requestId)}
                        >
                          <Plus size={14} className="stroke-[2.5]" />
                          <span>Tạo PCT</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 bg-slate-100 border border-slate-200">
                          Xem PCT
                        </span>
                      )}
                    </td>
                  </tr>
                ))
                : null}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 ? (() => {
          let startPage = Math.max(0, currentPage - 2)
          let endPage = Math.min(totalPages - 1, currentPage + 2)

          if (endPage - startPage < 4) {
            if (startPage === 0) {
              endPage = Math.min(totalPages - 1, startPage + 4)
            } else if (endPage === totalPages - 1) {
              startPage = Math.max(0, endPage - 4)
            }
          }

          const pages = []
          for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
          }

          return (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 bg-white">
              <p className="text-sm text-slate-500">
                Hiển thị trang {currentPage + 1} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(0)}
                >
                  Trang đầu
                </button>
                
                {pages.map((p) => (
                  <button
                    key={p}
                    className={[
                      'rounded-md px-3 py-1.5 text-sm font-medium transition min-w-[36px]',
                      currentPage === p
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                    onClick={() => handlePageChange(p)}
                  >
                    {p + 1}
                  </button>
                ))}

                <button
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(totalPages - 1)}
                >
                  Trang cuối
                </button>
              </div>
            </div>
          )
        })() : null}
      </section>

      {selectedRequestId && (
        <CreateWorkOrderModal
          defaultRequestId={selectedRequestId}
          employees={employees}
          onClose={() => {
            setSelectedRequestId(null)
            dispatch(fetchPendingRequests())
          }}
          requests={requests}
        />
      )}
    </div>
  )
}
