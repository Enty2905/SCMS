import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'
import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { ROLES, hasAnyRole } from '@/features/auth/utils/roles.js'

import {
  clearMaterialsError,
} from '../store/maintenance.reducer.js'
import {
  selectWorkOrders,
  selectConsumableRequests,
  selectConsumableRequestPage,
  selectConsumableRequestTotalPages,
  selectConsumableRequestTotalElements,
  selectSparePartRequests,
  selectSparePartRequestPage,
  selectSparePartRequestTotalPages,
  selectSparePartRequestTotalElements,
  selectMaterialsLoading,
  selectMaterialsError,
} from '../store/maintenance.selectors.js'
import {
  fetchWorkOrders,
  fetchConsumableRequests,
  createConsumableRequest,
  fetchSparePartRequests,
  createSparePartRequest,
} from '../store/maintenance.thunks.js'
import {
  exportConsumableRequestPdfService,
  exportSparePartRequestPdfService,
} from '../services/maintenance.service.js'
import { fetchConsumables } from '@/features/inventory/services/consumable.service.js'
import { fetchSpareParts } from '@/features/inventory/services/sparepart.service.js'



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

// ── Detail Request Modal ─────────────────────────────────────────────────────
function RequestDetailModal({ activeTab, request, onClose }) {
  if (!request) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Chi tiết yêu cầu cấp vật tư</h3>
            <p className="text-xs text-slate-500">Mã yêu cầu: {request.reqNumber}</p>
          </div>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Số phiếu:</p>
              <p className="font-semibold text-slate-950">{request.reqNumber}</p>
            </div>
            <div>
              <p className="text-slate-400">Ngày tạo:</p>
              <p className="font-semibold text-slate-950">{formatDateTime(request.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-400">Phiếu công tác (PCT) liên quan:</p>
              <p className="font-semibold text-slate-950">{request.orderNumber || 'Không có liên kết'}</p>
            </div>
            <div>
              <p className="text-slate-400">Người yêu cầu:</p>
              <p className="font-semibold text-slate-950">{request.createdByName || request.createdByUsername}</p>
            </div>
            <div>
              <p className="text-slate-400">Trạng thái:</p>
              <p className="capitalize font-semibold text-slate-950">{request.status}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-bold text-slate-950 mb-2">Danh sách vật tư yêu cầu</p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="px-4 py-2">Mã vật tư</th>
                    <th className="px-4 py-2">Tên vật tư</th>
                    <th className="px-4 py-2">Đơn vị</th>
                    <th className="px-4 py-2 text-right">SL yêu cầu</th>
                    <th className="px-4 py-2 text-right">SL đã cấp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {request.items?.map((item) => (
                    <tr key={item.itemId}>
                      <td className="px-4 py-2 font-mono">{item.code}</td>
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2">{item.unit || '—'}</td>
                      <td className="px-4 py-2 text-right font-medium">{item.quantityRequested}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-500">{item.quantityIssued}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
          <Button onClick={onClose} variant="secondary">Đóng</Button>
        </div>
      </div>
    </div>
  )
}

// ── Create Request Modal ─────────────────────────────────────────────────────
function CreateRequestModal({ activeTab, onClose, onSuccess, workOrders }) {
  const dispatch = useDispatch()
  const loading = useSelector(selectMaterialsLoading)
  const error = useSelector(selectMaterialsError)

  const [orderId, setOrderId] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [validationError, setValidationError] = useState('')

  // Search PCT (Work Order) logic
  const [pctSearchOrder, setPctSearchOrder] = useState('')
  const [pctSearchEq, setPctSearchEq] = useState('')
  const [showPctSuggestions, setShowPctSuggestions] = useState(false)

  const filteredWorkOrders = useMemo(() => {
    const orderKw = pctSearchOrder.trim().toLowerCase()
    const eqKw = pctSearchEq.trim().toLowerCase()
    return workOrders.filter((wo) => {
      const matchOrder = !orderKw || wo.orderNumber?.toLowerCase().includes(orderKw)
      const matchEq = !eqKw || wo.equipmentName?.toLowerCase().includes(eqKw)
      return matchOrder && matchEq
    })
  }, [workOrders, pctSearchOrder, pctSearchEq])

  const selectedWorkOrder = useMemo(() => {
    return workOrders.find((wo) => wo.orderId === orderId)
  }, [workOrders, orderId])

  // Search materials (CCDC) logic
  const [matSearchCode, setMatSearchCode] = useState('')
  const [matSearchName, setMatSearchName] = useState('')
  const [matList, setMatList] = useState([])
  const [matLoading, setMatLoading] = useState(false)
  const [showMatSuggestions, setShowMatSuggestions] = useState(false)

  const pctWrapRef = useRef(null)
  const matWrapRef = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (pctWrapRef.current && !pctWrapRef.current.contains(e.target)) {
        setShowPctSuggestions(false)
      }
      if (matWrapRef.current && !matWrapRef.current.contains(e.target)) {
        setShowMatSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Search query on type
  useEffect(() => {
    if (!matSearchCode.trim() && !matSearchName.trim()) {
      setMatList([])
      return
    }

    const timer = setTimeout(async () => {
      setMatLoading(true)
      try {
        let results = []
        if (activeTab === 'consumable') {
          const res = await fetchConsumables({
            code: matSearchCode.trim() || undefined,
            name: matSearchName.trim() || undefined,
            size: 5,
          })
          results = res?.content || []
        } else {
          const res = await fetchSpareParts({
            code: matSearchCode.trim() || undefined,
            name: matSearchName.trim() || undefined,
            size: 5,
          })
          results = res?.content || []
        }
        setMatList(results)
      } catch (err) {
        console.error('Lỗi tìm vật tư', err)
      } finally {
        setMatLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [matSearchCode, matSearchName, activeTab])

  const handleAddItem = (mat) => {
    const matId = activeTab === 'consumable' ? mat.consumableId : mat.sparePartId
    const exists = selectedItems.find(
      (item) => (activeTab === 'consumable' ? item.consumableId : item.sparePartId) === matId
    )

    if (exists) return

    setSelectedItems([
      ...selectedItems,
      {
        ...mat,
        quantityRequested: 1,
      },
    ])
    setMatSearchCode('')
    setMatSearchName('')
    setMatList([])
  }

  const handleRemoveItem = (matId) => {
    setSelectedItems(
      selectedItems.filter(
        (item) => (activeTab === 'consumable' ? item.consumableId : item.sparePartId) !== matId
      )
    )
  }

  const handleQuantityChange = (matId, val) => {
    const qty = val === '' ? 0 : parseInt(val, 10)
    setSelectedItems(
      selectedItems.map((item) => {
        const id = activeTab === 'consumable' ? item.consumableId : item.sparePartId
        if (id === matId) {
          return { ...item, quantityRequested: Math.max(0, qty) }
        }
        return item
      })
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!orderId) {
      setValidationError('Vui lòng chọn Phiếu công tác (PCT) liên quan')
      return
    }

    if (!selectedItems.length) {
      setValidationError('Vui lòng chọn ít nhất một vật tư để yêu cầu cấp')
      return
    }

    if (selectedItems.some((item) => item.quantityRequested <= 0)) {
      setValidationError('Số lượng yêu cầu của các vật tư phải lớn hơn 0')
      return
    }

    const payload = {
      orderId: orderId,
      items: selectedItems.map((item) => ({
        [activeTab === 'consumable' ? 'consumableId' : 'sparePartId']: activeTab === 'consumable' ? item.consumableId : item.sparePartId,
        quantityRequested: item.quantityRequested,
      })),
    }

    let actionResult
    if (activeTab === 'consumable') {
      actionResult = await dispatch(createConsumableRequest(payload))
    } else {
      actionResult = await dispatch(createSparePartRequest(payload))
    }

    if (!actionResult.error) {
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Tạo yêu cầu cấp {activeTab === 'consumable' ? 'vật tư tiêu hao' : 'vật tư thay thế'}
              </h3>
              <p className="text-xs text-slate-500">Điền thông tin và lựa chọn danh sách vật tư cần cấp</p>
            </div>
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            {/* Validation errors */}
            {validationError || error ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Lỗi xảy ra</p>
                  <p>{validationError || error}</p>
                </div>
              </div>
            ) : null}

            {/* Select Work Order */}
            <div className="space-y-1.5" ref={pctWrapRef}>
              <label className="text-sm font-bold text-slate-700">
                Phiếu công tác liên quan <span className="text-rose-500">*</span>
              </label>
              {orderId ? (
                <div className="flex items-center justify-between h-11 border border-slate-200 rounded-md bg-slate-50 px-3 text-sm">
                  <span className="font-semibold text-slate-950">
                    {selectedWorkOrder?.orderNumber} - {selectedWorkOrder?.equipmentName || 'Không có thiết bị'} ({selectedWorkOrder?.content})
                  </span>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-rose-600 transition"
                    onClick={() => {
                      setOrderId('')
                      setPctSearchOrder('')
                      setPctSearchEq('')
                    }}
                  >
                    Thay đổi
                  </button>
                </div>
              ) : (
                <div className="space-y-2 relative">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-violet-500"
                        placeholder="Số PCT..."
                        value={pctSearchOrder}
                        onChange={(e) => {
                          setPctSearchOrder(e.target.value)
                          setShowPctSuggestions(true)
                        }}
                        onFocus={() => setShowPctSuggestions(true)}
                      />
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-violet-500"
                        placeholder="Thiết bị..."
                        value={pctSearchEq}
                        onChange={(e) => {
                          setPctSearchEq(e.target.value)
                          setShowPctSuggestions(true)
                        }}
                        onFocus={() => setShowPctSuggestions(true)}
                      />
                    </div>
                  </div>
                  {showPctSuggestions && (
                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg">
                      {filteredWorkOrders.length === 0 ? (
                        <p className="p-3 text-xs text-slate-400 text-center">Không tìm thấy PCT phù hợp</p>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {filteredWorkOrders.map((wo) => (
                            <li key={wo.orderId}>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                                onMouseDown={() => {
                                  setOrderId(wo.orderId)
                                  setShowPctSuggestions(false)
                                }}
                              >
                                <span className="font-bold text-slate-900 block">{wo.orderNumber}</span>
                                <span className="text-slate-500 text-[11px]">
                                  {wo.equipmentName || 'Không có thiết bị'} · {wo.content}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Material */}
            <div className="relative space-y-1.5" ref={matWrapRef}>
              <label className="text-sm font-bold text-slate-700">Tìm kiếm vật tư</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-violet-500"
                    placeholder="Mã vật tư..."
                    value={matSearchCode}
                    onChange={(e) => {
                      setMatSearchCode(e.target.value)
                      setShowMatSuggestions(true)
                    }}
                    onFocus={() => setShowMatSuggestions(true)}
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-violet-500"
                    placeholder="Tên vật tư..."
                    value={matSearchName}
                    onChange={(e) => {
                      setMatSearchName(e.target.value)
                      setShowMatSuggestions(true)
                    }}
                    onFocus={() => setShowMatSuggestions(true)}
                  />
                </div>
              </div>

              {/* Autocomplete suggestion drop panel */}
              {showMatSuggestions && (
                <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {matLoading ? (
                    <p className="p-3 text-xs text-slate-400 text-center">Đang tải tìm kiếm...</p>
                  ) : matList.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {matList.map((m) => {
                        const id = activeTab === 'consumable' ? m.consumableId : m.sparePartId
                        return (
                          <li key={id}>
                            <button
                              type="button"
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 flex items-center justify-between"
                              onMouseDown={() => {
                                handleAddItem(m)
                                setShowMatSuggestions(false)
                              }}
                            >
                              <div>
                                <span className="font-semibold text-slate-900">{m.name}</span>
                                <span className="text-[11px] text-slate-400 ml-2 font-mono">({m.code})</span>
                              </div>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                ĐVT: {m.unit || '—'}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (matSearchCode.trim() || matSearchName.trim()) ? (
                    <p className="p-3 text-xs text-slate-400 text-center">Không tìm thấy vật tư nào phù hợp</p>
                  ) : null}
                </div>
              )}
            </div>

            {/* List of selected items */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Vật tư đã chọn cấp</label>
              {!selectedItems.length ? (
                <div className="rounded-lg border-2 border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                  Chưa chọn vật tư nào. Nhập tên vật tư ở ô tìm kiếm trên để chọn.
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 font-bold text-slate-700">
                      <tr>
                        <th className="px-4 py-2">Mã / Tên</th>
                        <th className="px-4 py-2 w-28 text-center">SL yêu cầu</th>
                        <th className="px-4 py-2 w-16 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedItems.map((item) => {
                        const id = activeTab === 'consumable' ? item.consumableId : item.sparePartId
                        return (
                          <tr key={id}>
                            <td className="px-4 py-2">
                              <p className="font-medium text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-500 font-mono">{item.code} ({item.unit || '—'})</p>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                className="w-full h-9 rounded border border-slate-200 text-center text-sm outline-none transition focus:border-violet-500"
                                value={item.quantityRequested === 0 ? '' : item.quantityRequested}
                                placeholder="0"
                                min="0"
                                onChange={(e) => handleQuantityChange(id, e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                onClick={() => handleRemoveItem(id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
            <Button type="button" variant="secondary" onClick={onClose}>Huỷ bỏ</Button>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Tạo yêu cầu
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page Component ──────────────────────────────────────────────────────
export function MaterialRequestPage() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  // Selector mappings
  const consumableRequests = useSelector(selectConsumableRequests)
  const consumablePage = useSelector(selectConsumableRequestPage)
  const consumableTotalPages = useSelector(selectConsumableRequestTotalPages)
  const consumableTotalElements = useSelector(selectConsumableRequestTotalElements)

  const sparePartRequests = useSelector(selectSparePartRequests)
  const sparePartPage = useSelector(selectSparePartRequestPage)
  const sparePartTotalPages = useSelector(selectSparePartRequestTotalPages)
  const sparePartTotalElements = useSelector(selectSparePartRequestTotalElements)

  const workOrders = useSelector(selectWorkOrders)
  const loading = useSelector(selectMaterialsLoading)
  const error = useSelector(selectMaterialsError)

  const [activeTab, setActiveTab] = useState('consumable')
  const [searchNumber, setSearchNumber] = useState('')
  const [searchOrder, setSearchOrder] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(0)

  // Detail & Form modaling states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailModalItem, setDetailModalItem] = useState(null)

  // PDF Preview states
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const [previewReqId, setPreviewReqId] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  // Determine allowed tabs based on roles
  const allowedTabs = useMemo(() => {
    if (hasAnyRole(currentUser, [ROLES.ADMIN, ROLES.TEAM_LEADER])) {
      return [
        { key: 'consumable', label: 'Vật tư tiêu hao' },
        { key: 'sparepart', label: 'Vật tư thay thế' },
      ]
    }
    return [
      { key: 'consumable', label: 'Vật tư tiêu hao' },
    ]
  }, [currentUser])

  // Security guard for active tab
  useEffect(() => {
    if (!allowedTabs.some((t) => t.key === activeTab)) {
      setActiveTab('consumable')
    }
  }, [allowedTabs, activeTab])

  // Determine pagination dynamic metrics
  const activePage = activeTab === 'consumable' ? consumablePage : sparePartPage
  const activeTotalPages = activeTab === 'consumable' ? consumableTotalPages : sparePartTotalPages
  const activeTotalElements = activeTab === 'consumable' ? consumableTotalElements : sparePartTotalElements
  const activeItems = activeTab === 'consumable' ? consumableRequests : sparePartRequests

  // Can Create rules
  const canCreate = useMemo(() => {
    if (activeTab === 'consumable') {
      return hasAnyRole(currentUser, [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER])
    }
    return hasAnyRole(currentUser, [ROLES.ADMIN, ROLES.TEAM_LEADER])
  }, [currentUser, activeTab])

  const loadData = useCallback(() => {
    const params = { page: currentPage, size: 10 }
    if (searchNumber.trim()) {
      params.reqNumber = searchNumber.trim()
    }
    if (searchOrder.trim()) {
      params.orderNumber = searchOrder.trim()
    }
    if (statusFilter !== 'all') {
      params.status = statusFilter
    }
    if (activeTab === 'consumable') {
      dispatch(fetchConsumableRequests(params))
    } else {
      dispatch(fetchSparePartRequests(params))
    }
  }, [dispatch, activeTab, searchNumber, searchOrder, statusFilter, currentPage])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (createModalOpen) {
      dispatch(fetchWorkOrders())
    }
  }, [dispatch, createModalOpen])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchNumber('')
    setSearchOrder('')
    setStatusFilter('all')
    setCurrentPage(0)
    dispatch(clearMaterialsError())
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < activeTotalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleOpenPdfPreview = async (reqId) => {
    try {
      let blob
      if (activeTab === 'consumable') {
        blob = await exportConsumableRequestPdfService(reqId)
      } else {
        blob = await exportSparePartRequestPdfService(reqId)
      }
      const url = URL.createObjectURL(blob)
      setPreviewPdfUrl(url)
      setPreviewReqId(reqId)
      setPreviewTitle(`Bản in phiếu yêu cầu cấp ${activeTab === 'consumable' ? 'vật tư tiêu hao' : 'phụ tùng thay thế'}`)
    } catch (err) {
      alert(err.message || 'Lỗi xuất PDF')
    }
  }

  const handleDownloadPdf = async () => {
    try {
      let blob
      if (activeTab === 'consumable') {
        blob = await exportConsumableRequestPdfService(previewReqId)
      } else {
        blob = await exportSparePartRequestPdfService(previewReqId)
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Phieu_yeu_cau_cap_${activeTab === 'consumable' ? 'vattu_tieuhao' : 'phutung_thaythe'}_${previewReqId.substring(0, 8)}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert(err.message || 'Lỗi tải PDF')
    }
  }

  const handleCreateSuccess = () => {
    setCreateModalOpen(false)
    loadData()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-slate-900">Yêu cầu cấp phát vật tư</h1>
        <p className="text-sm text-slate-500">
          {hasAnyRole(currentUser, [ROLES.ADMIN, ROLES.TEAM_LEADER])
            ? 'Quản lý phiếu cấp vật tư tiêu hao và vật tư thay thế hỗ trợ xuất file PDF'
            : 'Quản lý phiếu cấp vật tư tiêu hao hỗ trợ xuất file PDF'}
        </p>
      </header>

      {/* Tabs */}
      {allowedTabs.length > 1 && (
        <div className="mt-6 flex border-b border-slate-200 gap-2">
          {allowedTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={[
                'px-4 py-2 text-sm font-semibold border-b-2 transition-all',
                activeTab === tab.key
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Header */}
      <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Tìm theo Số phiếu..."
              value={searchNumber}
              onChange={(e) => {
                setSearchNumber(e.target.value)
                setCurrentPage(0)
              }}
            />
          </label>
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Tìm theo Số PCT..."
              value={searchOrder}
              onChange={(e) => {
                setSearchOrder(e.target.value)
                setCurrentPage(0)
              }}
            />
          </label>

          <select
            className="h-11 min-w-[180px] rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="issued">Đã cấp</option>
          </select>
        </div>

        {canCreate && (
          <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setCreateModalOpen(true)}>
            <Plus size={17} />
            Tạo yêu cầu cấp
          </Button>
        )}
      </section>

      {/* Error alert */}
      {error && (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      {/* Table grid */}
      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {activeItems.length} / {activeTotalElements} phiếu yêu cầu
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/50 text-sm uppercase font-bold text-slate-700">
              <tr>
                <th className="w-16 px-5 py-3 text-center">STT</th>
                <th className="px-5 py-3">Số phiếu</th>
                <th className="px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3 w-32">PCT</th>
                <th className="px-5 py-3">Người lập</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && !activeItems.length ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mr-2" size={18} />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : !activeItems.length ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Không có phiếu yêu cầu cấp phát vật tư nào.
                  </td>
                </tr>
              ) : (
                activeItems.map((req, index) => (
                  <tr key={req.reqId} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 text-center font-medium text-slate-500">
                      {currentPage * 10 + index + 1}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-violet-700">{req.reqNumber}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDateTime(req.createdAt)}</td>
                    <td className="px-5 py-4 text-slate-700 font-semibold">{req.orderNumber || 'Không có liên kết'}</td>
                    <td className="px-5 py-4 text-slate-600">{req.createdByName || req.createdByUsername}</td>
                    <td className="px-5 py-4">
                      <span className={[
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                        req.status === 'issued' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'approved' ? 'bg-indigo-100 text-indigo-700' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      ].join(' ')}>
                        {req.status === 'issued' ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                        {req.status === 'issued' ? 'Đã cấp' :
                         req.status === 'approved' ? 'Đã duyệt' :
                         req.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          onClick={() => setDetailModalItem(req)}
                        >
                          Chi tiết
                        </button>
                        <button
                          className="flex items-center gap-1 rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 transition"
                          onClick={() => handleOpenPdfPreview(req.reqId)}
                        >
                          <Download size={13} />
                          Tải PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination component */}
        {activeTotalPages > 1 ? (() => {
          let startPage = Math.max(0, activePage - 2)
          let endPage = Math.min(activeTotalPages - 1, activePage + 2)

          if (endPage - startPage < 4) {
            if (startPage === 0) {
              endPage = Math.min(activeTotalPages - 1, startPage + 4)
            } else if (endPage === activeTotalPages - 1) {
              startPage = Math.max(0, endPage - 4)
            }
          }

          const pages = []
          for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
          }

          return (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <p className="text-sm text-slate-500">
                Hiển thị trang {activePage + 1} / {activeTotalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  disabled={activePage === 0}
                  onClick={() => handlePageChange(0)}
                >
                  Trang đầu
                </button>
                {pages.map((p) => (
                  <button
                    key={p}
                    className={[
                      'rounded-md px-3 py-1.5 text-sm font-medium transition min-w-[36px]',
                      activePage === p
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
                  disabled={activePage >= activeTotalPages - 1}
                  onClick={() => handlePageChange(activeTotalPages - 1)}
                >
                  Trang cuối
                </button>
              </div>
            </div>
          )
        })() : null}
      </section>

      {/* PDF preview modal */}
      {previewPdfUrl && (
        <PdfPreviewModal
          pdfUrl={previewPdfUrl}
          title={previewTitle}
          onClose={() => {
            URL.revokeObjectURL(previewPdfUrl)
            setPreviewPdfUrl('')
            setPreviewReqId('')
          }}
          onDownload={handleDownloadPdf}
        />
      )}

      {/* Create form modal */}
      {createModalOpen && (
        <CreateRequestModal
          activeTab={activeTab}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          workOrders={workOrders}
        />
      )}

      {/* Request detail modal */}
      {detailModalItem && (
        <RequestDetailModal
          activeTab={activeTab}
          request={detailModalItem}
          onClose={() => setDetailModalItem(null)}
        />
      )}
    </div>
  )
}
