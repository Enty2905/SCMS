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

import { fetchHrDirectoryData } from '@/features/hr/store/hr-directory.thunks.js'
import { selectHrEmployees } from '@/features/hr/store/hr-directory.selectors.js'
import { Button } from '@/shared/components/ui/Button.jsx'

import {
  selectRequests,
  selectRequestsError,
  selectRequestsLoading,
  selectWorkOrder,
  selectWorkOrderError,
  selectWorkOrderLoading,
} from '../store/maintenance.selectors.js'
import { createWorkOrder, fetchPendingRequests } from '../store/maintenance.thunks.js'
import { clearWorkOrderError } from '../store/maintenance.reducer.js'

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

  useEffect(() => {
    if (workOrder && workOrder !== prevWorkOrder.current) setSuccess(true)
    prevWorkOrder.current = workOrder
  }, [workOrder])

  useEffect(() => {
    dispatch(clearWorkOrderError())
  }, [dispatch])

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
            {error ? (
              <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
                <AlertTriangle className="shrink-0 text-rose-500" size={16} />
                <p className="text-sm font-medium text-rose-700">{error}</p>
              </div>
            ) : null}

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

  // Live search state
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)
  const [priority, setPriority] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [defaultRequestId, setDefaultRequestId] = useState('')

  // Danh sách gợi ý khi gõ (tối đa 6 gợi ý)
  const suggestions = useMemo(() => {
    const kw = query.trim().toLowerCase()
    if (!kw) return []
    return requests
      .filter(
        (r) =>
          r.equipmentKksCode?.toLowerCase().includes(kw) ||
          r.equipmentName?.toLowerCase().includes(kw) ||
          r.description?.toLowerCase().includes(kw) ||
          r.createdByName?.toLowerCase().includes(kw),
      )
      .slice(0, 6)
  }, [requests, query])

  // Danh sách bảng đã lọc (sau khi nhấn Enter hoặc chọn gợi ý)
  const [activeQuery, setActiveQuery] = useState('')
  const filteredRequests = useMemo(() => {
    const kw = activeQuery.trim().toLowerCase()
    return requests.filter((r) => {
      const matchQuery =
        !kw ||
        r.equipmentKksCode?.toLowerCase().includes(kw) ||
        r.equipmentName?.toLowerCase().includes(kw) ||
        r.description?.toLowerCase().includes(kw) ||
        r.createdByName?.toLowerCase().includes(kw)
      const matchPriority = priority === 'all' || r.priority === priority
      return matchQuery && matchPriority
    })
  }, [requests, activeQuery, priority])

  // Đóng dropdown gợi ý khi click ra ngoài
  useEffect(() => {
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    dispatch(fetchPendingRequests())
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  function handleSelectSuggestion(r) {
    setQuery(r.equipmentName || r.equipmentKksCode)
    setActiveQuery(r.equipmentName || r.equipmentKksCode)
    setShowSuggestions(false)
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
      setActiveQuery(query)
      setShowSuggestions(false)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  function handleClearSearch() {
    setQuery('')
    setActiveQuery('')
    setShowSuggestions(false)
  }

  function openModal(requestId = '') {
    setDefaultRequestId(requestId)
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    dispatch(fetchPendingRequests())
  }


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
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => openModal()}>
          <Plus size={17} />
          Tạo phiếu công tác
        </Button>
      </section>

      {/* Filters với Live Search */}
      <section className="mt-5 flex flex-col gap-3 xl:flex-row">
        {/* Live search input */}
        <div className="relative flex-1" ref={searchRef}>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-9 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
              if (!e.target.value) {
                setActiveQuery('')
              }
            }}
            onFocus={() => { if (query) setShowSuggestions(true) }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Tìm mã KKS, tên thiết bị, mô tả... (Enter để tìm)"
            value={query}
          />
          {query ? (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={handleClearSearch}
            >
              <X size={15} />
            </button>
          ) : null}

          {/* Dropdown gợi ý */}
          {showSuggestions && suggestions.length > 0 ? (
            <ul className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white py-1 shadow-lg">
              {suggestions.map((r) => (
                <li key={r.requestId}>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-violet-50"
                    onMouseDown={() => handleSelectSuggestion(r)}
                    type="button"
                  >
                    <Search className="shrink-0 text-slate-300" size={14} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {r.equipmentName}
                        <span className="ml-2 text-xs text-slate-400">{r.equipmentKksCode}</span>
                      </p>
                      <p className="truncate text-xs text-slate-500">{r.description}</p>
                    </div>
                    <PriorityBadge priority={r.priority} />
                  </button>
                </li>
              ))}
              <li className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                Nhấn <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono">Enter</kbd> để tìm kiếm đầy đủ
              </li>
            </ul>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <select
            className="h-11 min-w-44 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(e) => setPriority(e.target.value)}
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
          Hiển thị {filteredRequests.length} / {requests.length} yêu cầu chờ xử lý
        </div>

        {error ? (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
            <AlertTriangle className="shrink-0 text-rose-500" size={16} />
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Thiết bị</th>
                <th className="px-5 py-3 font-semibold">Mô tả sự cố</th>
                <th className="px-5 py-3 font-semibold">Mức độ</th>
                <th className="px-5 py-3 font-semibold">Người tạo</th>
                <th className="px-5 py-3 font-semibold">Ngày tạo</th>
                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
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
                ? filteredRequests.map((r) => (
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
                      <button
                        className="rounded-md bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                        onClick={() => openModal(r.requestId)}
                      >
                        Tạo PCT
                      </button>
                    </td>
                  </tr>
                ))
                : null}
            </tbody>
          </table>
        </div>
      </section>

      {showModal ? (
        <CreateWorkOrderModal
          defaultRequestId={defaultRequestId}
          employees={employees}
          onClose={handleCloseModal}
          requests={requests}
        />
      ) : null}
    </div>
  )
}
