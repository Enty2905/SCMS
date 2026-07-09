import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, AlertTriangle } from 'lucide-react'
import { selectRepairRequestSubmitting } from '../store/repairrequest.selectors.js'
import { createRequest } from '../store/repairrequest.thunks.js'
import { fetchEquipments } from '@/features/equipment/services/equipment.service.js'

const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Thấp',      color: 'text-slate-500' },
  { value: 'medium',   label: 'Trung bình', color: 'text-blue-500' },
  { value: 'high',     label: 'Cao',        color: 'text-orange-500' },
  { value: 'critical', label: 'Khẩn cấp',   color: 'text-red-600' },
]

/**
 * Modal tạo mới yêu cầu sửa chữa
 * @param {{ onClose: fn, onSuccess: fn }} props
 */
export function CreateRepairRequestModal({ onClose, onSuccess }) {
  const dispatch = useDispatch()
  const submitting = useSelector(selectRepairRequestSubmitting)

  const [form, setForm] = useState({
    equipmentId: '',
    description: '',
    priority: 'medium',
  })
  const [error, setError] = useState(null)
  
  const [equipments, setEquipments] = useState([])
  const [loadingEquipments, setLoadingEquipments] = useState(false)

  useEffect(() => {
    async function loadEquipments() {
      setLoadingEquipments(true)
      try {
        // Fetch all equipments (or you could implement search/pagination if large)
        const data = await fetchEquipments()
        // data should be an array of equipments if we assume the service returns response.data
        // Wait, equipment list returns { content: [...] } for pagination usually. Let's check how equipment is returned.
        // Actually fetchEquipments in equipment.service returns response.data directly. 
        // We'll extract content if it has pagination.
        const list = Array.isArray(data) ? data : (data.content || [])
        setEquipments(list)
      } catch (err) {
        console.error('Failed to load equipments', err)
      } finally {
        setLoadingEquipments(false)
      }
    }
    loadEquipments()
  }, [])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.equipmentId.trim()) {
      setError('Vui lòng nhập mã thiết bị (Equipment ID).')
      return
    }
    if (!form.description.trim()) {
      setError('Vui lòng nhập mô tả sự cố.')
      return
    }

    try {
      await dispatch(createRequest(form)).unwrap()
      onSuccess()
    } catch (err) {
      setError(err?.message || 'Tạo yêu cầu thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Tạo yêu cầu sửa chữa
          </h2>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
          {/* Error banner */}
          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <AlertTriangle className="mt-0.5 shrink-0" size={16} />
              {error}
            </div>
          ) : null}

          {/* Equipment ID */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Thiết bị <span className="text-red-500">*</span>
            </label>
            <select
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              name="equipmentId"
              onChange={handleChange}
              value={form.equipmentId}
              disabled={loadingEquipments}
            >
              <option value="">
                {loadingEquipments ? 'Đang tải danh sách thiết bị...' : '— Chọn thiết bị —'}
              </option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.kksCode ? `[${eq.kksCode}] ` : ''}{eq.equipmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Mô tả sự cố <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              name="description"
              onChange={handleChange}
              placeholder="Mô tả chi tiết tình trạng hư hỏng, hiện tượng bất thường của thiết bị..."
              rows={4}
              value={form.description}
            />
          </div>

          {/* Mức độ ưu tiên */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Mức độ ưu tiên
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  className={[
                    'rounded-lg border py-2 text-sm font-semibold transition',
                    form.priority === opt.value
                      ? 'border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-500/30'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                  key={opt.value}
                  onClick={() => setForm((p) => ({ ...p, priority: opt.value }))}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Hủy
            </button>
            <button
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
