import { Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'
import { apiClient } from '@/shared/api/httpClient.js'

import { selectToolSubmitting } from '../store/tool.selectors.js'
import { createToolItem, updateToolItem } from '../store/tool.thunks.js'

export function ToolFormModal({ item, onClose, onSuccess }) {
  const dispatch = useDispatch()
  const submitting = useSelector(selectToolSubmitting)
  const isEdit = Boolean(item)

  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || '',
    totalQuantity: item?.totalQuantity ?? '',
    damagedQuantity: item?.damagedQuantity ?? 0,
    note: item?.note || '',
    imageUrl: item?.imageUrl || '',
  })

  const [uploadingImage, setUploadingImage] = useState(false)

  const [errors, setErrors] = useState({})

  // Tính availableQuantity để hiển thị (readonly)
  const borrowedQuantity = item?.borrowedQuantity ?? 0
  const totalQty = Number(form.totalQuantity) || 0
  const damagedQty = Number(form.damagedQuantity) || 0
  const computedAvailable = totalQty - borrowedQuantity - damagedQty

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Chỉ hỗ trợ định dạng JPG, JPEG, PNG' }))
      return
    }

    // Kiểm tra dung lượng (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Dung lượng ảnh tối đa 5MB' }))
      return
    }

    setErrors((prev) => ({ ...prev, image: null }))
    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'scms/tools')

      const response = await apiClient.post('/common/upload/image', formData)
      if (response && response.data) {
        handleChange('imageUrl', response.data)
      } else {
        setErrors((prev) => ({ ...prev, image: 'Tải ảnh thất bại' }))
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message || 'Lỗi tải ảnh' }))
    } finally {
      setUploadingImage(false)
    }
  }

  function validate() {
    const newErrors = {}
    if (!form.name.trim()) {
      newErrors.name = 'Tên CCDC không được để trống'
    }
    if (form.totalQuantity === '' || isNaN(form.totalQuantity) || Number(form.totalQuantity) < 0) {
      newErrors.totalQuantity = 'Tổng số lượng phải >= 0'
    }
    const dmg = Number(form.damagedQuantity)
    if (form.damagedQuantity === '' || isNaN(dmg) || dmg < 0) {
      newErrors.damagedQuantity = 'Số lượng hỏng phải >= 0'
    } else {
      const maxDamaged = totalQty - borrowedQuantity
      if (dmg > maxDamaged) {
        newErrors.damagedQuantity = `Số lượng hỏng không được vượt quá ${maxDamaged} (tổng - đang mượn)`
      }
    }
    if (!newErrors.totalQuantity && !newErrors.damagedQuantity && computedAvailable < 0) {
      newErrors.damagedQuantity = 'Số lượng khả dụng không được âm'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    const data = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      totalQuantity: Number(form.totalQuantity),
      damagedQuantity: Number(form.damagedQuantity),
      note: form.note.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
    }

    try {
      if (isEdit) {
        await dispatch(updateToolItem({ id: item.toolId, data })).unwrap()
      } else {
        await dispatch(createToolItem(data)).unwrap()
      }
      onSuccess()
    } catch {
      // error is in Redux state
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">
            {isEdit ? 'Chỉnh sửa CCDC' : 'Thêm CCDC mới'}
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
            label="Tên CCDC"
            onChange={(value) => handleChange('name', value)}
            placeholder="Nhập tên công cụ dụng cụ"
            required
            value={form.name}
          />
          <FormField
            label="Chủng loại"
            onChange={(value) => handleChange('category', value)}
            placeholder="Dụng cụ cơ khí, Máy điện cầm tay..."
            value={form.category}
          />

          {/* Tổng số lượng + Số lượng hỏng */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              error={errors.totalQuantity}
              label="Tổng số lượng"
              onChange={(value) => handleChange('totalQuantity', value)}
              placeholder="0"
              required
              type="number"
              value={form.totalQuantity}
            />
            <FormField
              error={errors.damagedQuantity}
              label="Số lượng hỏng"
              onChange={(value) => handleChange('damagedQuantity', value)}
              placeholder="0"
              required
              type="number"
              value={form.damagedQuantity}
            />
          </div>

          {/* Số lượng đang mượn (readonly info) + Số lượng khả dụng (readonly) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Đang mượn
              </label>
              <input
                className="h-10 w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                disabled
                readOnly
                value={borrowedQuantity}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Số lượng có sẵn
                <span className="ml-1 text-xs font-normal text-slate-400">(tự tính)</span>
              </label>
              <input
                className={[
                  'h-10 w-full cursor-not-allowed rounded-md border px-3 text-sm font-semibold',
                  computedAvailable < 0
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-slate-50 text-slate-700',
                ].join(' ')}
                disabled
                readOnly
                value={computedAvailable < 0 ? `${computedAvailable} (âm!)` : computedAvailable}
              />
            </div>
          </div>

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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Ảnh CCDC
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                {form.imageUrl ? (
                  <img
                    alt="CCDC preview"
                    className="h-full w-full object-cover"
                    src={form.imageUrl}
                  />
                ) : (
                  <span className="text-xs text-slate-400">Chưa có ảnh</span>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Loader2 className="animate-spin text-violet-600" size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  accept="image/jpeg, image/png, image/jpg"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                  disabled={uploadingImage}
                  onChange={handleImageChange}
                  type="file"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 5MB.
                </p>
                {errors.image ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.image}</p>
                ) : null}
              </div>
            </div>
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
