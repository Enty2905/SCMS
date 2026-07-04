import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/Button.jsx'

export function DeleteConfirmModal({ itemName, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onConfirm()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">Xác nhận xóa</h2>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-rose-100 p-2 text-rose-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Bạn có chắc chắn muốn xóa vật tư{' '}
                <strong className="text-slate-950">{itemName}</strong> không?
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={onClose} variant="secondary">
              Hủy
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              disabled={deleting}
              onClick={handleConfirm}
            >
              {deleting ? <Loader2 className="animate-spin" size={16} /> : null}
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
