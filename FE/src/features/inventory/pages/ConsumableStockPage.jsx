import { Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { fetchConsumableStocks } from '../services/consumableStock.service.js'

const STATUS_LABELS = {
  available: 'Còn hàng',
  low: 'Sắp hết',
  out: 'Hết hàng',
}

const STATUS_BADGES = {
  available: 'bg-emerald-100 text-emerald-700',
  low: 'bg-amber-100 text-amber-700',
  out: 'bg-rose-100 text-rose-700',
}

export function ConsumableStockPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [keyword, setKeyword] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchConsumableStocks(keyword, page, 10)
      setItems(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(err.message || 'Không tải được danh sách tồn kho')
    } finally {
      setLoading(false)
    }
  }, [page, keyword])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  function handleSearch(event) {
    setKeyword(event.target.value)
    setPage(0)
  }

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-950">Tồn kho vật tư tiêu hao</h1>
      </section>

      <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={handleSearch}
            placeholder="Tìm theo mã hoặc tên vật tư..."
            value={keyword}
          />
        </label>
      </section>

      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {items.length} / {totalElements} vật tư
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
              <tr>
                <th className="px-5 py-3">Mã vật tư</th>
                <th className="px-5 py-3">Tên vật tư</th>
                <th className="px-5 py-3">Đơn vị</th>
                <th className="px-5 py-3 text-right">Tổng nhập</th>
                <th className="px-5 py-3 text-right">Tổng xuất</th>
                <th className="px-5 py-3 text-right text-violet-600 font-bold">Tồn hiện tại</th>
                <th className="px-5 py-3 text-right">Tồn tối thiểu</th>
                <th className="px-5 py-3">Trạng thái</th>
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
                    Không có vật tư nào phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? items.map((item) => {
                    const statusLabel = STATUS_LABELS[item.status] || item.status
                    const badgeClass = STATUS_BADGES[item.status] || 'bg-slate-100 text-slate-600'
                    return (
                      <tr className="hover:bg-slate-50/80" key={item.consumableId}>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {item.code}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-slate-600">{item.unit}</td>
                        <td className="px-5 py-4 text-right text-emerald-600 font-medium">
                          {item.importedQuantity}
                        </td>
                        <td className="px-5 py-4 text-right text-rose-600 font-medium">
                          {item.exportedQuantity}
                        </td>
                        <td className="px-5 py-4 text-right text-violet-600 font-bold bg-violet-50/50">
                          {item.stockQuantity}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-600 font-medium">
                          {item.minQuantity}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}
                          >
                            {statusLabel}
                          </span>
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
              Hiển thị trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
              >
                Trước
              </button>
              <button
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                disabled={page >= totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
