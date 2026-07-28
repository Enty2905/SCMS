import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  Loader2,
  Plus,
  Search,
  Wrench,
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
  selectRepairHistories,
  selectRepairHistoryPage,
  selectRepairHistoryTotalPages,
  selectRepairHistoryTotalElements,
  selectMaterialsLoading,
  selectMaterialsError,
} from '../store/maintenance.selectors.js'
import {
  fetchWorkOrders,
  fetchRepairHistories,
  createRepairHistory,
} from '../store/maintenance.thunks.js'
import { fetchEquipments } from '@/features/equipment/services/equipment.service.js'

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Record History Form Modal ────────────────────────────────────────────────
function RecordHistoryModal({ onClose, onSuccess, workOrders }) {
  const dispatch = useDispatch()
  const loading = useSelector(selectMaterialsLoading)
  const error = useSelector(selectMaterialsError)

  const [equipmentId, setEquipmentId] = useState('')
  const [equipmentName, setEquipmentName] = useState('')
  const [orderId, setOrderId] = useState('')
  const [description, setDescription] = useState('')
  const [repairedAt, setRepairedAt] = useState('')
  const [validationError, setValidationError] = useState('')

  // Equipment Search states (song song)
  const [equipments, setEquipments] = useState([])
  const [equipmentsLoading, setEquipmentsLoading] = useState(true)
  const [innerSearchEqName, setInnerSearchEqName] = useState('')
  const [innerSearchKks, setInnerSearchKks] = useState('')
  const [showEqSuggestions, setShowEqSuggestions] = useState(false)

  // Load all equipments on mount
  useEffect(() => {
    let ignore = false
    fetchEquipments()
      .then((res) => {
        if (!ignore) setEquipments(res || [])
      })
      .catch((err) => console.error('Không thể lấy danh sách thiết bị', err))
      .finally(() => {
        if (!ignore) setEquipmentsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const filteredEquipments = useMemo(() => {
    const nameKw = innerSearchEqName.trim().toLowerCase()
    const kksKw = innerSearchKks.trim().toLowerCase()
    return equipments.filter((e) => {
      const matchName = !nameKw || e.equipmentName?.toLowerCase().includes(nameKw)
      const matchKks = !kksKw || e.kksCode?.toLowerCase().includes(kksKw)
      return matchName && matchKks
    })
  }, [equipments, innerSearchEqName, innerSearchKks])

  // PCT Search states (song song)
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

  const eqWrapRef = useRef(null)
  const pctWrapRef = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (eqWrapRef.current && !eqWrapRef.current.contains(e.target)) {
        setShowEqSuggestions(false)
      }
      if (pctWrapRef.current && !pctWrapRef.current.contains(e.target)) {
        setShowPctSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!equipmentId) {
      setValidationError('Vui lòng chọn thiết bị được sửa chữa')
      return
    }

    if (!orderId) {
      setValidationError('Vui lòng chọn Phiếu công tác (PCT) liên quan')
      return
    }

    if (!repairedAt) {
      setValidationError('Vui lòng nhập thời gian hoàn thành sửa chữa')
      return
    }

    const payload = {
      equipmentId,
      orderId: orderId,
      description,
      repairedAt: new Date(repairedAt).toISOString(),
    }

    const actionResult = await dispatch(createRepairHistory(payload))
    if (!actionResult.error) {
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Ghi nhận lịch sử sửa chữa</h3>
              <p className="text-xs text-slate-500">Lưu thông tin chi tiết nhật ký sửa chữa, hiệu chỉnh thiết bị</p>
            </div>
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Errors display */}
            {validationError || error ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Lỗi xảy ra</p>
                  <p>{validationError || error}</p>
                </div>
              </div>
            ) : null}

            {/* Equipment selection */}
            <div className="space-y-1.5 relative" ref={eqWrapRef}>
              <label className="text-sm font-bold text-slate-700">
                Thiết bị sửa chữa <span className="text-rose-500">*</span>
              </label>
              {equipmentId ? (
                <div className="flex items-center justify-between h-11 border border-slate-200 rounded-md bg-slate-50 px-3 text-sm">
                  <span className="font-semibold text-slate-900">{equipmentName}</span>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-rose-600 transition"
                    onClick={() => {
                      setEquipmentId('')
                      setEquipmentName('')
                      setInnerSearchEqName('')
                      setInnerSearchKks('')
                    }}
                  >
                    Thay đổi
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-violet-500"
                        placeholder="Tên thiết bị..."
                        value={innerSearchEqName}
                        onChange={(e) => {
                          setInnerSearchEqName(e.target.value)
                          setShowEqSuggestions(true)
                        }}
                        onFocus={() => setShowEqSuggestions(true)}
                      />
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-violet-500"
                        placeholder="Mã KKS..."
                        value={innerSearchKks}
                        onChange={(e) => {
                          setInnerSearchKks(e.target.value)
                          setShowEqSuggestions(true)
                        }}
                        onFocus={() => setShowEqSuggestions(true)}
                      />
                    </div>
                  </div>

                  {showEqSuggestions && (
                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg">
                      {equipmentsLoading ? (
                        <p className="p-3 text-xs text-slate-400 text-center">Đang tải danh sách...</p>
                      ) : filteredEquipments.length === 0 ? (
                        <p className="p-3 text-xs text-slate-400 text-center">Không tìm thấy thiết bị phù hợp</p>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {filteredEquipments.map((eq) => (
                            <li key={eq.id}>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                                onMouseDown={() => {
                                  setEquipmentId(eq.id)
                                  setEquipmentName(`${eq.equipmentName} (${eq.kksCode})`)
                                  setShowEqSuggestions(false)
                                }}
                              >
                                <div>
                                  <span className="font-semibold text-slate-900 block">{eq.equipmentName}</span>
                                  <span className="text-slate-400 text-[10px] font-mono">({eq.kksCode})</span>
                                </div>
                                <span className="text-[10px] text-slate-500">{eq.equipmentType}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Select Work Order */}
            <div className="space-y-1.5 relative" ref={pctWrapRef}>
              <label className="text-sm font-bold text-slate-700">
                Phiếu công tác liên quan <span className="text-rose-500">*</span>
              </label>
              {orderId ? (
                <div className="flex items-center justify-between h-11 border border-slate-200 rounded-md bg-slate-50 px-3 text-sm">
                  <span className="font-semibold text-slate-950">
                    {selectedWorkOrder?.orderNumber} ({selectedWorkOrder?.content})
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
                <>
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
                </>
              )}
            </div>

            {/* Repaired At Date Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">
                Thời gian sửa chữa hoàn thành <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                value={repairedAt}
                onChange={(e) => setRepairedAt(e.target.value)}
              />
            </div>

            {/* Description textarea */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">
                Chi tiết nội dung sửa chữa (Tùy chọn)
              </label>
              <textarea
                rows="4"
                className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                placeholder="Nhập chi tiết về lỗi thiết bị, các phụ tùng đã tháo lắp, công việc bảo dưỡng khắc phục..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
              Ghi nhận lịch sử
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page Component ──────────────────────────────────────────────────────
export function RepairHistoryPage() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const histories = useSelector(selectRepairHistories)
  const page = useSelector(selectRepairHistoryPage)
  const totalPages = useSelector(selectRepairHistoryTotalPages)
  const totalElements = useSelector(selectRepairHistoryTotalElements)
  const workOrders = useSelector(selectWorkOrders)
  const loading = useSelector(selectMaterialsLoading)
  const error = useSelector(selectMaterialsError)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  // Search and Filter states
  const [searchEqName, setSearchEqName] = useState('')
  const [searchKks, setSearchKks] = useState('')
  const [searchOrder, setSearchOrder] = useState('')
  const [viewDescription, setViewDescription] = useState(null)

  const loadData = useCallback(() => {
    const params = {
      page: currentPage,
      size: 10,
    }
    if (searchEqName.trim()) {
      params.equipmentName = searchEqName.trim()
    }
    if (searchKks.trim()) {
      params.kksCode = searchKks.trim()
    }
    if (searchOrder.trim()) {
      params.orderNumber = searchOrder.trim()
    }
    dispatch(fetchRepairHistories(params))
  }, [dispatch, searchEqName, searchKks, searchOrder, currentPage])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (createModalOpen) {
      dispatch(fetchWorkOrders())
    }
  }, [dispatch, createModalOpen])

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleCreateSuccess = () => {
    setCreateModalOpen(false)
    loadData()
  }

  const canRecord = useMemo(() => {
    return hasAnyRole(currentUser, [ROLES.ADMIN, ROLES.TEAM_LEADER])
  }, [currentUser])

  return (
    <div className="p-6">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử sửa chữa thiết bị</h1>
        <p className="text-sm text-slate-500">
          Tra cứu, quản lý và ghi lại chi tiết các mốc sửa chữa và bảo dưỡng thiết bị
        </p>
      </header>

      {/* Filter Section */}
      <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Tìm theo Tên thiết bị..."
              value={searchEqName}
              onChange={(e) => {
                setSearchEqName(e.target.value)
                setCurrentPage(0)
              }}
            />
          </label>
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Tìm theo Mã KKS..."
              value={searchKks}
              onChange={(e) => {
                setSearchKks(e.target.value)
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
        </div>

        {canRecord && (
          <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setCreateModalOpen(true)}>
            <Plus size={17} />
            Ghi nhận lịch sử
          </Button>
        )}
      </section>

      {/* Error alert */}
      {error && (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      {/* Grid listing */}
      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {histories.length} / {totalElements} mốc lịch sử sửa chữa
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/50 text-sm uppercase font-bold text-slate-700">
              <tr>
                <th className="w-16 px-5 py-3 text-center">STT</th>
                <th className="px-5 py-3 w-1/4">Thiết bị</th>
                <th className="px-5 py-3 w-40">Mã KKS</th>
                <th className="px-5 py-3 w-40">Thời gian</th>
                <th className="px-5 py-3 w-28">PCT</th>
                <th className="px-5 py-3 w-1/3">Nội dung sửa chữa</th>
                <th className="px-5 py-3">Người ghi nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && !histories.length ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mr-2" size={18} />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : !histories.length ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Chưa có bản ghi lịch sử sửa chữa nào được đăng ký.
                  </td>
                </tr>
              ) : (
                histories.map((h, index) => (
                  <tr key={h.historyId} className="hover:bg-slate-50/50 transition align-top">
                    <td className="px-5 py-4 text-center font-medium text-slate-500">
                      {currentPage * 10 + index + 1}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{h.equipmentName}</td>
                    <td className="px-5 py-4 font-mono text-slate-600">{h.equipmentKksCode}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        {formatDateTime(h.repairedAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-violet-700">
                      {h.orderNumber || 'Không liên kết'}
                    </td>
                    <td className="px-5 py-4 text-slate-700 whitespace-pre-line leading-relaxed">
                      {h.description && h.description.length > 80 ? (
                        <>
                          {h.description.substring(0, 80)}...{' '}
                          <button
                            type="button"
                            onClick={() => setViewDescription(h.description)}
                            className="text-violet-600 hover:text-violet-800 font-semibold hover:underline text-xs inline-block ml-1"
                          >
                            Xem chi tiết
                          </button>
                        </>
                      ) : (
                        h.description || '—'
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {h.repairedByName || h.repairedByUsername || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 ? (() => {
          let startPage = Math.max(0, page - 2)
          let endPage = Math.min(totalPages - 1, page + 2)

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
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <p className="text-sm text-slate-500">
                Hiển thị trang {page + 1} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  disabled={page === 0}
                  onClick={() => handlePageChange(0)}
                >
                  Trang đầu
                </button>
                {pages.map((p) => (
                  <button
                    key={p}
                    className={[
                      'rounded-md px-3 py-1.5 text-sm font-medium transition min-w-[36px]',
                      page === p
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
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(totalPages - 1)}
                >
                  Trang cuối
                </button>
              </div>
            </div>
          )
        })() : null}
      </section>

      {/* Record dialog */}
      {createModalOpen && (
        <RecordHistoryModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          workOrders={workOrders}
        />
      )}

      {/* Description Detail Modal */}
      {viewDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h4 className="text-base font-bold text-slate-950">Chi tiết nội dung sửa chữa</h4>
              <button
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                onClick={() => setViewDescription(null)}
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto pr-1">
              {viewDescription}
            </p>
            <div className="mt-5 flex justify-end">
              <Button variant="secondary" onClick={() => setViewDescription(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
