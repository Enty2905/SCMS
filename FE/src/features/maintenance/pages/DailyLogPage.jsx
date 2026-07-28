import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, ClipboardEdit, AlertTriangle, Loader2, Eye } from 'lucide-react'

import { searchWorkOrders } from '../store/maintenance.thunks.js'
import { DailyLogModal } from '../components/DailyLogModal.jsx'
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal.jsx'

export function DailyLogPage() {
  const dispatch = useDispatch()
  const { workOrders, workOrderLoading, workOrderError, workOrdersTotalPages, workOrdersPage } = useSelector(
    (state) => state.maintenance
  )

  const [keyword, setKeyword] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedOrderNumber, setSelectedOrderNumber] = useState('')
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('')
  const [viewDetailOrder, setViewDetailOrder] = useState(null)

  const loadData = useCallback(
    (page = 0, searchKw = '') => {
      dispatch(searchWorkOrders({ keyword: searchKw, page, size: 10 }))
    },
    [dispatch]
  )

  useEffect(() => {
    loadData(0, '')
  }, [loadData])

  const handleSearch = (e) => {
    e.preventDefault()
    loadData(0, keyword)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < workOrdersTotalPages) {
      loadData(newPage, keyword)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sổ nhật ký công tác</h2>
          <p className="text-sm text-slate-500 mt-1">
            Mở và kết thúc phiên làm việc hàng ngày của các phiếu công tác.
          </p>
        </div>
      </div>

      {workOrderError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
          <AlertTriangle size={18} />
          <p>{workOrderError}</p>
        </div>
      )}

      {/* Filter Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:max-w-md">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tìm kiếm Phiếu công tác
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-violet-500"
                placeholder="Nhập số phiếu hoặc nội dung..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={workOrderLoading}
            className="flex h-9 items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {workOrderLoading ? <Loader2 className="animate-spin" size={16} /> : 'Tìm kiếm'}
          </button>
        </form>
      </section>

      {/* List Section */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold w-56">Số phiếu (PCT)</th>
                <th className="px-6 py-4 font-bold w-40">Thiết bị (KKS)</th>
                <th className="px-6 py-4 font-bold w-64">Nội dung</th>
                <th className="px-6 py-4 font-bold w-40">Lãnh đạo thi công</th>
                <th className="px-6 py-4 font-bold w-32">Ngày tạo</th>
                <th className="px-6 py-4 font-bold w-32">Trạng thái</th>
                <th className="px-6 py-4 font-bold w-48 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrderLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : workOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy phiếu công tác nào.
                  </td>
                </tr>
              ) : (
                workOrders.map((wo) => (
                  <tr key={wo.orderId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-violet-700">{wo.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{wo.equipmentKksCode || '—'}</div>
                      <div className="text-xs text-slate-500">{wo.equipmentName || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="line-clamp-2 max-w-[200px]">{wo.content}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-medium">{wo.workLeader?.name || '—'}</div>
                      <div className="text-xs text-slate-500">Trưởng ca</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {wo.createdAt ? new Date(wo.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {wo.status === 'open' && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          Đang mở
                        </span>
                      )}
                      {(wo.status === 'paused' || wo.status === 'draft') && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                          Đang đóng
                        </span>
                      )}
                      {wo.status === 'locked' && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                          Hoàn thành
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewDetailOrder(wo)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Eye size={14} />
                          Chi tiết
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrderId(wo.orderId)
                            setSelectedOrderNumber(wo.orderNumber)
                            setSelectedOrderStatus(wo.status)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <ClipboardEdit size={14} />
                          Nhật ký
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {workOrdersTotalPages > 1 && (
          <div className="flex items-center justify-end border-t border-slate-200 bg-white px-6 py-3 gap-1.5">
            <button
              onClick={() => handlePageChange(0)}
              disabled={workOrdersPage === 0}
              className="flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Đầu
            </button>
            
            {Array.from({ length: workOrdersTotalPages }, (_, i) => i).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  p === workOrdersPage
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(workOrdersTotalPages - 1)}
              disabled={workOrdersPage >= workOrdersTotalPages - 1}
              className="flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Cuối
            </button>
          </div>
        )}
      </section>

      {/* Modal */}
      {selectedOrderId && (
        <DailyLogModal
          orderId={selectedOrderId}
          orderNumber={selectedOrderNumber}
          status={selectedOrderStatus}
          onClose={() => {
            setSelectedOrderId(null)
            setSelectedOrderNumber('')
            setSelectedOrderStatus('')
          }}
          onSuccess={() => {
            // Khi Modal thực hiện đóng/mở thành công, load lại bảng ở background
            loadData(workOrdersPage, keyword)
            
            // Cập nhật lại status nội bộ để modal tự cập nhật quyền Mở/Đóng nếu cần
            // Lấy status mới nhất từ server thông qua mảng vừa fetch (hoặc đóng mở thì ta có thể đoán)
            // Tuy nhiên, vì bảng loadData là async, trạng thái thực tế trên bảng sẽ được cập nhật.
            // Modal có thể tự xử lý hoặc nếu user đóng modal thì tự reset.
          }}
        />
      )}

      {/* Detail Modal */}
      {viewDetailOrder && (
        <WorkOrderDetailModal
          workOrder={viewDetailOrder}
          onClose={() => setViewDetailOrder(null)}
          onSuccess={() => loadData(workOrdersPage, keyword)}
        />
      )}
    </div>
  )
}
