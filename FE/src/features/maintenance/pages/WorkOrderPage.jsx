import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Plus,
  Search,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'
import { fetchHrDirectoryData } from '@/features/hr/store/hr-directory.thunks.js'
import { selectHrEmployees } from '@/features/hr/store/hr-directory.selectors.js'
import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { ROLES, hasAnyRole } from '@/features/auth/utils/roles.js'

import { exportWorkOrderPdfService } from '../services/maintenance.service.js'
import {
  selectWorkOrders,
  selectWorkOrderLoading,
  selectWorkOrderError,
  selectWorkOrder,
  selectRequests,
} from '../store/maintenance.selectors.js'
import {
  fetchWorkOrders,
  createWorkOrder,
  fetchPendingRequests,
  uploadWorkOrderSignedPdf,
} from '../store/maintenance.thunks.js'
import { clearWorkOrderError } from '../store/maintenance.reducer.js'
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal.jsx'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_CONFIG = {
  draft:    { label: 'Đang đóng', className: 'bg-slate-100 text-slate-600' },
  paused:   { label: 'Đang đóng', className: 'bg-slate-100 text-slate-600' },
  open:     { label: 'Đang mở',   className: 'bg-blue-100 text-blue-700' },
  locked:   { label: 'Hoàn thành',className: 'bg-emerald-100 text-emerald-700' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${cfg.className}`}>
      {status === 'locked' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {cfg.label}
    </span>
  )
}

// ── PDF Preview Modal ────────────────────────────────────────────────────────
function PdfPreviewModal({ pdfUrl, onClose, onDownload, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
          <div>
            <p className="text-base font-bold text-slate-950">{title || 'Xem trước tài liệu PDF'}</p>
            <p className="text-xs text-slate-500">Xem trước trực tuyến hoặc lưu tài liệu về máy tính</p>
          </div>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 bg-slate-100 p-2">
          <iframe
            src={pdfUrl}
            className="w-full h-full border border-slate-200 rounded-md bg-white"
            title="PDF Preview"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-white">
          <Button onClick={onClose} variant="secondary">
            Đóng
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={onDownload}>
            <Download size={16} />
            Tải PDF về máy
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Employee Search Input ────────────────────────────────────────────────────
function EmployeeSearchInput({ employees, value, onChange, placeholder, required }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const selectedName = useMemo(
    () => employees.find((e) => e.employeeId === value)?.employeeName || '',
    [employees, value],
  )

  function handleFocus() {
    setQuery(selectedName)
    setOpen(true)
  }

  const filtered = useMemo(() => {
    const kw = query.trim().toLowerCase()
    if (!kw) return employees.slice(0, 10)
    return employees
      .filter((e) => e.employeeName?.toLowerCase().includes(kw) || e.positionName?.toLowerCase().includes(kw))
      .slice(0, 10)
  }, [employees, query])

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
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
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); if (!e.target.value) onChange('') }}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required && !value}
          type="text"
          value={open ? query : selectedName}
        />
        {value ? (
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={handleClear} type="button">
            <X size={13} />
          </button>
        ) : null}
      </div>
      {open && filtered.length > 0 ? (
        <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.map((emp) => (
            <li key={emp.employeeId}>
              <button className="flex w-full flex-col px-3 py-2 text-left hover:bg-violet-50" onMouseDown={() => handleSelect(emp)} type="button">
                <span className="text-sm font-medium text-slate-800">{emp.employeeName}</span>
                {emp.positionName ? <span className="text-xs text-slate-400">{emp.positionName}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

// ── Create Work Order Modal ───────────────────────────────────────────────────
function CreateWorkOrderModal({ onClose, requests, employees }) {
  const dispatch = useDispatch()
  const loading = useSelector(selectWorkOrderLoading)
  const error = useSelector(selectWorkOrderError)
  const workOrder = useSelector(selectWorkOrder)

  const [form, setForm] = useState({ requestId: '', content: '', startDate: '', endDate: '', workLeaderId: '', directCommanderId: '', safetySupervisorId: '', memberIds: [] })
  const prevWorkOrder = useRef(workOrder)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (workOrder && workOrder !== prevWorkOrder.current) setSuccess(true)
    prevWorkOrder.current = workOrder
  }, [workOrder])

  useEffect(() => { dispatch(clearWorkOrderError()) }, [dispatch])

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

  function set(field, value) { setForm((prev) => ({ ...prev, [field]: value })) }

  function toggleMember(id) {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(id) ? prev.memberIds.filter((x) => x !== id) : [...prev.memberIds, id],
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

  const memberCandidates = useMemo(
    () => employees.filter((e) => e.employeeId !== form.workLeaderId && e.employeeId !== form.directCommanderId && e.employeeId !== form.safetySupervisorId),
    [employees, form.workLeaderId, form.directCommanderId, form.safetySupervisorId],
  )

  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1'
  const textareaCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'
  const inputCls = 'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-base font-bold text-slate-950">Tạo Phiếu Công Tác</p>
            <p className="mt-0.5 text-xs text-slate-500">Số PCT sẽ được tự động sinh. Chỉ 3 vị trí lãnh đạo là bắt buộc.</p>
          </div>
          <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={onClose}><X size={18} /></button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-emerald-100">
              <CheckCircle2 className="text-emerald-600" size={28} />
            </div>
            <p className="text-base font-bold text-slate-950">Tạo PCT thành công!</p>
            <p className="mt-1 text-sm text-slate-500">Số PCT: <strong className="text-violet-700">{workOrder?.orderNumber}</strong></p>
            <Button className="mt-6 bg-violet-600 hover:bg-violet-700" onClick={onClose}>Đóng</Button>
          </div>
        ) : (
          <form className="space-y-5 p-6" onSubmit={handleSubmit}>
            <div>
              <label className={labelCls}>Liên kết yêu cầu sửa chữa (tuỳ chọn)</label>
              <select className={inputCls} onChange={(e) => set('requestId', e.target.value)} value={form.requestId}>
                <option value="">— Không liên kết request nào —</option>
                {requests.map((r) => (
                  <option key={r.requestId} value={r.requestId}>[{r.priority?.toUpperCase()}] {r.equipmentKksCode} – {r.equipmentName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Nội dung công việc</label>
              <textarea className={textareaCls} onChange={(e) => set('content', e.target.value)} placeholder="Mô tả chi tiết công việc... (có thể bỏ trống)" rows={3} value={form.content} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Thời gian bắt đầu</label>
                <input className={inputCls} onChange={(e) => set('startDate', e.target.value)} type="datetime-local" value={form.startDate} />
              </div>
              <div>
                <label className={labelCls}>Thời gian kết thúc</label>
                <input className={inputCls} onChange={(e) => set('endDate', e.target.value)} type="datetime-local" value={form.endDate} />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Nhân sự phụ trách <span className="text-rose-500">*</span> (bắt buộc)</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Lãnh đạo thi công</label>
                  <EmployeeSearchInput employees={employees} onChange={(id) => set('workLeaderId', id)} placeholder="Tìm tên nhân viên..." required value={form.workLeaderId} />
                </div>
                <div>
                  <label className={labelCls}>Chỉ huy trực tiếp</label>
                  <EmployeeSearchInput employees={employees} onChange={(id) => set('directCommanderId', id)} placeholder="Tìm tên nhân viên..." required value={form.directCommanderId} />
                </div>
                <div>
                  <label className={labelCls}>Giám sát an toàn</label>
                  <EmployeeSearchInput employees={employees} onChange={(id) => set('safetySupervisorId', id)} placeholder="Tìm tên nhân viên..." required value={form.safetySupervisorId} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Thành viên thi công (tuỳ chọn)</label>
              <div className="max-h-36 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                {memberCandidates.length === 0 ? (
                  <p className="text-xs text-slate-400">Không có nhân viên phù hợp.</p>
                ) : (
                  memberCandidates.map((emp) => (
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 hover:bg-white" key={emp.employeeId}>
                      <input checked={form.memberIds.includes(emp.employeeId)} className="accent-violet-600" onChange={() => toggleMember(emp.employeeId)} type="checkbox" />
                      <span className="text-sm text-slate-700">
                        {emp.employeeName}
                        {emp.positionName ? <span className="ml-1.5 text-xs text-slate-400">({emp.positionName})</span> : null}
                      </span>
                    </label>
                  ))
                )}
              </div>
              {form.memberIds.length > 0 ? <p className="mt-1 text-xs text-slate-500">Đã chọn {form.memberIds.length} thành viên</p> : null}
            </div>

            {error || validationError ? (
              <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 mt-4">
                <AlertTriangle className="shrink-0 text-rose-500 mt-0.5" size={16} />
                <p className="text-sm font-medium text-rose-700">{error || validationError}</p>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button onClick={onClose} type="button" variant="secondary">Huỷ</Button>
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

// ── Work Order Detail Modal ──────────────────────────────────────────────────
// Removed duplicate inline implementation in favor of shared component

// ── Work Order Row ────────────────────────────────────────────────────────────
function WorkOrderRow({ wo, index, exportingId, onExport, onDetail, onUpload }) {
  const isExporting = exportingId === wo.orderId
  const [expanded, setExpanded] = useState(false)
  const contentLong = wo.content && wo.content.length > 60

  return (
    <tr className="hover:bg-slate-50/50 transition">
      <td className="px-5 py-4 text-center font-medium text-slate-500">{index + 1}</td>
      <td className="px-5 py-4 font-mono font-semibold text-violet-700">{wo.orderNumber}</td>
      <td className="px-5 py-4 text-slate-700">
        <p className="font-semibold">{wo.equipmentKksCode || '—'}</p>
        {wo.equipmentName && <p className="text-xs text-slate-400 mt-0.5">{wo.equipmentName}</p>}
      </td>
      <td className="max-w-[200px] px-5 py-4 text-slate-600">
        {wo.content ? (
          contentLong ? (
            <div>
              <p className="text-sm">{expanded ? wo.content : wo.content.slice(0, 60) + '…'}</p>
              <button className="text-xs text-violet-600 hover:underline mt-0.5" onClick={() => setExpanded(v => !v)}>
                {expanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            </div>
          ) : <p className="text-sm">{wo.content}</p>
        ) : <span className="text-slate-400">—</span>}
      </td>
      <td className="px-5 py-4 text-slate-600">
        {wo.workLeader ? (
          <div>
            <p className="font-medium text-slate-800">{wo.workLeader.name}</p>
            {wo.workLeader.positionName && <p className="text-xs text-slate-400">{wo.workLeader.positionName}</p>}
          </div>
        ) : <span className="text-slate-400">—</span>}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDateTime(wo.createdAt)}</td>
      <td className="px-5 py-4"><StatusBadge status={wo.status} /></td>
      
      {/* Bản ký column */}
      <td className="px-5 py-4 text-center whitespace-nowrap">
        {wo.pdfUrl ? (
          <a
            href={wo.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded transition"
          >
            <CheckCircle2 size={13} />
            Xem bản ký
          </a>
        ) : (
          <div className="flex items-center justify-center">
            <input
              accept=".pdf"
              className="hidden"
              id={`upload-wo-pdf-${wo.orderId}`}
              disabled={wo.status !== 'locked'}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUpload(wo.orderId, file)
              }}
              type="file"
            />
            <label
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition ${
                wo.status === 'locked'
                  ? 'cursor-pointer text-violet-700 bg-violet-50 hover:bg-violet-100'
                  : 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
              }`}
              htmlFor={wo.status === 'locked' ? `upload-wo-pdf-${wo.orderId}` : undefined}
              title={wo.status !== 'locked' ? 'Chỉ được upload bản ký khi PCT đã hoàn thành (locked)' : ''}
            >
              <Upload size={13} />
              Tải lên bản ký
            </label>
          </div>
        )}
      </td>

      {/* Thao tác column */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            onClick={onDetail}
          >
            Chi tiết
          </button>
          <button
            className="flex items-center gap-1 rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 transition disabled:opacity-50"
            disabled={isExporting}
            onClick={() => onExport(wo)}
          >
            {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {isExporting ? 'Đang xuất…' : 'Xuất PDF'}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function WorkOrderPage() {
  const dispatch = useDispatch()
  const workOrders = useSelector(selectWorkOrders)
  const loading = useSelector(selectWorkOrderLoading)
  const error = useSelector(selectWorkOrderError)
  const requests = useSelector(selectRequests)
  const employees = useSelector(selectHrEmployees)
  const currentUser = useSelector(selectCurrentUser)

  const canCreate = hasAnyRole(currentUser, [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER])

  const [searchOrderNumber, setSearchOrderNumber] = useState('')
  const [searchKksCode, setSearchKksCode] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [exportingId, setExportingId] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)

  // Preview Modal States
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const [previewOrderNumber, setPreviewOrderNumber] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  useEffect(() => {
    dispatch(fetchWorkOrders({}))
    dispatch(fetchPendingRequests())
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  // Auto-search debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchWorkOrders({
        orderNumber: searchOrderNumber.trim() || undefined,
        kksCode: searchKksCode.trim() || undefined,
      }))
    }, 350)
    return () => clearTimeout(timer)
  }, [dispatch, searchOrderNumber, searchKksCode])

  // Client-side filtering by statusFilter (bao gồm cả trạng thái locked - Hoàn thành)
  const displayedWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      if (statusFilter === 'all') return true
      if (statusFilter === 'draft') return wo.status === 'draft' || wo.status === 'paused'
      if (statusFilter === 'open') return wo.status === 'open'
      if (statusFilter === 'locked') return wo.status === 'locked'
      return true
    })
  }, [workOrders, statusFilter])

  // Pagination logic
  const pageSize = 10
  const totalElements = displayedWorkOrders.length
  const totalPages = Math.ceil(totalElements / pageSize)

  const paginatedWorkOrders = useMemo(() => {
    const start = currentPage * pageSize
    return displayedWorkOrders.slice(start, start + pageSize)
  }, [displayedWorkOrders, currentPage])

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  function handleCreateClose() {
    setCreateModalOpen(false)
    dispatch(fetchWorkOrders({}))
    dispatch(fetchPendingRequests())
  }

  async function handleOpenPdfPreview(wo) {
    try {
      setExportingId(wo.orderId)
      const blob = await exportWorkOrderPdfService(wo.orderId)
      const url = URL.createObjectURL(blob)
      setPreviewPdfUrl(url)
      setPreviewOrderNumber(wo.orderNumber || 'PCT')
      setPreviewTitle(`Xem trước Phiếu Công Tác - ${wo.orderNumber || ''}`)
    } catch (err) {
      alert('Không thể xuất PDF: ' + err.message)
    } finally {
      setExportingId(null)
    }
  }

  function handleDownloadPdf() {
    if (!previewPdfUrl) return
    const a = document.createElement('a')
    a.href = previewPdfUrl
    a.download = `${previewOrderNumber}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  async function handleFileUpload(orderId, file) {
    if (!file) return
    const result = await dispatch(uploadWorkOrderSignedPdf({ orderId, file }))
    if (uploadWorkOrderSignedPdf.fulfilled.match(result)) {
      dispatch(fetchWorkOrders({
        orderNumber: searchOrderNumber.trim() || undefined,
        kksCode: searchKksCode.trim() || undefined,
      }))
    }
  }

  return (
    <div className="p-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-slate-900">Phiếu Công Tác</h1>
        <p className="text-sm text-slate-500">Danh sách phiếu công tác (PCT) — xem và xuất phiếu theo mẫu chuẩn để ký trước khi sửa chữa</p>
      </header>

      <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Tìm theo Số PCT..."
              value={searchOrderNumber}
              onChange={(e) => {
                setSearchOrderNumber(e.target.value)
                setCurrentPage(0)
              }}
            />
          </label>
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Tìm theo Mã KKS thiết bị..."
              value={searchKksCode}
              onChange={(e) => {
                setSearchKksCode(e.target.value)
                setCurrentPage(0)
              }}
            />
          </label>
          
          <select
            className="h-11 min-w-44 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Đang đóng</option>
            <option value="open">Đang mở</option>
            <option value="locked">Hoàn thành</option>
          </select>
        </div>

        {canCreate && (
          <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setCreateModalOpen(true)}>
            <Plus size={17} />
            Tạo phiếu công tác
          </Button>
        )}
      </section>

      {error && (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>
      )}

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {paginatedWorkOrders.length} / {totalElements} phiếu công tác
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/50 text-sm uppercase font-bold text-slate-700">
              <tr>
                <th className="w-16 px-5 py-3 text-center">STT</th>
                <th className="px-5 py-3">Số PCT</th>
                <th className="px-5 py-3">Thiết bị (KKS)</th>
                <th className="px-5 py-3">Nội dung</th>
                <th className="px-5 py-3">Lãnh đạo thi công</th>
                <th className="px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-center">Bản ký</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && !displayedWorkOrders.length ? (
                <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-400"><Loader2 className="animate-spin inline-block mr-2" size={18} />Đang tải dữ liệu...</td></tr>
              ) : !displayedWorkOrders.length ? (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">Không có phiếu công tác nào.</td></tr>
              ) : (
                paginatedWorkOrders.map((wo, index) => (
                  <WorkOrderRow key={wo.orderId} wo={wo} index={currentPage * pageSize + index} exportingId={exportingId} onExport={handleOpenPdfPreview} onDetail={() => setDetailItem(wo)} onUpload={handleFileUpload} />
                ))
              )}
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

      {createModalOpen && (
        <CreateWorkOrderModal employees={employees} onClose={handleCreateClose} requests={requests} />
      )}

      {detailItem && (
        <WorkOrderDetailModal
          workOrder={detailItem}
          onClose={() => setDetailItem(null)}
          onSuccess={() => {
            dispatch(fetchWorkOrders({
              orderNumber: searchOrderNumber.trim() || undefined,
              kksCode: searchKksCode.trim() || undefined,
            }))
          }}
        />
      )}

      {previewPdfUrl && (
        <PdfPreviewModal
          pdfUrl={previewPdfUrl}
          title={previewTitle}
          onClose={() => {
            URL.revokeObjectURL(previewPdfUrl)
            setPreviewPdfUrl('')
            setPreviewOrderNumber('')
            setPreviewTitle('')
          }}
          onDownload={handleDownloadPdf}
        />
      )}
    </div>
  )
}

