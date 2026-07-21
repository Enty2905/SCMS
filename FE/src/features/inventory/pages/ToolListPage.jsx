import { Edit3, Plus, Search, AlertTriangle, Eye, HandHelping } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'

import {
  selectToolError,
  selectToolItems,
  selectToolLoading,
  selectToolPage,
  selectToolTotalElements,
  selectToolTotalPages,
} from '../store/tool.selectors.js'
import { fetchToolList } from '../store/tool.thunks.js'
import { ToolFormModal } from './ToolFormModal.jsx'
import { ToolDisposeDamagedModal } from './ToolDisposeDamagedModal.jsx'
import { ToolDetailModal } from './ToolDetailModal.jsx'
import { ToolBorrowFormModal } from './ToolBorrowFormModal.jsx'

// Status badge mapping (giá trị từ BE: 'available' | 'damaged')
const STATUS_LABELS = {
  available: 'Còn hàng',
  damaged: 'Bị hỏng',
}

const STATUS_BADGES = {
  available: 'bg-emerald-100 text-emerald-700',
  damaged: 'bg-rose-100 text-rose-700',
}

export function ToolListPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectToolItems)
  const loading = useSelector(selectToolLoading)
  const error = useSelector(selectToolError)
  const page = useSelector(selectToolPage)
  const totalPages = useSelector(selectToolTotalPages)
  const totalElements = useSelector(selectToolTotalElements)

  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  // Modal state
  const [formModal, setFormModal] = useState({ open: false, item: null })
  const [disposeModal, setDisposeModal] = useState({ open: false, item: null })
  const [detailModal, setDetailModal] = useState({ open: false, item: null })
  const [borrowModal, setBorrowModal] = useState({ open: false, item: null })
  const [borrowSuccessMsg, setBorrowSuccessMsg] = useState(null)

  // Derive unique categories from current items for the filter dropdown
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))]

  // Card thống kê: tổng loại CCDC, tổng availableQuantity, tổng borrowedQuantity, tổng damagedQuantity
  const totalTypes = totalElements
  const availableQty = items.reduce((sum, item) => sum + (item.availableQuantity || 0), 0)
  const borrowedQty = items.reduce((sum, item) => sum + (item.borrowedQuantity || 0), 0)
  const damagedQty = items.reduce((sum, item) => sum + (item.damagedQuantity || 0), 0)

  const loadData = useCallback(() => {
    dispatch(fetchToolList({ keyword, category, page: currentPage, size: 10 }))
  }, [dispatch, keyword, category, currentPage])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleSearch(event) {
    setKeyword(event.target.value)
    setCurrentPage(0)
  }

  function handleCategoryChange(event) {
    setCategory(event.target.value)
    setCurrentPage(0)
  }

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  function openCreateModal() {
    setFormModal({ open: true, item: null })
  }

  function openEditModal(item) {
    setFormModal({ open: true, item })
  }

  function closeFormModal() {
    setFormModal({ open: false, item: null })
  }

  function handleFormSuccess() {
    closeFormModal()
    loadData()
  }

  function openDisposeModal(item) {
    setDisposeModal({ open: true, item })
  }

  function closeDisposeModal() {
    setDisposeModal({ open: false, item: null })
  }

  function handleDisposeSuccess() {
    closeDisposeModal()
    loadData()
  }

  function openDetailModal(item) {
    setDetailModal({ open: true, item })
  }

  function closeDetailModal() {
    setDetailModal({ open: false, item: null })
  }

  function openBorrowModal(item) {
    setBorrowModal({ open: true, item })
  }

  function closeBorrowModal() {
    setBorrowModal({ open: false, item: null })
  }

  function handleBorrowSuccess() {
    closeBorrowModal()
    setBorrowSuccessMsg('Cho mượn CCDC thành công')
    loadData()
    setTimeout(() => setBorrowSuccessMsg(null), 3500)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-950">Quản lý CCDC</h1>
      </section>

      {/* Toast thông báo mượn thành công */}
      {borrowSuccessMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          ✓ {borrowSuccessMsg}
        </div>
      )}

      {/* Summary cards */}
      <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Tổng CCDC" value={totalTypes} color="text-violet-600" />
        <SummaryCard label="Có sẵn" value={availableQty} color="text-emerald-600" />
        <SummaryCard label="Đang mượn" value={borrowedQty} color="text-amber-600" />
        <SummaryCard label="Hư hỏng" value={damagedQty} color="text-rose-600" />
      </section>

      {/* Search + Filter + Add button */}
      <section className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={handleSearch}
            placeholder="Tìm theo tên hoặc chủng loại..."
            value={keyword}
          />
        </label>
        {categories.length > 0 ? (
          <select
            className="h-11 min-w-48 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={handleCategoryChange}
            value={category}
          >
            <option value="">Tất cả chủng loại</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        ) : null}
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={openCreateModal}
        >
          <Plus size={17} />
          Thêm CCDC
        </Button>
      </section>

      {/* Error */}
      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      {/* Table */}
      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
              <tr>
                <th className="px-5 py-3 w-16 text-center">STT</th>
                <th className="px-5 py-3">Tên CCDC</th>
                <th className="px-5 py-3 w-36">Chủng loại</th>
                <th className="px-5 py-3 text-right">Có sẵn</th>
                <th className="px-5 py-3 text-right">Đang mượn</th>
                <th className="px-5 py-3 text-right">Hư hỏng</th>
                <th className="px-5 py-3 text-right">Tổng SL</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 w-60">Ghi chú</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={10}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !items.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={10}>
                    Không có CCDC phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? items.map((item, index) => {
                    const statusLabel = STATUS_LABELS[item.status] || item.status
                    const badgeClass = STATUS_BADGES[item.status] || 'bg-slate-100 text-slate-600'
                    return (
                      <tr className="hover:bg-slate-50/80" key={item.toolId}>
                        <td className="px-5 py-4 text-center font-medium text-slate-500">
                          {page * 10 + index + 1}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-slate-600">{item.category}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-600">
                          {item.availableQuantity}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-amber-600">
                          {item.borrowedQuantity ?? 0}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-rose-600">
                          {item.damagedQuantity ?? 0}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-950">
                          {item.totalQuantity}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span
                            className="line-clamp-2 max-w-[15rem]"
                            title={item.note}
                          >
                            {item.note}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2 text-slate-400">
                            {item.availableQuantity > 0 && (
                              <button
                                className="rounded-md p-2 hover:bg-violet-50 hover:text-violet-600"
                                onClick={() => openBorrowModal(item)}
                                title="Cho mượn"
                              >
                                <HandHelping size={16} />
                              </button>
                            )}
                            {item.availableQuantity > 0 && (
                              <button
                                className="rounded-md p-2 hover:bg-rose-50 hover:text-rose-600"
                                onClick={() => openDisposeModal(item)}
                                title="Báo hỏng"
                              >
                                <AlertTriangle size={16} />
                              </button>
                            )}
                            <button
                              className="rounded-md p-2 hover:bg-sky-50 hover:text-sky-600"
                              onClick={() => openDetailModal(item)}
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="rounded-md p-2 hover:bg-slate-100 hover:text-violet-600"
                              onClick={() => openEditModal(item)}
                              title="Sửa"
                            >
                              <Edit3 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Modal */}
      {formModal.open ? (
        <ToolFormModal
          item={formModal.item}
          onClose={closeFormModal}
          onSuccess={handleFormSuccess}
        />
      ) : null}

      {disposeModal.open ? (
        <ToolDisposeDamagedModal
          item={disposeModal.item}
          onClose={closeDisposeModal}
          onSuccess={handleDisposeSuccess}
        />
      ) : null}

      {detailModal.open ? (
        <ToolDetailModal
          item={detailModal.item}
          onClose={closeDetailModal}
        />
      ) : null}

      {borrowModal.open ? (
        <ToolBorrowFormModal
          tool={borrowModal.item}
          onClose={closeBorrowModal}
          onSuccess={handleBorrowSuccess}
        />
      ) : null}
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </article>
  )
}
