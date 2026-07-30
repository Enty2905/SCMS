import { Plus, Eye } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/shared/components/ui/Button.jsx'
import { fetchConsumableImports } from '../services/consumableImport.service.js'
import { ConsumableImportFormModal } from './ConsumableImportFormModal.jsx'
import { ConsumableImportDetailModal } from './ConsumableImportDetailModal.jsx'

export function ConsumableImportPage({ hideHeader }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [detailModalItem, setDetailModalItem] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchConsumableImports(page, 10)
      setItems(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(err.message || 'Không tải được danh sách phiếu nhập')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  function handleFormSuccess() {
    setFormModalOpen(false)
    loadData()
  }

  return (
    <div className={hideHeader ? "" : "mx-auto max-w-7xl"}>
      {!hideHeader && (
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-slate-950">Phiếu nhập kho vật tư tiêu hao</h1>
        </section>
      )}

      <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center justify-end">
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => setFormModalOpen(true)}
        >
          <Plus size={17} />
          Tạo phiếu nhập
        </Button>
      </section>

      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {items.length} / {totalElements} phiếu nhập
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
              <tr>
                <th className="px-5 py-3 w-16 text-center">STT</th>
                <th className="px-5 py-3">Mã phiếu</th>
                <th className="px-5 py-3">Người nhập</th>
                <th className="px-5 py-3">Ngày nhập</th>
                <th className="px-5 py-3 text-right">Tổng loại vật tư</th>
                <th className="px-5 py-3">Ghi chú</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={7}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !items.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={7}>
                    Chưa có phiếu nhập nào.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? items.map((item, index) => (
                    <tr className="hover:bg-slate-50/80" key={item.importId}>
                      <td className="px-5 py-4 text-center text-slate-600 font-medium">
                        {page * 10 + index + 1}
                      </td>
                      <td className="px-5 py-4 font-semibold text-violet-600">
                        {item.importNumber}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        {item.importedByName || item.importedBy}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {new Date(item.importedAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-700">
                        {item.items?.length || 0}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <span className="line-clamp-2 max-w-xs" title={item.note}>
                          {item.note}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          className="rounded-md p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600"
                          onClick={() => setDetailModalItem(item)}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
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

      {formModalOpen && (
        <ConsumableImportFormModal
          onClose={() => setFormModalOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {detailModalItem && (
        <ConsumableImportDetailModal
          item={detailModalItem}
          onClose={() => setDetailModalItem(null)}
        />
      )}
    </div>
  )
}
