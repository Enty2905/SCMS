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

export function ConsumableStockPage({ hideHeader }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [searchCode, setSearchCode] = useState('')
  const [searchName, setSearchName] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchConsumableStocks({ code: searchCode, name: searchName, page, size: 10 })
      setItems(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(err.message || 'Không tải được danh sách tồn kho')
    } finally {
      setLoading(false)
    }
  }, [page, searchCode, searchName])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  function handleSearchCode(event) {
    setSearchCode(event.target.value)
    setPage(0)
  }

  function handleSearchName(event) {
    setSearchName(event.target.value)
    setPage(0)
  }

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className={hideHeader ? "" : "mx-auto max-w-7xl"}>
      {!hideHeader && (
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-slate-950">Tồn kho vật tư tiêu hao</h1>
        </section>
      )}

      <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-4">
          <label className="relative flex-[1]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={handleSearchCode}
              placeholder="Nhập mã vật tư..."
              value={searchCode}
            />
          </label>
          <label className="relative flex-[2]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={handleSearchName}
              placeholder="Nhập tên vật tư..."
              value={searchName}
            />
          </label>
        </div>
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
                <th className="px-5 py-3 w-16 text-center">STT</th>
                <th className="px-5 py-3">Mã vật tư</th>
                <th className="px-5 py-3">Tên vật tư</th>
                <th className="px-5 py-3">Đơn vị</th>
                <th className="px-5 py-3 text-right">Tổng nhập</th>
                <th className="px-5 py-3 text-right">Tổng xuất</th>
                <th className="px-5 py-3 text-right font-bold">Tồn hiện tại</th>
                <th className="px-5 py-3 text-right">Tồn tối thiểu</th>
                <th className="px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={9}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !items.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={9}>
                    Không có vật tư nào phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? items.map((item, index) => {
                    const statusLabel = STATUS_LABELS[item.status] || item.status
                    const badgeClass = STATUS_BADGES[item.status] || 'bg-slate-100 text-slate-600'
                    return (
                      <tr className="hover:bg-slate-50/80" key={item.consumableId}>
                        <td className="px-5 py-4 text-center text-slate-600 font-medium">
                          {page * 10 + index + 1}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {item.code}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-slate-600">{item.unit}</td>
                        <td className="px-5 py-4 text-right text-slate-950 font-medium">
                          {item.importedQuantity}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-950 font-medium">
                          {item.exportedQuantity}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-950 font-bold bg-slate-50/50">
                          {item.stockQuantity}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-950 font-medium">
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
    </div>
  )
}
