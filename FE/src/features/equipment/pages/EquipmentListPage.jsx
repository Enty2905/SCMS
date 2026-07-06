import { Edit3, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/shared/components/ui/Button.jsx'
import {
  fetchEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  fetchSystems,
} from '../services/equipment.service.js'

export function EquipmentListPage() {
  const [equipments, setEquipments] = useState([])
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Search & Filter state
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [systemFilter, setSystemFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const equipmentTypes = useMemo(() => {
    return [...new Set(equipments.map((eq) => eq.equipmentType).filter(Boolean))]
  }, [equipments])

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [formData, setFormData] = useState({
    kksCode: '',
    equipmentName: '',
    equipmentType: '',
    status: 'Hoạt động',
    location: '',
    systemId: '',
  })
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Load Initial Data
  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [eqList, sysList] = await Promise.all([
        fetchEquipments(),
        fetchSystems(),
      ])
      setEquipments(eqList)
      setSystems(sysList)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Không thể tải dữ liệu thiết bị. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialData() {
      try {
        const [eqList, sysList] = await Promise.all([
          fetchEquipments(),
          fetchSystems(),
        ])

        if (!ignore) {
          setEquipments(eqList)
          setSystems(sysList)
        }
      } catch (err) {
        console.error(err)
        if (!ignore) {
          setError(err.message || 'KhĂ´ng thá»ƒ táº£i dá»¯ liá»‡u thiáº¿t bá»‹. Vui lĂ²ng thá»­ láº¡i.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      ignore = true
    }
  }, [])

  // Filtered equipments
  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      const keywordLower = keyword.trim().toLowerCase()
      const matchesSearch =
        !keywordLower ||
        eq.kksCode?.toLowerCase().includes(keywordLower) ||
        eq.equipmentName?.toLowerCase().includes(keywordLower) ||
        eq.equipmentType?.toLowerCase().includes(keywordLower) ||
        eq.location?.toLowerCase().includes(keywordLower)

      const matchesStatus =
        statusFilter === 'all' ||
        eq.status?.toLowerCase() === statusFilter.toLowerCase()

      const matchesSystem =
        systemFilter === 'all' || eq.systemId === systemFilter

      const matchesType =
        typeFilter === 'all' || eq.equipmentType === typeFilter

      return matchesSearch && matchesStatus && matchesSystem && matchesType
    })
  }, [equipments, keyword, statusFilter, systemFilter, typeFilter])

  // System name mapping
  const systemMap = useMemo(() => {
    return new Map(systems.map((sys) => [sys.systemId, sys.systemName]))
  }, [systems])

  // Open Add/Edit Modal
  function openModal(eq = null) {
    setError(null)
    setFormError(null)
    if (eq) {
      setEditingEquipment(eq)
      setFormData({
        kksCode: eq.kksCode || '',
        equipmentName: eq.equipmentName || '',
        equipmentType: eq.equipmentType || '',
        status: eq.status || 'Hoạt động',
        location: eq.location || '',
        systemId: eq.systemId || '',
      })
    } else {
      setEditingEquipment(null)
      setFormData({
        kksCode: '',
        equipmentName: '',
        equipmentType: '',
        status: 'Hoạt động',
        location: '',
        systemId: systems[0]?.systemId || '',
      })
    }
    setIsModalOpen(true)
  }

  // Handle Form Input Changes
  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle Form Submit
  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    
    // Validate client-side
    if (!formData.kksCode.trim()) return setFormError('Mã KKS không được để trống')
    if (!formData.equipmentName.trim()) return setFormError('Tên thiết bị không được để trống')
    if (!formData.equipmentType.trim()) return setFormError('Loại thiết bị không được để trống')
    if (!formData.status.trim()) return setFormError('Trạng thái không được để trống')

    setSubmitting(true)
    try {
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, formData)
      } else {
        await createEquipment(formData)
      }
      setIsModalOpen(false)
      loadData() // Refresh list
    } catch (err) {
      console.error(err)
      setFormError(err.message || 'Lỗi lưu thông tin thiết bị.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Delete Equipment
  async function handleDelete(eq) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thiết bị "${eq.equipmentName}" (${eq.kksCode})?`)) {
      return
    }

    try {
      await deleteEquipment(eq.id)
      loadData() // Refresh
    } catch (err) {
      console.error(err)
      alert(err.message || 'Lỗi khi xóa thiết bị.')
    }
  }

  // Helper for Status Badge styling
  function getStatusBadgeStyle(status = '') {
    const normalized = status.toLowerCase()
    if (normalized === 'hoạt động' || normalized === 'active') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
    if (normalized === 'bảo dưỡng' || normalized === 'maintenance') {
      return 'bg-amber-100 text-amber-700 border-amber-200'
    }
    if (normalized === 'sự cố' || normalized === 'broken' || normalized === 'hỏng') {
      return 'bg-rose-100 text-rose-700 border-rose-200'
    }
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header section */}
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Quản lý Thiết bị</h1>
          <p className="mt-1 text-sm text-slate-500">
            Danh mục toàn bộ thiết bị trong nhà máy nhiệt điện, tra cứu mã KKS, trạng thái vận hành và bảo dưỡng.
          </p>
        </div>
        <Button onClick={() => openModal(null)} className="bg-violet-600 hover:bg-violet-700 text-white font-medium">
          <Plus size={17} />
          Thêm thiết bị
        </Button>
      </section>

      {/* Search & Filter section */}
      <section className="mt-5 flex flex-col gap-3 xl:flex-row">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm mã KKS, tên thiết bị, loại, vị trí..."
            value={keyword}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-11 min-w-48 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setSystemFilter(event.target.value)}
            value={systemFilter}
          >
            <option value="all">Tất cả hệ thống</option>
            {systems.map((sys) => (
              <option key={sys.systemId} value={sys.systemId}>
                {sys.systemName} ({sys.systemCode})
              </option>
            ))}
          </select>

          <select
            className="h-11 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setTypeFilter(event.target.value)}
            value={typeFilter}
          >
            <option value="all">Tất cả loại thiết bị</option>
            {equipmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="h-11 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Bảo dưỡng">Bảo dưỡng</option>
            <option value="Sự cố">Sự cố</option>
          </select>
        </div>
      </section>

      {/* Main Grid / Table Content */}
      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {filteredEquipments.length} / {equipments.length} thiết bị
        </div>
        
        {error ? (
          <div className="m-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Mã KKS</th>
                <th className="px-5 py-3.5 font-semibold">Tên thiết bị</th>
                <th className="px-5 py-3.5 font-semibold">Loại thiết bị</th>
                <th className="px-5 py-3.5 font-semibold">Hệ thống</th>
                <th className="px-5 py-3.5 font-semibold">Vị trí</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={7}>
                    Đang tải dữ liệu thiết bị...
                  </td>
                </tr>
              ) : null}

              {!loading && !filteredEquipments.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={7}>
                    Không tìm thấy thiết bị nào phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading && filteredEquipments.map((eq) => (
                <tr className="hover:bg-slate-50/80 transition-colors" key={eq.id}>
                  <td className="px-5 py-4 font-mono font-bold text-violet-700 text-xs">
                    {eq.kksCode}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {eq.equipmentName}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {eq.equipmentType}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {systemMap.get(eq.systemId) || <span className="text-slate-400 italic">Chưa gắn hệ thống</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {eq.location || <span className="text-slate-400 italic">Chưa xác định</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold border ${getStatusBadgeStyle(eq.status)}`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2 text-slate-400">
                      <button
                        onClick={() => openModal(eq)}
                        className="rounded-md p-2 hover:bg-slate-100 hover:text-violet-600 transition"
                        title="Sửa"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(eq)}
                        className="rounded-md p-2 hover:bg-slate-100 hover:text-rose-600 transition"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add / Edit Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-950">
                {editingEquipment ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {formError}
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Mã KKS *</label>
                <input
                  name="kksCode"
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition"
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 10LBA10AA001"
                  required
                  value={formData.kksCode}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tên thiết bị *</label>
                <input
                  name="equipmentName"
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition"
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Bơm cấp nước lò hơi"
                  required
                  value={formData.equipmentName}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Loại thiết bị *</label>
                  <input
                    name="equipmentType"
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition"
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Động cơ, Bơm, Van"
                    required
                    value={formData.equipmentType}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái *</label>
                  <select
                    name="status"
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 transition"
                    onChange={handleInputChange}
                    value={formData.status}
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Bảo dưỡng">Bảo dưỡng</option>
                    <option value="Sự cố">Sự cố</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Hệ thống thiết bị</label>
                <select
                  name="systemId"
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 transition"
                  onChange={handleInputChange}
                  value={formData.systemId}
                >
                  <option value="">-- Chọn hệ thống --</option>
                  {systems.map((sys) => (
                    <option key={sys.systemId} value={sys.systemId}>
                      {sys.systemName} ({sys.systemCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Vị trí lắp đặt</label>
                <input
                  name="location"
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition"
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Tầng 1 nhà tuabin"
                  value={formData.location}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="secondary"
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu lại'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
