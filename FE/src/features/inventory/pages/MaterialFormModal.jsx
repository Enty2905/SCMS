import { Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'

import { selectMaterialSubmitting } from '../store/material.selectors.js'
import { createMaterial, updateMaterial } from '../store/material.thunks.js'

export function MaterialFormModal({ item, onClose, onSuccess, tab }) {
  const dispatch = useDispatch()
  const submitting = useSelector(selectMaterialSubmitting)
  const isEdit = Boolean(item)

  const [form, setForm] = useState({

    name: item?.name || '',
    unit: item?.unit || '',
    minQuantity: item?.minQuantity ?? '',
    note: item?.note || '',
  })

  const [errors, setErrors] = useState({})

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  function validate() {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Tên vật tư không được để trống'
    }
    if (form.minQuantity !== '' && (isNaN(form.minQuantity) || Number(form.minQuantity) < 0)) {
      newErrors.minQuantity = 'Mức tối thiểu phải >= 0'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    const data = {

      name: form.name.trim(),
      unit: form.unit.trim() || null,
      minQuantity: form.minQuantity !== '' ? Number(form.minQuantity) : null,
      note: form.note.trim() || null,
    }

    try {
      if (isEdit) {
        const id = tab === 'sparepart' ? item.sparePartId : item.consumableId
        await dispatch(updateMaterial({ tab, id, data })).unwrap()
      } else {
        await dispatch(createMaterial({ tab, data })).unwrap()
      }
      onSuccess()
    } catch {
      // error is already in Redux state
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">
            {isEdit ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}
          </h2>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>

          <FormField
            error={errors.name}
            label="Tên vật tư"
            onChange={(value) => handleChange('name', value)}
            placeholder="Nhập tên vật tư"
            required
            value={form.name}
          />
          <FormField
            label="Đơn vị tính"
            onChange={(value) => handleChange('unit', value)}
            placeholder="Lít, Kg, Cái..."
            value={form.unit}
          />
          <FormField
            error={errors.minQuantity}
            label="Mức tối thiểu"
            onChange={(value) => handleChange('minQuantity', value)}
            placeholder="0"
            type="number"
            value={form.minQuantity}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Ghi chú
            </label>
            <textarea
              className="h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => handleChange('note', event.target.value)}
              placeholder="Ghi chú thêm..."
              value={form.note}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onClose} variant="secondary">
              Hủy
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              disabled={submitting}
              type="submit"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
              Lưu
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormField({ error, label, onChange, placeholder, required, type = 'text', value }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </label>
      <input
        className={[
          'h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:ring-4',
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/10',
        ].join(' ')}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : null}
    </div>
  )
}
