import { AlertCircle, Loader2, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/Button.jsx'
import { returnToolBorrow } from '../services/toolBorrow.service.js'

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

/**
 * Modal xác nhận trả CCDC.
 * @param {{ borrow: object, onClose: () => void, onSuccess: () => void }} props
 */
export function ToolReturnConfirmModal({ borrow, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  async function handleConfirm() {
    if (submitting) return
    setApiError(null)
    try {
      setSubmitting(true)
      await returnToolBorrow(borrow.borrowId)
      onSuccess()
    } catch (err) {
      setApiError(err.message || 'Lỗi khi xác nhận trả CCDC')
    } finally {
      setSubmitting(false)
    }
  }

  const statusBadge = STATUS_BADGES[borrow.status] || 'bg-slate-100 text-slate-600'
  const statusLabel = STATUS_LABELS[borrow.status] || borrow.status

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">Xác nhận trả CCDC</h2>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={16} className="shrink-0" />
              {apiError}
            </div>
          )}

          {borrow.status === 'overdue' && (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertCircle size={16} className="shrink-0" />
              Phiếu này đã quá hạn {borrow.overdueDays} ngày. CCDC hư hỏng (nếu có) xử lý qua chức năng Báo hỏng CCDC.
            </div>
          )}

          {/* Thông tin phiếu */}
          <div className="rounded-md border border-slate-200 bg-slate-50 divide-y divide-slate-100">
            <InfoRow label="Tên CCDC" value={borrow.toolName} />
            <InfoRow label="Người mượn" value={borrow.employeeName} />
            {borrow.employeePhone && (
              <InfoRow label="Số điện thoại" value={borrow.employeePhone} />
            )}
            <InfoRow label="Số lượng mượn" value={`${borrow.quantity} cái`} />
            <InfoRow label="Ngày mượn" value={formatDateTime(borrow.borrowedAt)} />
            <InfoRow label="Hạn trả" value={formatDateTime(borrow.dueDate)} />
            <InfoRow
              label="Trạng thái"
              value={
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadge}`}>
                  {statusLabel}
                </span>
              }
            />
            {borrow.note && <InfoRow label="Ghi chú" value={borrow.note} />}
          </div>

          <p className="text-sm text-slate-500">
            Hành động này sẽ đánh dấu phiếu mượn là <strong>Đã trả</strong> và hoàn lại số lượng CCDC vào kho.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-xl">
          <Button onClick={onClose} variant="secondary" type="button">
            Hủy
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
            Xác nhận trả
          </Button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="font-medium text-slate-900 text-right">{value}</span>
    </div>
  )
}
