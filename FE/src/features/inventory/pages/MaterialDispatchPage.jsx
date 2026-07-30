import { AlertTriangle, CheckCircle2, Clock, ExternalLink, FileText, Search, Send, Eye } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { fetchConsumableStocks } from '../services/consumableStock.service.js'
import {
  fetchConsumableRequests,
  getConsumableRequestById,
  issueConsumableRequest,
  uploadConsumableRequestPdf,
} from '../services/consumableRequest.service.js'
import {
  fetchSparePartRequests,
  getSparePartRequestById,
  issueSparePartRequest,
  uploadSparePartRequestPdf,
} from '../services/sparePartRequest.service.js'
import { sparePartStockService } from '../services/sparePartStock.service.js'
import { IssueRequestModal } from './IssueRequestModal.jsx'

const TABS = [
  { key: 'consumable', label: 'Vật tư tiêu hao' },
  { key: 'sparepart', label: 'Vật tư thay thế' },
]

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ cấp phát' },
  { value: 'issued', label: 'Đã cấp phát' },
]

const STATUS_BADGE = {
  pending: { label: 'Chờ cấp phát', cls: 'bg-amber-100 text-amber-700' },
  issued: { label: 'Đã cấp phát', cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Từ chối', cls: 'bg-rose-100 text-rose-700' },
}

function StatusBadge({ status }) {
  const badge = STATUS_BADGE[status] || { label: status, cls: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.cls}`}>
      {status === 'pending' && <Clock size={11} />}
      {status === 'issued' && <CheckCircle2 size={11} />}
      {badge.label}
    </span>
  )
}

export function MaterialDispatchPage() {
  const [activeTab, setActiveTab] = useState('consumable')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [searchReq, setSearchReq] = useState('')
  const [searchOrder, setSearchOrder] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [stocks, setStocks] = useState({})
  const [modalLoading, setModalLoading] = useState(false)

  const isConsumable = activeTab === 'consumable'

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchFn = isConsumable ? fetchConsumableRequests : fetchSparePartRequests
      const result = await fetchFn({
        reqNumber: searchReq || undefined,
        orderNumber: searchOrder || undefined,
        status: statusFilter || undefined,
        page,
        size: 10,
      })
      const data = result.result ?? result
      setItems(data.content ?? data ?? [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không tải được danh sách phiếu')
    } finally {
      setLoading(false)
    }
  }, [isConsumable, statusFilter, searchReq, searchOrder, page])

  useEffect(() => { loadData() }, [loadData])

  // Reset page khi đổi tab/filter
  useEffect(() => { setPage(0) }, [activeTab, statusFilter])

  async function handleOpenModal(req) {
    setModalLoading(true)
    try {
      // Load chi tiết phiếu
      const detailFn = isConsumable ? getConsumableRequestById : getSparePartRequestById
      const detail = await detailFn(req.reqId)
      const request = detail.result ?? detail

      // Load tồn kho cho từng vật tư trong phiếu
      const stockMap = {}
      if (isConsumable) {
        for (const item of request.items) {
          try {
            const stockResult = await fetchConsumableStocks({ code: item.code, page: 0, size: 1 })
            const stockData = stockResult.result ?? stockResult
            const stock = stockData.content?.[0]
            if (stock !== undefined && stock !== null) {
              const qty = stock.stockQuantity ?? stock.quantity ?? 0
              if (item.consumableId) stockMap[item.consumableId] = qty
              if (item.itemId) stockMap[item.itemId] = qty
              if (item.code) stockMap[item.code] = qty
            }
          } catch (_) { /* ignore */ }
        }
      } else {
        for (const item of request.items) {
          try {
            const stockResult = await sparePartStockService.getAll({ code: item.code, page: 0, size: 1 })
            const stockData = stockResult.result ?? stockResult
            const stock = stockData.content?.[0]
            if (stock !== undefined && stock !== null) {
              const qty = stock.stockQuantity ?? stock.quantity ?? 0
              if (item.sparePartId) stockMap[item.sparePartId] = qty
              if (item.itemId) stockMap[item.itemId] = qty
              if (item.code) stockMap[item.code] = qty
            }
          } catch (_) { /* ignore */ }
        }
      }

      setStocks(stockMap)
      setSelectedRequest(request)
    } catch (err) {
      setError('Không tải được chi tiết phiếu')
    } finally {
      setModalLoading(false)
    }
  }

  function handleCloseModal() {
    setSelectedRequest(null)
    setStocks({})
    loadData() // Refresh list
  }

  async function handleIssue(id, dto) {
    if (!selectedRequest) return
    const payload = dto || id
    const targetId = dto ? id : selectedRequest.reqId
    const issueFn = isConsumable ? issueConsumableRequest : issueSparePartRequest
    await issueFn(targetId, payload)
    // Refresh detail after issue
    const detailFn = isConsumable ? getConsumableRequestById : getSparePartRequestById
    const updated = await detailFn(targetId)
    setSelectedRequest(updated.result ?? updated)
  }

  async function handleUploadPdf(id, file) {
    if (!selectedRequest) return
    const uploadFile = file || id
    const targetId = file ? id : selectedRequest.reqId
    const uploadFn = isConsumable ? uploadConsumableRequestPdf : uploadSparePartRequestPdf
    await uploadFn(targetId, uploadFile)
    const detailFn = isConsumable ? getConsumableRequestById : getSparePartRequestById
    const updated = await detailFn(targetId)
    setSelectedRequest(updated.result ?? updated)
    loadData()
  }

  function handlePageChange(p) {
    if (p >= 0 && p < totalPages) setPage(p)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Header */}
      <section className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-950">Cấp phát vật tư</h1>
        <p className="text-sm text-slate-500">Xem và xử lý các phiếu yêu cầu cấp vật tư từ tổ trưởng sửa chữa</p>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={[
              'rounded-lg px-5 py-2 text-sm font-semibold transition-all',
              activeTab === tab.key
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <section className="flex flex-wrap gap-3 items-center">
        {/* Status filter pills */}
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              className={[
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border',
                statusFilter === f.value
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600',
              ].join(' ')}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 gap-2 min-w-0">
          {/* Search req number */}
          <label className="relative flex-1 min-w-[160px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Số phiếu..."
              value={searchReq}
              onChange={(e) => { setSearchReq(e.target.value); setPage(0) }}
            />
          </label>
          {/* Search order number */}
          <label className="relative flex-1 min-w-[160px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Số phiếu công tác..."
              value={searchOrder}
              onChange={(e) => { setSearchOrder(e.target.value); setPage(0) }}
            />
          </label>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-700">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          <span>Hiển thị {items.length} / {totalElements} phiếu</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide font-bold text-slate-600">
              <tr>
                <th className="px-5 py-3 w-16 text-center">STT</th>
                <th className="px-5 py-3">Số phiếu</th>
                <th className="px-5 py-3">Phiếu công tác</th>
                <th className="px-5 py-3">Người yêu cầu</th>
                <th className="px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3">Số VT</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-center">PDF</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-400 text-sm" colSpan={9}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-center" colSpan={9}>
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="text-slate-300" size={32} />
                      <p className="text-slate-400 text-sm">Không có phiếu nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && items.map((req, index) => (
                <tr className="hover:bg-slate-50/70 transition-colors" key={req.reqId}>
                  <td className="px-5 py-4 text-center text-slate-600 font-medium">
                    {page * 10 + index + 1}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm font-semibold text-violet-700">
                    {req.reqNumber}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {req.orderNumber ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-800">{req.createdByName ?? req.createdByUsername}</div>
                    {req.createdByName && (
                      <div className="text-xs text-slate-400 mt-0.5">{req.createdByUsername}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {req.createdAt
                      ? new Date(req.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                      : '—'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {req.items?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    {req.pdfUrl ? (
                      <a
                        className="inline-flex p-2 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        href={req.pdfUrl}
                        rel="noreferrer"
                        target="_blank"
                        title="Xem file PDF"
                      >
                        <FileText size={16} />
                      </a>
                    ) : (
                      <span className="text-slate-300 font-bold">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end text-slate-400">
                      {req.status === 'pending' ? (
                        <button
                          className="rounded-md p-2 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                          disabled={modalLoading}
                          onClick={() => handleOpenModal(req)}
                          title="Cấp phát"
                        >
                          <Send size={16} />
                        </button>
                      ) : (
                        <button
                          className="rounded-md p-2 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          disabled={modalLoading}
                          onClick={() => handleOpenModal(req)}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-sm text-slate-500">Trang {page + 1} / {totalPages}</p>
            <div className="flex gap-1.5">
              <button
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                disabled={page === 0}
                onClick={() => handlePageChange(0)}
              >
                Đầu
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5))
                return start + i
              }).map((p) => (
                <button
                  key={p}
                  className={[
                    'rounded-md px-3 py-1.5 text-xs font-semibold min-w-[32px] transition-all',
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
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                disabled={page >= totalPages - 1}
                onClick={() => handlePageChange(totalPages - 1)}
              >
                Cuối
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Issue Modal */}
      {selectedRequest && (
        <IssueRequestModal
          request={selectedRequest}
          stockMap={stocks}
          stocks={stocks}
          type={activeTab}
          onClose={handleCloseModal}
          onIssue={handleIssue}
          onUploadPdf={handleUploadPdf}
        />
      )}
    </div>
  )
}
