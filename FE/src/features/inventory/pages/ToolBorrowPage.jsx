import { AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { getToolBorrows } from '../services/toolBorrow.service.js'
import { ToolReturnConfirmModal } from './ToolReturnConfirmModal.jsx'

const TABS = [
  { key: 'borrowing', label: 'Đang mượn', icon: Clock, badge: 'bg-amber-100 text-amber-700' },
  { key: 'overdue', label: 'Quá hạn', icon: AlertTriangle, badge: 'bg-rose-100 text-rose-700' },
  { key: 'returned', label: 'Lịch sử mượn/trả', icon: CheckCircle, badge: 'bg-slate-100 text-slate-600' },
]

const STATUS_LABELS = {
  borrowing: 'Đang mượn',
  overdue: 'Quá hạn',
  returned: 'Đã trả',
}

const STATUS_BADGES = {
  borrowing: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
  returned: 'bg-emerald-100 text-emerald-700',
}

function formatDateTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('vi-VN')
}

export function ToolBorrowPage() {
  const [activeTab, setActiveTab] = useState('borrowing')
  const [keyword, setKeyword] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Modal trả CCDC
  const [returnModal, setReturnModal] = useState({ open: false, borrow: null })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getToolBorrows({
        keyword: keyword || undefined,
        status: activeTab,
        page,
        size: 10,
      })
      setItems(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(err.message || 'Không tải được danh sách phiếu mượn')
    } finally {
      setLoading(false)
    }
  }, [activeTab, keyword, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  function handleTabChange(tab) {
    setActiveTab(tab)
    setPage(0)
    setKeyword('')
  }

  function handleSearch(e) {
    setKeyword(e.target.value)
    setPage(0)
  }

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage)
  }

  function openReturnModal(borrow) {
    setReturnModal({ open: true, borrow })
  }

  function handleReturnSuccess() {
    setReturnModal({ open: false, borrow: null })
    loadData()
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <h1 className="text-xl font-bold text-slate-950">Mượn / Trả CCDC</h1>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 mb-5 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={[
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
              activeTab === key
                ? 'bg-white text-violet-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900',
            ].join(' ')}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <section className="mb-5">
        <label className="relative block max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={handleSearch}
            placeholder="Tìm theo tên CCDC hoặc nhân viên..."
            value={keyword}
          />
        </label>
      </section>

      {error && (
        <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      {/* Table */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {items.length} / {totalElements} phiếu
        </div>
        <div className="overflow-x-auto">
          {activeTab === 'borrowing' && (
            <BorrowingTable
              items={items}
              loading={loading}
              page={page}
              onReturn={openReturnModal}
            />
          )}
          {activeTab === 'overdue' && (
            <OverdueTable
              items={items}
              loading={loading}
              page={page}
              onReturn={openReturnModal}
            />
          )}
          {activeTab === 'returned' && (
            <HistoryTable items={items} loading={loading} page={page} />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>

      {/* Modal trả */}
      {returnModal.open && (
        <ToolReturnConfirmModal
          borrow={returnModal.borrow}
          onClose={() => setReturnModal({ open: false, borrow: null })}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  )
}

// ── Bảng Đang mượn ──────────────────────────────────────────────
function BorrowingTable({ items, loading, page, onReturn }) {
  return (
    <table className="w-full min-w-[900px] border-collapse text-left text-sm">
      <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
        <tr>
          <th className="px-5 py-3 w-12 text-center">STT</th>
          <th className="px-5 py-3">Tên CCDC</th>
          <th className="px-5 py-3">Người mượn</th>
          <th className="px-5 py-3">Số điện thoại</th>
          <th className="px-5 py-3 text-right">Số lượng</th>
          <th className="px-5 py-3">Ngày mượn</th>
          <th className="px-5 py-3">Hạn trả</th>
          <th className="px-5 py-3 text-center">Trạng thái</th>
          <th className="px-5 py-3 text-center">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        <TableRows items={items} loading={loading} colSpan={9} page={page}>
          {(item, index) => (
            <tr className="hover:bg-slate-50/80" key={item.borrowId}>
              <td className="px-5 py-4 text-center text-slate-500">{page * 10 + index + 1}</td>
              <td className="px-5 py-4 font-semibold text-slate-950">{item.toolName}</td>
              <td className="px-5 py-4 text-slate-700">{item.employeeName}</td>
              <td className="px-5 py-4 text-slate-600">{item.employeePhone || '—'}</td>
              <td className="px-5 py-4 text-right font-semibold text-amber-600">{item.quantity}</td>
              <td className="px-5 py-4 text-slate-600">{formatDateTime(item.borrowedAt)}</td>
              <td className="px-5 py-4 text-slate-600">{formatDateTime(item.dueDate)}</td>
              <td className="px-5 py-4 text-center">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-4 text-center">
                <ReturnButton onReturn={() => onReturn(item)} />
              </td>
            </tr>
          )}
        </TableRows>
      </tbody>
    </table>
  )
}

// ── Bảng Quá hạn ────────────────────────────────────────────────
function OverdueTable({ items, loading, page, onReturn }) {
  return (
    <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
      <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
        <tr>
          <th className="px-5 py-3 w-12 text-center">STT</th>
          <th className="px-5 py-3">Tên CCDC</th>
          <th className="px-5 py-3">Người mượn</th>
          <th className="px-5 py-3">Số điện thoại</th>
          <th className="px-5 py-3 text-right">Số lượng</th>
          <th className="px-5 py-3">Ngày mượn</th>
          <th className="px-5 py-3">Hạn trả</th>
          <th className="px-5 py-3 text-right">Quá hạn</th>
          <th className="px-5 py-3 text-center">Trạng thái</th>
          <th className="px-5 py-3 text-center">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        <TableRows items={items} loading={loading} colSpan={10} page={page}>
          {(item, index) => (
            <tr className="hover:bg-rose-50/50" key={item.borrowId}>
              <td className="px-5 py-4 text-center text-slate-500">{page * 10 + index + 1}</td>
              <td className="px-5 py-4 font-semibold text-slate-950">{item.toolName}</td>
              <td className="px-5 py-4 text-slate-700">{item.employeeName}</td>
              <td className="px-5 py-4 text-slate-600">{item.employeePhone || '—'}</td>
              <td className="px-5 py-4 text-right font-semibold text-rose-600">{item.quantity}</td>
              <td className="px-5 py-4 text-slate-600">{formatDateTime(item.borrowedAt)}</td>
              <td className="px-5 py-4 text-rose-600 font-medium">{formatDateTime(item.dueDate)}</td>
              <td className="px-5 py-4 text-right font-bold text-rose-600">
                {item.overdueDays > 0 ? `${item.overdueDays} ngày` : '—'}
              </td>
              <td className="px-5 py-4 text-center">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-4 text-center">
                <ReturnButton onReturn={() => onReturn(item)} />
              </td>
            </tr>
          )}
        </TableRows>
      </tbody>
    </table>
  )
}

// ── Bảng Lịch sử ────────────────────────────────────────────────
function HistoryTable({ items, loading, page }) {
  return (
    <table className="w-full min-w-[900px] border-collapse text-left text-sm">
      <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
        <tr>
          <th className="px-5 py-3 w-12 text-center">STT</th>
          <th className="px-5 py-3">Tên CCDC</th>
          <th className="px-5 py-3">Người mượn</th>
          <th className="px-5 py-3 text-right">Số lượng</th>
          <th className="px-5 py-3">Ngày mượn</th>
          <th className="px-5 py-3">Hạn trả</th>
          <th className="px-5 py-3">Ngày trả</th>
          <th className="px-5 py-3 text-center">Trạng thái</th>
          <th className="px-5 py-3">Ghi chú</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        <TableRows items={items} loading={loading} colSpan={9} page={page}>
          {(item, index) => (
            <tr className="hover:bg-slate-50/80" key={item.borrowId}>
              <td className="px-5 py-4 text-center text-slate-500">{page * 10 + index + 1}</td>
              <td className="px-5 py-4 font-semibold text-slate-950">{item.toolName}</td>
              <td className="px-5 py-4 text-slate-700">{item.employeeName}</td>
              <td className="px-5 py-4 text-right font-semibold text-slate-700">{item.quantity}</td>
              <td className="px-5 py-4 text-slate-600">{formatDateTime(item.borrowedAt)}</td>
              <td className="px-5 py-4 text-slate-600">{formatDateTime(item.dueDate)}</td>
              <td className="px-5 py-4 text-emerald-700 font-medium">{formatDateTime(item.returnedAt)}</td>
              <td className="px-5 py-4 text-center">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-4 text-slate-600">
                <span className="line-clamp-2 max-w-[12rem]" title={item.note}>
                  {item.note || '—'}
                </span>
              </td>
            </tr>
          )}
        </TableRows>
      </tbody>
    </table>
  )
}

// ── Helpers ──────────────────────────────────────────────────────
function TableRows({ items, loading, colSpan, children }) {
  if (loading) {
    return (
      <tr>
        <td className="px-5 py-8 text-center text-slate-500" colSpan={colSpan}>
          Đang tải dữ liệu...
        </td>
      </tr>
    )
  }
  if (!items.length) {
    return (
      <tr>
        <td className="px-5 py-8 text-center text-slate-500" colSpan={colSpan}>
          Không có dữ liệu phù hợp.
        </td>
      </tr>
    )
  }
  return items.map((item, index) => children(item, index))
}

function StatusBadge({ status }) {
  const badgeClass = STATUS_BADGES[status] || 'bg-slate-100 text-slate-600'
  const label = STATUS_LABELS[status] || status
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}>
      {label}
    </span>
  )
}

function ReturnButton({ onReturn }) {
  return (
    <button
      type="button"
      onClick={onReturn}
      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
    >
      <CheckCircle size={13} />
      Xác nhận trả
    </button>
  )
}

function Pagination({ page, totalPages, onPageChange }) {
  let startPage = Math.max(0, page - 2)
  let endPage = Math.min(totalPages - 1, page + 2)
  if (endPage - startPage < 4) {
    if (startPage === 0) endPage = Math.min(totalPages - 1, 4)
    else if (endPage === totalPages - 1) startPage = Math.max(0, endPage - 4)
  }
  const pages = []
  for (let i = startPage; i <= endPage; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
      <p className="text-sm text-slate-500">
        Trang {page + 1} / {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          disabled={page === 0}
          onClick={() => onPageChange(0)}
        >
          Đầu
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
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </button>
        ))}
        <button
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
        >
          Cuối
        </button>
      </div>
    </div>
  )
}
