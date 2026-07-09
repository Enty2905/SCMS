import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/shared/components/ui/Button.jsx'
import { createConsumableImport } from '../services/consumableImport.service.js'
import { fetchConsumables } from '../services/consumable.service.js'

export function ConsumableImportFormModal({ onClose, onSuccess, initialItem = null }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  
  const [note, setNote] = useState('')
  const [items, setItems] = useState(() => {
    if (initialItem && initialItem.consumableId) {
      return [{ consumableId: initialItem.consumableId, quantity: '', note: '' }]
    }
    return [{ consumableId: '', quantity: '', note: '' }]
  })
  
  const [consumablesList, setConsumablesList] = useState([])

  useEffect(() => {
    // Load all consumables for the dropdown
    async function loadConsumables() {
      try {
        const data = await fetchConsumables({ size: 1000 })
        setConsumablesList(data.content || [])
      } catch (err) {
        console.error('Failed to load consumables', err)
      }
    }
    loadConsumables()
  }, [])

  function handleItemChange(index, field, value) {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  function addItem() {
    setItems([...items, { consumableId: '', quantity: '', note: '' }])
  }

  function removeItem(index) {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    // Validate FE
    if (items.length === 0) {
      setError('Phải có ít nhất 1 dòng vật tư.')
      return
    }

    const invalidItem = items.find((item) => !item.consumableId || !item.quantity || Number(item.quantity) <= 0)
    if (invalidItem) {
      setError('Mỗi dòng phải chọn vật tư và số lượng phải > 0.')
      return
    }

    const payload = {
      note,
      items: items.map((item) => ({
        ...item,
        quantity: Number(item.quantity)
      }))
    }

    try {
      setSubmitting(true)
      await createConsumableImport(payload)
      onSuccess()
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu phiếu nhập')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">Tạo phiếu nhập vật tư tiêu hao</h2>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1">
          {error && (
            <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Ghi chú phiếu nhập</label>
            <textarea
              className="h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm..."
              value={note}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Danh sách vật tư nhập</label>
              <Button size="sm" onClick={addItem} type="button" variant="outline">
                <Plus size={14} className="mr-1" />
                Thêm dòng
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start border p-3 rounded-md bg-slate-50">
                  <div className="flex-1">
                    <label className="mb-1 text-xs text-slate-500">Vật tư</label>
                    <select
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
                      value={item.consumableId}
                      onChange={(e) => handleItemChange(index, 'consumableId', e.target.value)}
                    >
                      <option value="">-- Chọn vật tư --</option>
                      {consumablesList.map((c) => (
                        <option key={c.consumableId} value={c.consumableId}>
                          {c.code} - {c.name} ({c.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="mb-1 text-xs text-slate-500">Số lượng</label>
                    <input
                      type="number"
                      min="1"
                      className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 text-xs text-slate-500">Ghi chú</label>
                    <input
                      type="text"
                      className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500"
                      value={item.note}
                      onChange={(e) => handleItemChange(index, 'note', e.target.value)}
                    />
                  </div>
                  <div className="pt-5">
                    <button
                      type="button"
                      className="h-9 px-2 text-slate-400 hover:text-rose-600 transition-colors"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      title="Xóa dòng"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 p-4 bg-slate-50 rounded-b-xl">
          <Button onClick={onClose} variant="secondary">
            Hủy
          </Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
            Lưu phiếu nhập
          </Button>
        </div>
      </div>
    </div>
  )
}
