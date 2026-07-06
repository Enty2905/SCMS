import { Edit3, Plus, Search } from 'lucide-react'
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

const STATUS_BADGES = {
  'Còn hàng': 'bg-emerald-100 text-emerald-700',
  'Đang mượn hết': 'bg-amber-100 text-amber-700',
  'Hư hỏng': 'bg-rose-100 text-rose-700',
  'Hết hàng': 'bg-slate-100 text-slate-600',
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

  // Derive unique categories from current items for the filter dropdown
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))]

  // Compute summary stats from current page data
  const totalQty = items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)
  const availableQty = items.reduce((sum, item) => sum + (item.availableQuantity || 0), 0)
  const borrowedQty = totalQty - availableQty
  const damagedCount = items.filter((item) => item.status === 'Hư hỏng').length

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

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-950">Danh sách CCDC</h1>
      </section>

      {/* Summary cards */}
      <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Tổng CCDC" value={totalElements} color="text-violet-600" />
        <SummaryCard label="Có sẵn" value={availableQty} color="text-emerald-600" />
        <SummaryCard label="Đang mượn" value={borrowedQty} color="text-amber-600" />
        <SummaryCard label="Hư hỏng" value={damagedCount} color="text-rose-600" />
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
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Tên CCDC</th>
                <th className="px-5 py-3 font-semibold">Chủng loại</th>
                <th className="px-5 py-3 font-semibold">Tổng SL</th>
                <th className="px-5 py-3 font-semibold">Có sẵn</th>
                <th className="px-5 py-3 font-semibold">Đang mượn</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Ghi chú</th>
                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={8}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !items.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={8}>
                    Không có CCDC phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? items.map((item) => {
                    const borrowed = (item.totalQuantity || 0) - (item.availableQuantity || 0)
                    const badgeClass = STATUS_BADGES[item.status] || 'bg-slate-100 text-slate-600'
                    return (
                      <tr className="hover:bg-slate-50/80" key={item.toolId}>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-slate-600">{item.category}</td>
                        <td className="px-5 py-4 text-slate-600">{item.totalQuantity}</td>
                        <td className="px-5 py-4 font-semibold text-emerald-600">
                          {item.availableQuantity}
                        </td>
                        <td className="px-5 py-4 font-semibold text-amber-600">
                          {borrowed}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span 
                            className="line-clamp-2 max-w-xs" 
                            title={item.note}
                          >
                            {item.note}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2 text-slate-400">
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
        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-sm text-slate-500">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
                size="sm"
                variant="secondary"
              >
                Trước
              </Button>
              <Button
                disabled={page >= totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
                size="sm"
                variant="secondary"
              >
                Sau
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Modal */}
      {formModal.open ? (
        <ToolFormModal
          item={formModal.item}
          onClose={closeFormModal}
          onSuccess={handleFormSuccess}
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
