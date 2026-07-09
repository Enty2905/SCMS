import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Search, Trash2, AlertTriangle, ClipboardList } from 'lucide-react'

import {
  selectRepairRequestItems,
  selectRepairRequestLoading,
  selectRepairRequestError,
} from '../store/repairrequest.selectors.js'
import { fetchMyRequests, deleteRequest } from '../store/repairrequest.thunks.js'
import { clearError } from '../store/repairrequest.reducer.js'
import { CreateRepairRequestModal } from './CreateRepairRequestModal.jsx'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  processing: { label: 'Đang xử lý', cls: 'bg-amber-100 text-amber-700' },
  done:       { label: 'Đã xử lý',  cls: 'bg-emerald-100 text-emerald-700' },
}

const PRIORITY_CONFIG = {
  low:      { label: 'Thấp',       cls: 'bg-slate-100 text-slate-500'   },
  medium:   { label: 'Trung bình', cls: 'bg-blue-100 text-blue-600'     },
  high:     { label: 'Cao',        cls: 'bg-orange-100 text-orange-600' },
  critical: { label: 'Khẩn cấp',  cls: 'bg-red-100 text-red-600'       },
}

function Badge({ config, value }) {
  const c = config[value] || { label: value, cls: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.cls}`}>
      {c.label}
    </span>
  )
}

const PAGE_SIZE = 8

// ── Main Component ────────────────────────────────────────────────────────────

export function MyRepairRequestsPage() {
  const dispatch = useDispatch()
  const allItems  = useSelector(selectRepairRequestItems)
  const loading   = useSelector(selectRepairRequestLoading)
  const error     = useSelector(selectRepairRequestError)

  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('')
  const [currentPage, setPage]    = useState(0)
  const [createModal, setCreate]  = useState(false)
  const [deleteTarget, setDelete] = useState(null) // item để xác nhận xóa

  const loadData = useCallback(() => {
    dispatch(fetchMyRequests())
  }, [dispatch])

  useEffect(() => {
    loadData()
    return () => dispatch(clearError())
  }, [loadData, dispatch])

  // ── Client-side filter + paginate ─────────────────────────────────────────
  const filtered = allItems.filter((item) => {
    const matchSearch =
      !search ||
      item.equipmentName?.toLowerCase().includes(search.toLowerCase()) ||
      item.equipmentKksCode?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage    = Math.min(currentPage, totalPages - 1)
  const pageItems   = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  function handleSearchChange(e) {
    setSearch(e.target.value)
    setPage(0)
  }
  function handleStatusChange(e) {
    setStatus(e.target.value)
    setPage(0)
  }

  function handleCreateSuccess() {
    setCreate(false)
    loadData()
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await dispatch(deleteRequest(deleteTarget.requestId)).unwrap()
    } catch {
      // error được hiển thị qua Redux state
    }
    setDelete(null)
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Yêu cầu sửa chữa của tôi</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Danh sách yêu cầu bạn đã gửi cho phòng kỹ thuật
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition"
          onClick={() => setCreate(true)}
        >
          <Plus size={16} />
          Tạo yêu cầu
        </button>
      </section>

      {/* Filters */}
      <section className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={handleSearchChange}
            placeholder="Tìm theo tên thiết bị, mã KKS, mô tả..."
            value={search}
          />
        </label>
        <select
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          onChange={handleStatusChange}
          value={statusFilter}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="processing">Đang xử lý</option>
          <option value="done">Đã xử lý</option>
        </select>
      </section>

      {/* Error */}
      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={16} />
          {error}
        </div>
      ) : null}

      {/* Table */}
      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {pageItems.length} / {filtered.length} yêu cầu
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3">Thiết bị</th>
                <th className="px-5 py-3">Mô tả sự cố</th>
                <th className="px-5 py-3">Mức độ</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={6}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !pageItems.length ? (
                <tr>
                  <td className="px-5 py-10 text-center" colSpan={6}>
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ClipboardList size={32} />
                      <span>Chưa có yêu cầu nào. Bấm &quot;Tạo yêu cầu&quot; để bắt đầu.</span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!loading
                ? pageItems.map((item) => (
                    <tr className="hover:bg-slate-50/80" key={item.requestId}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{item.equipmentName}</p>
                        <p className="text-xs text-slate-400">{item.equipmentKksCode}</p>
                        <p className="text-xs text-slate-400">{item.equipmentLocation}</p>
                      </td>
                      <td className="max-w-xs px-5 py-4">
                        <p className="line-clamp-2 text-slate-700" title={item.description}>
                          {item.description}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge config={PRIORITY_CONFIG} value={item.priority} />
                      </td>
                      <td className="px-5 py-4">
                        <Badge config={STATUS_CONFIG} value={item.status} />
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {item.status === 'processing' ? (
                          <button
                            className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            onClick={() => setDelete(item)}
                            title="Xóa yêu cầu"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-sm text-slate-500">
              Trang {safePage + 1} / {totalPages}
            </p>
            <div className="flex gap-1.5">
              <button
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                disabled={safePage === 0}
                onClick={() => setPage(0)}
              >
                Đầu
              </button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((p) => Math.abs(p - safePage) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    className={[
                      'min-w-[36px] rounded-md px-3 py-1.5 text-sm font-medium transition',
                      p === safePage
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                    onClick={() => setPage(p)}
                  >
                    {p + 1}
                  </button>
                ))}
              <button
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage(totalPages - 1)}
              >
                Cuối
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Modal tạo mới */}
      {createModal ? (
        <CreateRepairRequestModal
          onClose={() => setCreate(false)}
          onSuccess={handleCreateSuccess}
        />
      ) : null}

      {/* Modal xác nhận xóa */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <AlertTriangle className="text-rose-600" size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Xóa yêu cầu sửa chữa?</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Yêu cầu về thiết bị <span className="font-semibold text-slate-800">{deleteTarget.equipmentName}</span> sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={() => setDelete(null)}
              >
                Hủy
              </button>
              <button
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
