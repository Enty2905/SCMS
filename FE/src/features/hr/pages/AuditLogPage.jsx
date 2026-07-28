import { ChevronLeft, ChevronRight, ScrollText, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'

import {
  selectAuditActions,
  selectAuditError,
  selectAuditFilters,
  selectAuditLoading,
  selectAuditLogs,
  selectAuditPagination,
} from '../store/hr-audit.selectors.js'
import { fetchAuditLogs, fetchAuditPageData } from '../store/hr-audit.thunks.js'

const targetStyles = {
  EMPLOYEE: 'bg-sky-100 text-sky-700',
  DEPARTMENT: 'bg-violet-100 text-violet-700',
  ACCOUNT: 'bg-amber-100 text-amber-700',
}

export function AuditLogPage() {
  const dispatch = useDispatch()
  const logs = useSelector(selectAuditLogs)
  const actions = useSelector(selectAuditActions)
  const pagination = useSelector(selectAuditPagination)
  const filters = useSelector(selectAuditFilters)
  const loading = useSelector(selectAuditLoading)
  const error = useSelector(selectAuditError)
  const [query, setQuery] = useState(filters.search)

  useEffect(() => {
    dispatch(fetchAuditPageData())
  }, [dispatch])

  // Gõ xong 400ms mới gọi API để không bắn request theo từng phím.
  useEffect(() => {
    if (query === filters.search) return undefined

    const timer = setTimeout(() => {
      dispatch(fetchAuditLogs({ search: query, page: 0 }))
    }, 400)

    return () => clearTimeout(timer)
  }, [dispatch, filters.search, query])

  const applyFilter = (changes) => {
    dispatch(fetchAuditLogs({ ...changes, page: 0 }))
  }

  const goToPage = (page) => {
    if (page < 0 || page >= pagination.totalPages) return
    dispatch(fetchAuditLogs({ page }))
  }

  const firstRowIndex = pagination.page * pagination.size

  return (
    <div className="mx-auto max-w-7xl">
      <section className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-950">Nhật ký thao tác nhân sự</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ghi lại ai đã thêm, sửa, xóa hồ sơ và ai đã cấp, khóa hay đặt lại mật khẩu tài khoản.
          Nhật ký chỉ đọc, không sửa và không xóa được.
        </p>
      </section>

      <section className="mt-5 flex flex-col gap-3 xl:flex-row">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo đối tượng, người thực hiện hoặc nội dung..."
            value={query}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-11 min-w-52 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(event) => applyFilter({ action: event.target.value })}
            value={filters.action}
          >
            <option value="all">Tất cả thao tác</option>
            {actions.map((item) => (
              <option key={item.action} value={item.action}>
                {item.targetTypeLabel} — {item.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            Từ
            <input
              className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
              max={filters.to || undefined}
              onChange={(event) => applyFilter({ from: event.target.value })}
              type="date"
              value={filters.from}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            đến
            <input
              className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
              min={filters.from || undefined}
              onChange={(event) => applyFilter({ to: event.target.value })}
              type="date"
              value={filters.to}
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
          Hiển thị {logs.length} / {pagination.totalElements} thao tác
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-16 px-5 py-3 text-center font-semibold">STT</th>
                <th className="px-5 py-3 font-semibold">Thời điểm</th>
                <th className="px-5 py-3 font-semibold">Thao tác</th>
                <th className="px-5 py-3 font-semibold">Đối tượng</th>
                <th className="px-5 py-3 font-semibold">Người thực hiện</th>
                <th className="px-5 py-3 font-semibold">Nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                    Đang tải nhật ký...
                  </td>
                </tr>
              ) : null}

              {!loading && !logs.length ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={6}>
                    <ScrollText className="mx-auto mb-2 text-slate-300" size={28} />
                    Chưa có thao tác nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? logs.map((log, index) => (
                    <tr className="hover:bg-slate-50/80" key={log.id}>
                      <td className="px-5 py-4 text-center font-medium text-slate-500">
                        {firstRowIndex + index + 1}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDateTime(log.createdAt)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                            targetStyles[log.targetType] || 'bg-slate-100 text-slate-600',
                          ].join(' ')}
                        >
                          {log.actionLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {log.targetName || 'Không rõ'}
                        </p>
                        <p className="text-xs text-slate-500">{log.targetTypeLabel}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {log.performedByName || log.performedBy}
                        </p>
                        <p className="text-xs text-slate-500">{log.performedBy}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{log.detail || '—'}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-sm text-slate-500">
              Trang {pagination.page + 1} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                aria-label="Trang trước"
                disabled={loading || pagination.page === 0}
                onClick={() => goToPage(pagination.page - 1)}
                size="icon"
                variant="secondary"
              >
                <ChevronLeft size={17} />
              </Button>
              <Button
                aria-label="Trang sau"
                disabled={loading || pagination.page >= pagination.totalPages - 1}
                onClick={() => goToPage(pagination.page + 1)}
                size="icon"
                variant="secondary"
              >
                <ChevronRight size={17} />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

function formatDateTime(value) {
  if (!value) {
    return 'Chưa rõ'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
