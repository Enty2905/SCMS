import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Plus,
  Search,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'
import { apiClient } from '@/shared/api/httpClient.js'

import {
  selectAssessments,
  selectAssessmentError,
  selectAssessmentLoading,
} from '../store/maintenance.selectors.js'
import {
  createAssessment,
  fetchAssessments,
  uploadSignedPdf,
} from '../store/maintenance.thunks.js'
import { clearAssessmentError } from '../store/maintenance.reducer.js'
import {
  downloadSignedPdfService,
  exportPdfService,
} from '../services/maintenance.service.js'

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isSign = status === 'signed'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
        isSign ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {isSign ? <CheckCircle2 size={12} /> : <FileText size={12} />}
      {isSign ? 'Đã ký' : 'Chờ ký'}
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

// ── PDF Preview Modal ────────────────────────────────────────────────────────
function PdfPreviewModal({ pdfUrl, onClose, onDownload, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
          <div>
            <p className="text-base font-bold text-slate-950">{title || 'Xem trước tài liệu PDF'}</p>
            <p className="text-xs text-slate-500">Xem trực tiếp nội dung trước khi in hoặc lưu về máy</p>
          </div>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content iframe */}
        <div className="flex-1 bg-slate-100 p-2">
          <iframe
            src={pdfUrl}
            className="w-full h-full border border-slate-200 rounded-md bg-white"
            title="PDF Preview"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-white">
          <Button onClick={onClose} variant="secondary">
            Đóng xem trước
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={onDownload}>
            <Download size={16} />
            Tải PDF về máy
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function TechnicalAssessmentPage() {
  const dispatch = useDispatch()
  const assessments = useSelector(selectAssessments)
  const loading = useSelector(selectAssessmentLoading)
  const error = useSelector(selectAssessmentError)

  const [showForm, setShowForm] = useState(false)
  const [searchNumber, setSearchNumber] = useState('')
  const [searchKks, setSearchKks] = useState('')
  const [searchEqName, setSearchEqName] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')

  const [form, setForm] = useState({
    equipmentId: '',
    damageDescription: '',
    proposedAction: '',
  })

  // State for equipment searching
  const [equipments, setEquipments] = useState([])
  const [equipmentsLoading, setEquipmentsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [innerSearchName, setInnerSearchName] = useState('')
  const [innerSearchKks, setInnerSearchKks] = useState('')
  const [showEqSuggestions, setShowEqSuggestions] = useState(false)
  const searchWrapRef = useRef(null)

  // State for PDF preview
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [pdfFilename, setPdfFilename] = useState('')
  const [exportLoadingId, setExportLoadingId] = useState(null)
  const [exportError, setExportError] = useState(null)

  // Fetch assessments and equipments list on mount
  useEffect(() => {
    let ignore = false

    dispatch(fetchAssessments())

    apiClient.get('/equipment')
      .then((res) => {
        if (!ignore) {
          setEquipments(res.data || [])
        }
      })
      .catch((err) => {
        console.error('Không thể lấy danh sách thiết bị', err)
      })
      .finally(() => {
        if (!ignore) {
          setEquipmentsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [dispatch])

  // Auto-close suggestions dropdown when click outside
  useEffect(() => {
    function handler(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowEqSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Extract unique equipment types
  const equipmentTypes = useMemo(() => {
    const types = equipments.map((e) => e.equipmentType).filter(Boolean)
    return Array.from(new Set(types))
  }, [equipments])

  // Filter equipments list
  const filteredEquipments = useMemo(() => {
    const nameKw = innerSearchName.trim().toLowerCase()
    const kksKw = innerSearchKks.trim().toLowerCase()
    return equipments.filter((e) => {
      const matchType = selectedType === 'all' || e.equipmentType === selectedType
      const matchName = !nameKw || e.equipmentName?.toLowerCase().includes(nameKw)
      const matchKks = !kksKw || e.kksCode?.toLowerCase().includes(kksKw)
      return matchType && matchName && matchKks
    })
  }, [equipments, selectedType, innerSearchName, innerSearchKks])

  // Current selected equipment object
  const selectedEquipment = useMemo(() => {
    return equipments.find((e) => e.id === form.equipmentId)
  }, [equipments, form.equipmentId])

  // Filter assessments list
  const filteredAssessments = useMemo(() => {
    const numKw = searchNumber.trim().toLowerCase()
    const kksKw = searchKks.trim().toLowerCase()
    const nameKw = searchEqName.trim().toLowerCase()
    return assessments.filter((a) => {
      const matchNumber = !numKw || a.assessmentNumber?.toLowerCase().includes(numKw)
      const matchKks = !kksKw || a.equipmentKksCode?.toLowerCase().includes(kksKw)
      const matchName = !nameKw || a.equipmentName?.toLowerCase().includes(nameKw)
      const matchStatus = statusFilter === 'all' || a.completionStatus === statusFilter
      return matchNumber && matchKks && matchName && matchStatus
    })
  }, [assessments, searchNumber, searchKks, searchEqName, statusFilter])

  const pageSize = 10
  const totalElements = filteredAssessments.length
  const totalPages = Math.ceil(totalElements / pageSize)

  const paginatedAssessments = useMemo(() => {
    const start = currentPage * pageSize
    return filteredAssessments.slice(start, start + pageSize)
  }, [filteredAssessments, currentPage])

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  function handleStatusFilterChange(val) {
    setStatusFilter(val)
    setCurrentPage(0)
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    dispatch(clearAssessmentError())
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.equipmentId) {
      alert('Vui lòng chọn thiết bị!')
      return
    }
    const result = await dispatch(createAssessment(form))
    if (createAssessment.fulfilled.match(result)) {
      setShowForm(false)
      dispatch(fetchAssessments())
    }
  }

  // Handle Export / Preview PDF (draft / generated from BE)
  async function handlePreviewPdf(assessmentId, isSigned, assessmentNum) {
    setExportLoadingId(assessmentId)
    setExportError(null)
    try {
      let blob
      if (isSigned) {
        // Tải file đã được ký vật lý và upload lên
        blob = await downloadSignedPdfService(assessmentId)
      } else {
        // Tải file tự sinh từ thông tin database
        blob = await exportPdfService(assessmentId)
      }
      const url = URL.createObjectURL(blob)
      setPdfBlob(blob)
      setPdfPreviewUrl(url)
      setPdfFilename(`${isSigned ? 'signed_' : ''}bien_ban_danh_gia_${assessmentNum || assessmentId.substring(0, 8)}.pdf`)
    } catch (err) {
      setExportError(err.message || 'Không thể xuất file PDF')
    } finally {
      setExportLoadingId(null)
    }
  }

  // File Upload handler for signed PDF
  async function handleFileUpload(assessmentId, file) {
    if (!file) return
    const result = await dispatch(uploadSignedPdf({ assessmentId, file }))
    if (uploadSignedPdf.fulfilled.match(result)) {
      dispatch(fetchAssessments())
    }
  }

  function handleDownloadPdf() {
    if (!pdfBlob) return
    const a = document.createElement('a')
    a.href = pdfPreviewUrl
    a.download = pdfFilename
    a.click()
  }

  // Auto reset form on toggle
  const prevShowForm = useRef(showForm)
  useEffect(() => {
    if (showForm !== prevShowForm.current) {
      setForm({ equipmentId: '', damageDescription: '', proposedAction: '' })
      setInnerSearchName('')
      setInnerSearchKks('')
      setSelectedType('all')
    }
    prevShowForm.current = showForm
  }, [showForm])

  function handleClosePreview() {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl)
    }
    setPdfPreviewUrl(null)
    setPdfBlob(null)
  }

  const inputCls =
    'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1'

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <section className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Biên bản đánh giá kỹ thuật</h1>
          <p className="mt-1 text-sm text-slate-500">
            Lập, xem chi tiết và quản lý các biên bản đánh giá kỹ thuật.
          </p>
        </div>
        {!showForm ? (
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            onClick={() => {
              setShowForm(true)
            }}
          >
            <Plus size={17} />
            Tạo biên bản mới
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Quay lại danh sách
          </Button>
        )}
      </section>

      <div className="mt-6 space-y-6">
        {error ? (
          <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertTriangle className="shrink-0 text-rose-500" size={16} />
            <p>{error}</p>
          </div>
        ) : null}

        {/* Create form view */}
        {showForm ? (
          <div className="max-w-3xl mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-5 text-base font-bold text-slate-950">Tạo biên bản mới</p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Equipment Search Section */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" ref={searchWrapRef}>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Chọn thiết bị cần đánh giá <span className="text-rose-500">*</span>
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>Chọn loại thiết bị</label>
                    <select
                      className={inputCls}
                      onChange={(e) => setSelectedType(e.target.value)}
                      value={selectedType}
                    >
                      <option value="all">Tất cả loại thiết bị</option>
                      {equipmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tìm theo Tên thiết bị</label>
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={14}
                      />
                      <input
                        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                        onChange={(e) => {
                          setInnerSearchName(e.target.value)
                          setShowEqSuggestions(true)
                        }}
                        onFocus={() => setShowEqSuggestions(true)}
                        placeholder="Nhập tên thiết bị..."
                        type="text"
                        value={innerSearchName}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Tìm theo Mã KKS</label>
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={14}
                      />
                      <input
                        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                        onChange={(e) => {
                          setInnerSearchKks(e.target.value)
                          setShowEqSuggestions(true)
                        }}
                        onFocus={() => setShowEqSuggestions(true)}
                        placeholder="Nhập mã KKS..."
                        type="text"
                        value={innerSearchKks}
                      />
                    </div>
                  </div>
                </div>

                {/* Suggestions List */}
                {showEqSuggestions && (
                  <div className="relative mt-1">
                    <ul className="absolute z-20 w-full max-h-52 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                      {equipmentsLoading ? (
                        <li className="px-4 py-2 text-sm text-slate-400">Đang tải danh sách thiết bị...</li>
                      ) : filteredEquipments.length === 0 ? (
                        <li className="px-4 py-2 text-sm text-slate-400">Không tìm thấy thiết bị phù hợp</li>
                      ) : (
                        filteredEquipments.map((eq) => (
                          <li key={eq.id}>
                            <button
                              className={`flex w-full flex-col px-4 py-2 text-left hover:bg-violet-50 ${
                                form.equipmentId === eq.id ? 'bg-violet-50 font-medium' : ''
                              }`}
                              onMouseDown={() => {
                                set('equipmentId', eq.id)
                                setInnerSearchName(eq.equipmentName)
                                setInnerSearchKks(eq.kksCode)
                                setShowEqSuggestions(false)
                              }}
                              type="button"
                            >
                              <span className="text-sm text-slate-800">
                                {eq.equipmentName} ({eq.kksCode})
                              </span>
                              <span className="text-xs text-slate-400">
                                Loại: {eq.equipmentType} | Vị trí: {eq.location || 'Chưa xác định'}
                              </span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}

                {/* Selected Equipment Info Banner */}
                {selectedEquipment && (
                  <div className="mt-4 rounded-md border border-violet-100 bg-violet-50/40 p-3 text-xs text-slate-700">
                    <p className="font-bold text-violet-800">Thiết bị đã chọn:</p>
                    <p className="mt-1">
                      <span className="font-semibold">Tên:</span> {selectedEquipment.equipmentName}
                    </p>
                    <p>
                      <span className="font-semibold">Mã KKS:</span> {selectedEquipment.kksCode}
                    </p>
                    <p>
                      <span className="font-semibold">Loại:</span> {selectedEquipment.equipmentType}
                    </p>
                    <p>
                      <span className="font-semibold">Vị trí:</span> {selectedEquipment.location || '—'}
                    </p>
                  </div>
                )}
              </div>

              {/* damageDescription (Optional) */}
              <div>
                <label className={labelCls}>
                  Mô tả hư hỏng <span className="text-slate-400 font-normal">(Tùy chọn - có thể để trống để viết tay)</span>
                </label>
                <textarea
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  onChange={(e) => set('damageDescription', e.target.value)}
                  placeholder="Mô tả chi tiết tình trạng hư hỏng... (Để trống nếu viết tay ở bản cứng)"
                  rows={4}
                  value={form.damageDescription}
                />
              </div>

              {/* proposedAction (Optional) */}
              <div>
                <label className={labelCls}>
                  Phương án xử lý đề xuất <span className="text-slate-400 font-normal">(Tùy chọn - có thể để trống để viết tay)</span>
                </label>
                <textarea
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  onChange={(e) => set('proposedAction', e.target.value)}
                  placeholder="Đề xuất phương án sửa chữa... (Để trống nếu viết tay ở bản cứng)"
                  rows={3}
                  value={form.proposedAction}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <Button onClick={() => setShowForm(false)} type="button" variant="secondary">
                  Huỷ
                </Button>
                <Button
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={loading || !form.equipmentId}
                  type="submit"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  {loading ? 'Đang tạo...' : 'Tạo biên bản'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* List View */
          <>
            {/* Filters với Phân tách 3 trường tìm kiếm lọc đồng thời */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                    onChange={(e) => {
                      setSearchNumber(e.target.value)
                      setCurrentPage(0)
                    }}
                    placeholder="Tìm theo Số biên bản..."
                    value={searchNumber}
                  />
                </label>
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                    onChange={(e) => {
                      setSearchKks(e.target.value)
                      setCurrentPage(0)
                    }}
                    placeholder="Tìm theo Mã KKS..."
                    value={searchKks}
                  />
                </label>
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                    onChange={(e) => {
                      setSearchEqName(e.target.value)
                      setCurrentPage(0)
                    }}
                    placeholder="Tìm theo Tên thiết bị..."
                    value={searchEqName}
                  />
                </label>
              </div>

              <select
                className="h-10 min-w-44 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                value={statusFilter}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Chờ ký (Draft)</option>
                <option value="signed">Đã ký (Signed)</option>
              </select>
            </section>

            {/* Error alerts */}
            {exportError && (
              <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 animate-in fade-in duration-150">
                <AlertTriangle className="shrink-0 text-rose-500" size={16} />
                <p>{exportError}</p>
              </div>
            )}

            {/* Index Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
                    <tr className="border-b border-slate-200">
                      <th className="w-16 px-6 py-4 text-center">STT</th>
                      <th className="px-6 py-4">Số biên bản</th>
                      <th className="px-6 py-4">Thiết bị</th>
                      <th className="px-6 py-4">Người lập</th>
                      <th className="px-6 py-4">Ngày tạo</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4 text-center">Tệp đính kèm</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading && assessments.length === 0 ? (
                      <tr>
                        <td className="px-6 py-10 text-center text-slate-400" colSpan={8}>
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-violet-500" size={18} />
                            Đang tải danh sách biên bản...
                          </span>
                        </td>
                      </tr>
                    ) : filteredAssessments.length === 0 ? (
                      <tr>
                        <td className="px-6 py-10 text-center text-slate-400" colSpan={8}>
                          Không tìm thấy biên bản đánh giá kỹ thuật nào.
                        </td>
                      </tr>
                    ) : (
                      paginatedAssessments.map((a, index) => {
                        const isSigned = a.completionStatus === 'signed'
                        return (
                          <tr className="hover:bg-slate-50/50 transition-colors" key={a.assessmentId}>
                            <td className="px-6 py-4 text-center font-medium text-slate-500">
                              {currentPage * pageSize + index + 1}
                            </td>
                            {/* Số biên bản */}
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {a.assessmentNumber || 'BB-DGKT-xxxx'}
                            </td>

                            {/* Thiết bị */}
                            <td className="px-6 py-4">
                              <div className="min-w-[180px]">
                                <p className="font-medium text-slate-900">{a.equipmentName}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{a.equipmentKksCode}</p>
                              </div>
                            </td>

                            {/* Người lập */}
                            <td className="px-6 py-4 text-slate-600">
                              <div>
                                <p className="font-medium">{a.createdByName}</p>
                                <p className="text-xs text-slate-400">{a.createdByPosition || '—'}</p>
                              </div>
                            </td>

                            {/* Ngày tạo */}
                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                              {formatDateTime(a.createdAt)}
                            </td>

                            {/* Trạng thái */}
                            <td className="px-6 py-4">
                              <StatusBadge status={a.completionStatus} />
                            </td>

                            {/* Tệp đính kèm / Xem file đã ký */}
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              {isSigned ? (
                                <button
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded transition"
                                  onClick={() => handlePreviewPdf(a.assessmentId, true, a.assessmentNumber)}
                                >
                                  <CheckCircle2 size={13} />
                                  Xem file đã ký
                                </button>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <input
                                    accept=".pdf"
                                    className="hidden"
                                    id={`upload-file-${a.assessmentId}`}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleFileUpload(a.assessmentId, file)
                                    }}
                                    type="file"
                                  />
                                  <label
                                    className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1.5 rounded transition"
                                    htmlFor={`upload-file-${a.assessmentId}`}
                                  >
                                    <Upload size={13} />
                                    Tải lên bản ký
                                  </label>
                                </div>
                              )}
                            </td>

                            {/* Thao tác */}
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-700 bg-slate-100 hover:bg-violet-50 px-3 py-1.5 rounded transition"
                                disabled={exportLoadingId === a.assessmentId}
                                onClick={() => handlePreviewPdf(a.assessmentId, false, a.assessmentNumber)}
                              >
                                {exportLoadingId === a.assessmentId ? (
                                  <Loader2 className="animate-spin mr-1" size={13} />
                                ) : null}
                                Xem trước & In
                              </button>
                            </td>
                          </tr>
                        )
                      })
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
            </div>
          </>
        )}
      </div>

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <PdfPreviewModal
          onClose={handleClosePreview}
          onDownload={handleDownloadPdf}
          pdfUrl={pdfPreviewUrl}
          title={`Biên bản đánh giá kỹ thuật`}
        />
      )}
    </div>
  )
}
