import { Search, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { fetchDamagedTools } from '../services/tool.service.js'
import { ToolRemoveDamagedModal } from './ToolRemoveDamagedModal.jsx'

const STATUS_LABELS = {
  available: 'Còn hàng',
  damaged: 'Bị hỏng',
}

const STATUS_BADGES = {
  available: 'bg-emerald-100 text-emerald-700',
  damaged: 'bg-rose-100 text-rose-700',
}

export function DamagedToolPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [removeModal, setRemoveModal] = useState({ open: false, item: null })
  
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchDamagedTools(keyword, category, page, 10)
      setItems(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
      
      // Update categories if not set yet (just a simple extraction for UX)
      if (categories.length === 0 && data.content) {
        const uniqueCats = [...new Set(data.content.map(i => i.category).filter(Boolean))]
        if (uniqueCats.length > 0) {
          setCategories(uniqueCats)
        }
      }
    } catch (err) {
      setError(err.message || 'Không tải được danh sách CCDC hư hỏng')
    } finally {
      setLoading(false)
    }
  }, [page, keyword, category, categories.length]) // added categories.length

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  function handleSearch(event) {
    setKeyword(event.target.value)
    setPage(0)
  }

  function handleCategoryChange(event) {
    setCategory(event.target.value)
    setPage(0)
  }

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-950">CCDC hư hỏng</h1>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            {totalElements} chờ xử lý
          </span>
        </div>
      </section>
      {/* Search + Filter */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={handleSearch}
            placeholder="Tìm theo tên CCDC..."
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
      </section>

      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      {/* Table */}
      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {items.length} / {totalElements} CCDC hư hỏng
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
              <tr>
                <th className="px-5 py-3 w-16 text-center">STT</th>
                <th className="px-5 py-3">Tên CCDC</th>
                <th className="px-5 py-3 w-48">Chủng loại</th>
                <th className="px-5 py-3">Mô tả hư hỏng</th>
                <th className="px-5 py-3 text-center">SL</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !items.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                    Không có CCDC hư hỏng nào.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? items.map((item, index) => {
                    return (
                      <tr className="hover:bg-slate-50/80" key={item.toolId}>
                        <td className="px-5 py-4 text-center font-medium text-slate-500">
                          {page * 10 + index + 1}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {item.category}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="line-clamp-2 max-w-xs" title={item.note || 'Không có mô tả'}>
                            {item.note || 'Không có mô tả'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-slate-700">
                          {item.damagedQuantity}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setRemoveModal({ open: true, item })}
                            className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                          >
                            <Trash2 size={14} />
                            Hủy CCDC
                          </button>
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
      {removeModal.open ? (
        <ToolRemoveDamagedModal
          item={removeModal.item}
          onClose={() => setRemoveModal({ open: false, item: null })}
          onSuccess={() => {
            setRemoveModal({ open: false, item: null })
            loadData()
          }}
        />
      ) : null}
    </div>
  )
}
