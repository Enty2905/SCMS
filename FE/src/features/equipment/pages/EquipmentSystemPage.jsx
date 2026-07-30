import { Edit3, Plus, Search, Trash2, X, Network, Eye, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button.jsx'
import { ConfirmModal } from '@/shared/components/ui/ConfirmModal.jsx'
import {
  fetchSystems,
  createSystem,
  updateSystem,
  deleteSystem,
} from '../services/equipment.service.js'

export function EquipmentSystemPage() {
  const navigate = useNavigate()
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Confirm delete & Toast states
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  // State to track expanded system IDs in tree-table
  const [expandedSystemIds, setExpandedSystemIds] = useState(new Set())

  const toggleExpand = (systemId) => {
    setExpandedSystemIds((prev) => {
      const next = new Set(prev)
      if (next.has(systemId)) {
        next.delete(systemId)
      } else {
        next.add(systemId)
      }
      return next
    })
  }

  // Search filters
  const [searchSystemCode, setSearchSystemCode] = useState('')
  const [searchSystemName, setSearchSystemName] = useState('')

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
    let ignore = false

    async function loadInitialData() {
      try {
        const data = await fetchSystems()

        if (!ignore) {
          setSystems(data)
        }
      } catch (err) {
        console.error(err)
        if (!ignore) {
          setError(err.message || 'KhĂ´ng thá»ƒ táº£i danh sĂ¡ch há»‡ thá»‘ng. Vui lĂ²ng thá»­ láº¡i.')
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

  // Filtered systems
  const filteredSystems = useMemo(() => {
    return systems.filter((sys) => {
      const codeLower = searchSystemCode.trim().toLowerCase()
      const nameLower = searchSystemName.trim().toLowerCase()

      const matchesCode = !codeLower || sys.systemCode?.toLowerCase().includes(codeLower)
      const matchesName = !nameLower || sys.systemName?.toLowerCase().includes(nameLower)

      return matchesCode && matchesName
    })
  }, [systems, searchSystemCode, searchSystemName])

  // System Map for quick Parent Name lookup
  const systemMap = useMemo(() => {
    return new Map(systems.map((sys) => [sys.systemId, sys.systemName]))
  }, [systems])

  // Calculate displayed systems for the Tree-Table hierarchy
  const displaySystems = useMemo(() => {
    // If searching, show a flat list of matching systems
    if (searchSystemCode.trim() !== '' || searchSystemName.trim() !== '') {
      return filteredSystems.map((sys) => ({
        ...sys,
        level: 0,
        hasChildren: false,
      }))
    }

    // Helper to recursively build tree representation
    const buildTree = (parentId = null, level = 0, result = []) => {
      const children = systems.filter((sys) => {
        if (!parentId) {
          return !sys.parentSystemId
        }
        return sys.parentSystemId === parentId
      })

      for (const child of children) {
        const hasChildren = systems.some((s) => s.parentSystemId === child.systemId)
        result.push({
          ...child,
          level,
          hasChildren,
        })

        if (hasChildren && expandedSystemIds.has(child.systemId)) {
          buildTree(child.systemId, level + 1, result)
        }
      }
      return result
    }

    return buildTree(null, 0, [])
  }, [systems, filteredSystems, searchSystemCode, searchSystemName, expandedSystemIds])

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

  // Handle Delete System (open custom modal)
  function handleDelete(sys) {
    setDeleteTarget(sys)
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteSystem(deleteTarget.systemId)
      setDeleteTarget(null)
      showToast('Đã ẩn hệ thống thiết bị thành công (Xóa mềm).', 'success')
      loadData() // Refresh list
    } catch (err) {
      console.error(err)
      showToast(
        err.message || 'Lỗi khi xóa hệ thống. Có thể hệ thống này đang chứa thiết bị hoặc có hệ thống con.',
        'error'
      )
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

      {/* Search Inputs Section */}
      <section className="mt-5 flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setSearchSystemCode(event.target.value)}
            placeholder="Tìm theo mã hệ thống..."
            value={searchSystemCode}
          />
        </label>
        
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setSearchSystemName(event.target.value)}
            placeholder="Tìm theo tên hệ thống..."
            value={searchSystemName}
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
                <th className="px-5 py-3.5 font-semibold w-16">STT</th>
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
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !displaySystems.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                    Không tìm thấy hệ thống nào phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading && displaySystems.map((sys, index) => (
                <tr 
                  className="hover:bg-slate-50/85 transition-colors cursor-pointer group" 
                  key={sys.systemId}
                  onClick={() => navigate(`/dashboard/equipment?systemId=${sys.systemId}`)}
                >
                  <td className="px-5 py-4 font-semibold text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-violet-700 text-xs">
                    {sys.systemCode || <span className="text-slate-400 font-normal italic">N/A</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div 
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${sys.level * 24}px` }}
                    >
                      {/* Expand/Collapse arrow or spacer */}
                      {sys.hasChildren ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(sys.systemId)
                          }}
                          className="mr-0.5 rounded p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                        >
                          {expandedSystemIds.has(sys.systemId) ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </button>
                      ) : (
                        <div className="w-6 shrink-0" />
                      )}

                      <div className="grid size-8 place-items-center rounded-lg bg-violet-50 text-violet-600 shrink-0">
                        <Network size={16} />
                      </div>
                      <div className="font-semibold text-slate-900 group-hover:text-violet-700 transition-colors">{sys.systemName}</div>
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
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/dashboard/equipment?systemId=${sys.systemId}`)
                        }}
                        className="rounded-md p-2 hover:bg-slate-100 hover:text-violet-600 transition"
                        title="Xem chi tiết thiết bị"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal(sys)
                        }}
                        className="rounded-md p-2 hover:bg-slate-100 hover:text-violet-600 transition"
                        title="Sửa"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(sys)
                        }}
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

      {/* Custom Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa hệ thống"
        message={`Bạn có chắc chắn muốn xóa hệ thống "${deleteTarget?.systemName}" (${deleteTarget?.systemCode})?\n\n(Lưu ý: Hệ thống sẽ bị ẩn khỏi danh sách, nhưng các thiết bị và dữ liệu con trực thuộc vẫn được lưu giữ an toàn).`}
        confirmText="Xác nhận xóa"
        type="danger"
      />

      {/* Success/Error Toast notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3.5 rounded-xl bg-white/95 backdrop-blur-md pl-4 pr-5 py-3 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-200/50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`grid size-8 place-items-center rounded-lg shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{toast.type === 'success' ? 'Thành công' : 'Lỗi xảy ra'}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-600">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
