import { Loader2, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/Button.jsx'
import { disposeDamagedTool } from '../services/tool.service.js'

export function ToolDisposeDamagedModal({ item, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    const disposeQty = Number(quantity)
    if (!disposeQty || disposeQty <= 0) {
      setError('Số lượng hư hỏng phải > 0')
      return
    }

    if (disposeQty > item.availableQuantity) {
      setError(`Số lượng hư hỏng không được vượt quá số lượng khả dụng hiện tại (${item.availableQuantity})`)
      return
    }

    try {
      setSubmitting(true)
      await disposeDamagedTool(item.toolId, {
        quantity: disposeQty,
        note: note.trim()
      })
      onSuccess()
    } catch (err) {
      setError(err.message || 'Lỗi khi báo cáo hư hỏng')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">Báo cáo hư hỏng CCDC</h2>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {error && (
            <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="mb-4 bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="text-sm font-semibold text-slate-950 mb-1">{item.name}</p>
            <div className="flex gap-4 text-xs text-slate-600">
              <span>Chủng loại: <span className="font-medium text-slate-900">{item.category}</span></span>
              <span>Khả dụng: <span className="font-bold text-emerald-600">{item.availableQuantity}</span></span>
            </div>
          </div>

          <form id="disposeForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Số lượng hư hỏng <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={item.availableQuantity}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Tối đa ${item.availableQuantity}`}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Lý do hư hỏng
              </label>
              <textarea
                className="h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Máy khoan cháy động cơ, không thể sửa..."
                value={note}
              />
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 p-4 bg-slate-50 rounded-b-xl">
          <Button onClick={onClose} variant="secondary">
            Hủy
          </Button>
          <Button
            type="submit"
            form="disposeForm"
            className="bg-rose-600 hover:bg-rose-700 text-white"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  )
}
