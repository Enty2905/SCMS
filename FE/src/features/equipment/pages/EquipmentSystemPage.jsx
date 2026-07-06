import { Edit3, Plus, Search, Trash2, X, Network } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/shared/components/ui/Button.jsx'
import {
  fetchSystems,
  createSystem,
  updateSystem,
  deleteSystem,
} from '../services/equipment.service.js'

export function EquipmentSystemPage() {
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search filter
  const [keyword, setKeyword] = useState('')

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSystem, setEditingSystem] = useState(null)
  const [formData, setFormData] = useState({
    systemName: '',
    systemCode: '',
    description: '',
    parentSystemId: '',
  })
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Load Initial Data
  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSystems()
      setSystems(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Không thể tải danh sách hệ thống. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtered systems
  const filteredSystems = useMemo(() => {
    return systems.filter((sys) => {
      const keywordLower = keyword.trim().toLowerCase()
      return (
        !keywordLower ||
        sys.systemCode?.toLowerCase().includes(keywordLower) ||
        sys.systemName?.toLowerCase().includes(keywordLower) ||
        sys.description?.toLowerCase().includes(keywordLower)
      )
    })
  }, [systems, keyword])

  // System Map for quick Parent Name lookup
  const systemMap = useMemo(() => {
    return new Map(systems.map((sys) => [sys.systemId, sys.systemName]))
  }, [systems])

  // Dropdown list for Parent System selection (exclude current system being edited to prevent loop)
  const availableParentSystems = useMemo(() => {
    if (!editingSystem) return systems
    return systems.filter((sys) => sys.systemId !== editingSystem.systemId)
  }, [systems, editingSystem])

  // Open Add/Edit Modal
  function openModal(sys = null) {
    setFormError(null)
    if (sys) {
      setEditingSystem(sys)
      setFormData({
        systemName: sys.systemName || '',
        systemCode: sys.systemCode || '',
        description: sys.description || '',
        parentSystemId: sys.parentSystemId || '',
      })
    } else {
      setEditingSystem(null)
      setFormData({
        systemName: '',
        systemCode: '',
        description: '',
        parentSystemId: '',
      })
    }
    setIsModalOpen(true)
  }

  // Handle Input Changes
  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle Form Submit
  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    if (!formData.systemName.trim()) {
      return setFormError('Tên hệ thống thiết bị không được để trống')
    }

    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        parentSystemId: formData.parentSystemId || null,
      }
      if (editingSystem) {
        await updateSystem(editingSystem.systemId, payload)
      } else {
        await createSystem(payload)
      }
      setIsModalOpen(false)
      loadData() // Refresh
    } catch (err) {
      console.error(err)
      setFormError(err.message || 'Lỗi lưu thông tin hệ thống.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Delete System
  async function handleDelete(sys) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hệ thống "${sys.systemName}" (${sys.systemCode})?`)) {
      return
    }

    try {
      await deleteSystem(sys.systemId)
      loadData() // Refresh
    } catch (err) {
      console.error(err)
      alert(err.message || 'Lỗi khi xóa hệ thống. Có thể hệ thống này đang chứa thiết bị hoặc có hệ thống con.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header section */}
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Hệ thống Thiết bị</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý sơ đồ phân cấp các hệ thống kỹ thuật trong nhà máy (lò hơi, tuabin, máy phát, xử lý nước...).
          </p>
        </div>
        <Button onClick={() => openModal(null)} className="bg-violet-600 hover:bg-violet-700 text-white font-medium">
          <Plus size={17} />
          Thêm hệ thống
        </Button>
      </section>

      {/* Search Bar */}
      <section className="mt-5 flex gap-3">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên hệ thống, mã hệ thống..."
            value={keyword}
          />
        </label>
      </section>

      {/* Systems List Content */}
      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {filteredSystems.length} / {systems.length} hệ thống
        </div>

        {error ? (
          <div className="m-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold w-32">Mã hệ thống</th>
                <th className="px-5 py-3.5 font-semibold">Tên hệ thống</th>
                <th className="px-5 py-3.5 font-semibold">Mô tả</th>
                <th className="px-5 py-3.5 font-semibold">Hệ thống cha</th>
                <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !filteredSystems.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                    Không tìm thấy hệ thống nào phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading && filteredSystems.map((sys) => (
                <tr className="hover:bg-slate-50/80 transition-colors" key={sys.systemId}>
                  <td className="px-5 py-4 font-mono font-bold text-violet-700 text-xs">
                    {sys.systemCode || <span className="text-slate-400 font-normal italic">N/A</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-lg bg-violet-50 text-violet-600">
                        <Network size={16} />
                      </div>
                      <div className="font-semibold text-slate-900">{sys.systemName}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-sm truncate" title={sys.description}>
                    {sys.description || <span className="text-slate-400 italic">Chưa có mô tả</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {sys.parentSystemId ? (
                      <span className="font-medium text-slate-700 bg-slate-100 rounded px-2 py-0.5 text-xs">
                        {systemMap.get(sys.parentSystemId) || 'Hệ thống cha'}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Không có (Hệ thống gốc)</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2 text-slate-400">
                      <button
                        onClick={() => openModal(sys)}
                        className="rounded-md p-2 hover:bg-slate-100 hover:text-violet-600 transition"
                        title="Sửa"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(sys)}
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

      {/* Add / Edit System Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-950">
                {editingSystem ? 'Cập nhật hệ thống' : 'Thêm hệ thống thiết bị mới'}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tên hệ thống *</label>
                <input
                  name="systemName"
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition"
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Hệ thống Lò hơi chính"
                  required
                  value={formData.systemName}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Mã hệ thống</label>
                <input
                  name="systemCode"
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition"
                  onChange={handleInputChange}
                  placeholder="Ví dụ: SYSTEM-LOHOI"
                  value={formData.systemCode}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Hệ thống cha (Cấp trên)</label>
                <select
                  name="parentSystemId"
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 transition"
                  onChange={handleInputChange}
                  value={formData.parentSystemId}
                >
                  <option value="">-- Là hệ thống gốc (Không có cha) --</option>
                  {availableParentSystems.map((sys) => (
                    <option key={sys.systemId} value={sys.systemId}>
                      {sys.systemName} {sys.systemCode ? `(${sys.systemCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả hệ thống</label>
                <textarea
                  name="description"
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition resize-none"
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả chi tiết chức năng, nhiệm vụ hệ thống..."
                  value={formData.description}
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
