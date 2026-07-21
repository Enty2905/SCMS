import { useEffect, useState } from 'react'
import { AlertTriangle, Clock, Loader2, Play, Square, X, Upload } from 'lucide-react'

import { Button } from '@/shared/components/ui/Button.jsx'
import {
  closeDailyLogService,
  fetchDailyLogsService,
  openDailyLogService,
} from '../services/maintenance.service.js'

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function DailyLogModal({ orderId, orderNumber, status, onClose, onSuccess }) {
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const size = 10

  // Ghi chú khi đóng phiếu
  const [note, setNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)

  useEffect(() => {
    loadLogs(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, page])

  async function loadLogs(currentPage = 0) {
    try {
      setLoading(true)
      setError('')
      const data = await fetchDailyLogsService(orderId, { page: currentPage, size })
      setLogs(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử đóng mở phiếu')
    } finally {
      setLoading(false)
    }
  }

  // Kiểm tra xem có phiên nào đang mở (chưa đóng) không
  const activeLog = logs.find((log) => !log.closedAt)

  async function handleOpenLog() {
    try {
      setActionLoading(true)
      setError('')
      await openDailyLogService(orderId)
      await loadLogs(0)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || 'Lỗi khi mở phiên làm việc')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCloseLog() {
    try {
      setActionLoading(true)
      setError('')
      await closeDailyLogService(orderId, note)
      setShowNoteInput(false)
      setNote('')
      await loadLogs(0)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || 'Lỗi khi kết thúc phiên làm việc')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Sổ nhật ký công tác</h3>
            <p className="text-sm text-slate-500">
              PCT: <strong className="text-violet-700">{orderNumber}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => alert('Chức năng upload file cứng đang phát triển')}
            >
              <Upload size={14} className="mr-1.5 text-slate-400" />
              Upload bản cứng (Scan)
            </Button>
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div>
            {activeLog ? (
              <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Phiên làm việc đang mở (Bắt đầu lúc {formatTime(activeLog.openedAt)})
              </div>
            ) : (
              <div className="text-sm text-slate-500 font-medium">
                Hiện không có phiên làm việc nào đang mở.
              </div>
            )}
          </div>
          <div>
            {status === 'locked' ? (
              <div className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md">
                Phiếu công tác đã hoàn thành. (Chỉ xem)
              </div>
            ) : activeLog ? (
              <div className="flex items-center gap-2">
                {showNoteInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="h-9 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 w-64"
                      placeholder="Ghi chú công việc hôm nay (tuỳ chọn)..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <Button 
                      className="h-9 bg-rose-600 hover:bg-rose-700 text-white px-3" 
                      onClick={handleCloseLog}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Xác nhận Đóng'}
                    </Button>
                    <Button 
                      className="h-9" 
                      variant="secondary"
                      onClick={() => setShowNoteInput(false)}
                      disabled={actionLoading}
                    >
                      Huỷ
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="h-9 bg-rose-100 text-rose-700 hover:bg-rose-200" 
                    onClick={() => setShowNoteInput(true)}
                  >
                    <Square size={16} className="mr-1.5" />
                    Kết thúc phiên (Đóng PCT)
                  </Button>
                )}
              </div>
            ) : (
              <Button 
                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white" 
                onClick={handleOpenLog}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} className="mr-1.5" />}
                Mở phiên làm việc mới
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-slate-50/50">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 text-center w-12">STT</th>
                  <th className="border-b border-slate-200 px-4 py-3">Ngày</th>
                  <th className="border-b border-slate-200 px-4 py-3">Mở phiếu</th>
                  <th className="border-b border-slate-200 px-4 py-3">Kết thúc (Đóng)</th>
                  <th className="border-b border-slate-200 px-4 py-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <Loader2 className="animate-spin inline-block mr-2" size={18} />
                      Đang tải nhật ký...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Chưa có lịch sử mở/đóng phiếu nào.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={log.logId} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-center text-slate-500">{page * size + idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{formatDate(log.date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Clock size={14} className="text-emerald-500" />
                          <span className="font-semibold">{formatTime(log.openedAt)}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">Bởi: {log.openedByName}</p>
                      </td>
                      <td className="px-4 py-3">
                        {log.closedAt ? (
                          <>
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Clock size={14} className="text-rose-500" />
                              <span className="font-semibold">{formatTime(log.closedAt)}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">Bởi: {log.closedByName}</p>
                          </>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            Đang mở
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs whitespace-pre-line max-w-xs">
                        {log.note || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end border-t border-slate-200 bg-white px-6 py-3 gap-1.5">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={page === 0}
                  className="flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Đầu
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                      p === page
                        ? 'border-violet-600 bg-violet-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={page === totalPages - 1}
                  className="flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Cuối
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
