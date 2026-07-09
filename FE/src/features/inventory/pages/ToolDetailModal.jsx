import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button.jsx'

export function ToolDetailModal({ item, onClose }) {
  if (!item) return null

  // Status mapping
  const STATUS_LABELS = {
    available: 'Còn hàng',
    damaged: 'Bị hỏng',
  }
  
  const STATUS_BADGES = {
    available: 'bg-emerald-100 text-emerald-700',
    damaged: 'bg-rose-100 text-rose-700',
  }

  const statusLabel = STATUS_LABELS[item.status] || item.status
  const badgeClass = STATUS_BADGES[item.status] || 'bg-slate-100 text-slate-600'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">
            Chi tiết Công Cụ Dụng Cụ
          </h2>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Tên CCDC" value={item.name} />
            <DetailItem label="Chủng loại" value={item.category || '---'} />
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4">
            <DetailItem label="Tổng số lượng" value={item.totalQuantity} valueColor="text-violet-600" />
            <DetailItem label="Đang mượn" value={item.borrowedQuantity ?? 0} valueColor="text-amber-600" />
            <DetailItem label="Hư hỏng" value={item.damagedQuantity ?? 0} valueColor="text-rose-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Số lượng có sẵn" value={item.availableQuantity} valueColor="text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Trạng thái</p>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Ghi chú</p>
            <div className="min-h-[5rem] w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
              {item.note || 'Không có ghi chú.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button onClick={onClose} variant="secondary">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value, valueColor = 'text-slate-950' }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-base font-semibold ${valueColor}`}>{value}</p>
    </div>
  )
}
