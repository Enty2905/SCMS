import { Edit3, Plus, Search, Trash2, X, ArrowLeft, CheckCircle2, XCircle, RotateCw, ChevronLeft, ChevronRight, Eye, Network, Printer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button.jsx'
import { ConfirmModal } from '@/shared/components/ui/ConfirmModal.jsx'
import {
  fetchEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  fetchSystems,
  uploadEquipmentImage,
  deleteEquipmentImage,
  fetchTechnicalParams,
  fetchUnits,
} from '../services/equipment.service.js'
import { apiClient } from '@/shared/api/httpClient.js'

export function EquipmentListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const systemFilter = searchParams.get('systemId') || 'all'

  const [equipments, setEquipments] = useState([])
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Confirm delete & Toast states
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  // Search & Filter state
  const [searchKksCode, setSearchKksCode] = useState('')
  const [searchEquipmentName, setSearchEquipmentName] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

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
    specs: [],
  })
  const [availableParams, setAvailableParams] = useState([])
  const [availableUnits, setAvailableUnits] = useState([])
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Image & Gallery states
  const [newImageFiles, setNewImageFiles] = useState([])
  const [modalImages, setModalImages] = useState([])
  const [galleryTarget, setGalleryTarget] = useState(null)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
  const [viewingEquipment, setViewingEquipment] = useState(null)
  const [kksMode, setKksMode] = useState('builder') // 'builder' or 'manual'
  const [kksParts, setKksParts] = useState({
    block: '10',
    system: 'LAB',
    subsystem: '10',
    type: 'AP',
    sequence: '001',
  })

  // Load Initial Data
  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [eqList, sysList, paramList, unitList] = await Promise.all([
        fetchEquipments(),
        fetchSystems(),
        fetchTechnicalParams(),
        fetchUnits(),
      ])
      setEquipments(eqList)
      setSystems(sysList)
      setAvailableParams(paramList)
      setAvailableUnits(unitList)
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
        const [eqList, sysList, paramList, unitList] = await Promise.all([
          fetchEquipments(),
          fetchSystems(),
          fetchTechnicalParams(),
          fetchUnits(),
        ])

        if (!ignore) {
          setEquipments(eqList)
          setSystems(sysList)
          setAvailableParams(paramList)
          setAvailableUnits(unitList)
        }
      } catch (err) {
        console.error(err)
        if (!ignore) {
          setError(err.message || 'Không thể tải dữ liệu thiết bị. Vui lòng thử lại.')
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

  // Set of allowed system IDs (including sub-systems recursively) for filtering
  const allowedSystemIds = useMemo(() => {
    if (systemFilter === 'all') return null

    const ids = [systemFilter]
    const queue = [systemFilter]
    while (queue.length > 0) {
      const currentId = queue.shift()
      const children = systems.filter((sys) => sys.parentSystemId === currentId)
      for (const child of children) {
        if (!ids.includes(child.systemId)) {
          ids.push(child.systemId)
          queue.push(child.systemId)
        }
      }
    }
    return new Set(ids)
  }, [systems, systemFilter])

  // Filtered equipments
  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      const kksLower = searchKksCode.trim().toLowerCase()
      const nameLower = searchEquipmentName.trim().toLowerCase()

      const matchesKks = !kksLower || eq.kksCode?.toLowerCase().includes(kksLower)
      const matchesName = !nameLower || eq.equipmentName?.toLowerCase().includes(nameLower)
      const matchesSystem =
        systemFilter === 'all' || (allowedSystemIds && allowedSystemIds.has(eq.systemId))

      const matchesType =
        typeFilter === 'all' || eq.equipmentType === typeFilter

      const matchesStatus =
        statusFilter === 'all' ||
        eq.status?.toLowerCase() === statusFilter.toLowerCase()

      return matchesKks && matchesName && matchesSystem && matchesType && matchesStatus
    })
  }, [equipments, searchKksCode, searchEquipmentName, systemFilter, typeFilter, statusFilter, allowedSystemIds])

  // Total pages calculation
  const totalPages = useMemo(() => {
    return Math.ceil(filteredEquipments.length / pageSize)
  }, [filteredEquipments, pageSize])

  // Get current page slice of equipments
  const paginatedEquipments = useMemo(() => {
    const activePage = Math.min(currentPage, totalPages || 1)
    const startIndex = (activePage - 1) * pageSize
    return filteredEquipments.slice(startIndex, startIndex + pageSize)
  }, [filteredEquipments, currentPage, pageSize, totalPages])

  // System name mapping
  const systemMap = useMemo(() => {
    return new Map(systems.map((sys) => [sys.systemId, sys.systemName]))
  }, [systems])

  // Open Add/Edit Modal
  function openModal(eq = null) {
    setError(null)
    setFormError(null)
    setNewImageFiles([])
    if (eq) {
      setEditingEquipment(eq)
      setModalImages(eq.images || [])
      setFormData({
        kksCode: eq.kksCode || '',
        equipmentName: eq.equipmentName || '',
        equipmentType: eq.equipmentType || '',
        status: eq.status || 'Hoạt động',
        location: eq.location || '',
        systemId: eq.systemId || '',
        specs: (eq.specs || []).map(spec => ({
          paramId: spec.paramId,
          paramValue: spec.paramValue,
          unitId: spec.unitId || '',
        })),
      })

      // Parse KKS Code for builder if standard
      const match = (eq.kksCode || '').match(/^(\d{2})([A-Z]{3})(\d{2})([A-Z]{2})(\d{3})$/i)
      if (match) {
        setKksMode('builder')
        setKksParts({
          block: match[1],
          system: match[2].toUpperCase(),
          subsystem: match[3],
          type: match[4].toUpperCase(),
          sequence: match[5],
        })
      } else {
        setKksMode('manual')
      }
    } else {
      setEditingEquipment(null)
      const randomSeq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
      setKksMode('builder')
      setKksParts({
        block: '10',
        system: 'LAB',
        subsystem: '10',
        type: 'AP',
        sequence: randomSeq,
      })
      setFormData({
        kksCode: `10LAB10AP${randomSeq}`,
        equipmentName: '',
        equipmentType: '',
        status: 'Hoạt động',
        location: '',
        systemId: systemFilter !== 'all' ? systemFilter : '',
        specs: [],
      })
    }
    setIsModalOpen(true)
  }

  // Handle individual KKS parts changes
  function handleKksPartChange(part, value) {
    setKksParts((prev) => {
      const updated = { ...prev, [part]: value };
      const newKks = `${updated.block}${updated.system}${updated.subsystem}${updated.type}${updated.sequence}`;
      setFormData((f) => ({ ...f, kksCode: newKks }));
      return updated;
    });
  }

  // Randomize sequence (part 5)
  function handleRandomizeSequence() {
    const randomSeq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    handleKksPartChange('sequence', randomSeq);
  }

  // Handle Form Input Changes
  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleDeleteImage(imgId) {
    try {
      await deleteEquipmentImage(imgId)
      setModalImages((prev) => prev.filter((img) => img.id !== imgId))
      setEquipments((prev) => prev.map((e) => {
        if (e.id === editingEquipment.id) {
          return { ...e, images: (e.images || []).filter((img) => img.id !== imgId) }
        }
        return e
      }))
    } catch (err) {
      console.error(err)
      setFormError(err.message || 'Xóa ảnh thất bại.')
    }
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
      let savedEq;
      if (editingEquipment) {
        savedEq = await updateEquipment(editingEquipment.id, formData)
      } else {
        savedEq = await createEquipment(formData)
      }

      // Upload newly selected images if any
      if (newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          await uploadEquipmentImage(savedEq.id, file)
        }
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

  // Handle Delete Equipment (open custom modal)
  function handleDelete(eq) {
    setDeleteTarget(eq)
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteEquipment(deleteTarget.id)
      setDeleteTarget(null)
      showToast('Đã ẩn thiết bị thành công (Xóa mềm).', 'success')
      loadData() // Refresh list
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Lỗi khi xóa thiết bị.', 'error')
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

  const handlePrint = (elementId) => {
    const originalTitle = document.title
    document.title = `Bao_cao_thiet_bi_${new Date().toISOString().slice(0, 10)}`

    const style = document.createElement('style')
    style.id = 'print-temporary-style'
    style.innerHTML =
      '@media print {\n' +
      '  body * {\n' +
      '    visibility: hidden !important;\n' +
      '  }\n' +
      '  #' + elementId + ', #' + elementId + ' * {\n' +
      '    visibility: visible !important;\n' +
      '  }\n' +
      '  #' + elementId + ' {\n' +
      '    position: absolute !important;\n' +
      '    left: 0 !important;\n' +
      '    top: 0 !important;\n' +
      '    width: 100% !important;\n' +
      '    background: white !important;\n' +
      '    color: black !important;\n' +
      '    box-shadow: none !important;\n' +
      '    border: none !important;\n' +
      '  }\n' +
      '  .no-print, .no-print * {\n' +
      '    display: none !important;\n' +
      '  }\n' +
      '}'
    document.head.appendChild(style)

    window.print()

    document.title = originalTitle
    const tempStyle = document.getElementById('print-temporary-style')
    if (tempStyle) {
      tempStyle.remove()
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header section */}
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate('/dashboard/equipment-systems')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Quay lại Hệ thống thiết bị
            </button>
          </div>
          <h1 className="text-xl font-bold text-slate-950">
            Quản lý Thiết bị
            {systemFilter !== 'all' && (
              <span className="text-violet-600 font-medium text-lg ml-2">
                — Hệ thống: {systemMap.get(systemFilter) || 'Đang tải...'}
              </span>
            )}
          </h1>
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
      {/* Search Inputs & Dropdowns Section */}
      <section className="mt-5 flex flex-col gap-3 xl:flex-row">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => {
                setSearchKksCode(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo mã KKS..."
              value={searchKksCode}
            />
          </label>

          <label className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => {
                setSearchEquipmentName(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo tên thiết bị..."
              value={searchEquipmentName}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            className="h-11 min-w-48 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-700 font-medium"
            onChange={(event) => {
              const val = event.target.value
              setSystemFilter(val)
              setSearchParams((prev) => {
                if (val === 'all') {
                  prev.delete('systemId')
                } else {
                  prev.set('systemId', val)
                }
                return prev
              })
            }}
            value={systemFilter}
          >
            <option value="all">Tất cả hệ thống</option>
            {systems.map((sys) => (
              <option key={sys.systemId} value={sys.systemId}>
                {sys.systemName}
              </option>
            ))}
          </select>

          <select
            className="h-11 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 cursor-pointer"
            onChange={(event) => {
              setTypeFilter(event.target.value)
              setCurrentPage(1)
            }}
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
            className="h-11 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 cursor-pointer"
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setCurrentPage(1)
            }}
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

              {!loading && paginatedEquipments.map((eq) => (
                <tr className="hover:bg-slate-50/80 transition-colors" key={eq.id}>
                  <td className="px-5 py-4 font-mono font-bold text-violet-700 text-xs">
                    {eq.kksCode}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {eq.images && eq.images.length > 0 ? (
                        <img
                          src={apiClient.url(eq.images[0].imageUrl)}
                          alt={eq.equipmentName}
                          className="size-10 rounded-md object-cover border border-slate-200 cursor-pointer hover:opacity-85 hover:scale-105 transition shrink-0"
                          onClick={() => {
                            setGalleryTarget(eq)
                            setActiveGalleryIndex(0)
                          }}
                          title="Click để xem tất cả ảnh"
                        />
                      ) : (
                        <div className="size-10 rounded-md bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-[10px] font-semibold shrink-0 select-none">
                          No Img
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{eq.equipmentName}</div>
                        {eq.images && eq.images.length > 0 && (
                          <div className="text-[10px] text-violet-600 font-bold mt-0.5">
                            {eq.images.length} ảnh
                          </div>
                        )}
                      </div>
                    </div>
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
                        onClick={() => setViewingEquipment(eq)}
                        className="rounded-md p-2 hover:bg-slate-100 hover:text-violet-600 transition"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
            <div className="text-xs text-slate-500 font-medium">
              Hiển thị từ <span className="font-semibold text-slate-800">{Math.min((currentPage - 1) * pageSize + 1, filteredEquipments.length)}</span> đến{" "}
              <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, filteredEquipments.length)}</span> trong tổng số{" "}
              <span className="font-semibold text-slate-800">{filteredEquipments.length}</span> thiết bị
            </div>
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition cursor-pointer"
              >
                Trang đầu
              </button>

              {/* Dynamic page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages
                })
                .reduce((acc, page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    acc.push('ellipsis-' + page)
                  }
                  acc.push(page)
                  return acc
                }, [])
                .map((page) => {
                  if (typeof page === 'string' && page.startsWith('ellipsis')) {
                    return <span key={page} className="px-1 text-slate-400 text-xs font-semibold">...</span>
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${currentPage === page
                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 border-none'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-955'
                        }`}
                    >
                      {page}
                    </button>
                  )
                })}

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition cursor-pointer"
              >
                Trang cuối
              </button>
            </div>
          </div>
        )}
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
                {kksMode === 'builder' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Dựng mã KKS *</label>
                      <button
                        type="button"
                        onClick={() => setKksMode('manual')}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline transition cursor-pointer"
                      >
                        Nhập tự do
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {/* 1. Tổ máy */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tổ máy</label>
                        <input
                          type="text"
                          maxLength={2}
                          list="kks-block-options"
                          value={kksParts.block}
                          onChange={(e) => handleKksPartChange('block', e.target.value)}
                          className="h-9 w-full text-xs font-mono font-bold rounded-md border border-slate-200 bg-white px-1.5 outline-none focus:border-violet-500 transition text-center"
                          placeholder="10"
                        />
                        <datalist id="kks-block-options">
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="30">30</option>
                        </datalist>
                      </div>

                      {/* 2. Hệ thống */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hệ thống</label>
                        <input
                          type="text"
                          maxLength={3}
                          list="kks-system-options"
                          value={kksParts.system}
                          onChange={(e) => handleKksPartChange('system', e.target.value.toUpperCase())}
                          className="h-9 w-full text-xs font-mono font-bold rounded-md border border-slate-200 bg-white px-1.5 outline-none focus:border-violet-500 transition text-center uppercase"
                          placeholder="LAB"
                        />
                        <datalist id="kks-system-options">
                          <option value="LAB">LAB (Nước cấp)</option>
                          <option value="LBA">LBA (Hơi nước)</option>
                          <option value="FAD">FAD (Lò hơi)</option>
                          <option value="MAX">MAX (Tuabin)</option>
                          <option value="MGT">MGT (Máy phát)</option>
                          <option value="GCA">GCA (Nước ngưng)</option>
                          <option value="HAD">HAD (Nước thô)</option>
                          <option value="LCA">LCA (Đo lường)</option>
                        </datalist>
                      </div>

                      {/* 3. Phân hệ */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phân hệ</label>
                        <input
                          type="text"
                          maxLength={2}
                          list="kks-subsystem-options"
                          value={kksParts.subsystem}
                          onChange={(e) => handleKksPartChange('subsystem', e.target.value)}
                          className="h-9 w-full text-xs font-mono font-bold rounded-md border border-slate-200 bg-white px-1.5 outline-none focus:border-violet-500 transition text-center"
                          placeholder="10"
                        />
                        <datalist id="kks-subsystem-options">
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="30">30</option>
                        </datalist>
                      </div>

                      {/* 4. Loại thiết bị */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mã loại</label>
                        <input
                          type="text"
                          maxLength={2}
                          list="kks-type-options"
                          value={kksParts.type}
                          onChange={(e) => handleKksPartChange('type', e.target.value.toUpperCase())}
                          className="h-9 w-full text-xs font-mono font-bold rounded-md border border-slate-200 bg-white px-1.5 outline-none focus:border-violet-500 transition text-center uppercase"
                          placeholder="AP"
                        />
                        <datalist id="kks-type-options">
                          <option value="AP">AP (Bơm)</option>
                          <option value="AA">AA (Van)</option>
                          <option value="AN">AN (Quạt)</option>
                          <option value="ET">ET (Động cơ)</option>
                          <option value="CP">CP (Tủ điều khiển)</option>
                          <option value="AC">AC (Máy nén)</option>
                          <option value="GS">GS (Máy phát)</option>
                          <option value="EY">EY (Biến áp)</option>
                          <option value="CS">CS (Cảm biến)</option>
                          <option value="CT">CT (Đầu truyền)</option>
                          <option value="AT">AT (Tuabin)</option>
                        </datalist>
                      </div>

                      {/* 5. Số thứ tự (Tự động / Random) */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số TT *</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            maxLength={3}
                            value={kksParts.sequence}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              handleKksPartChange('sequence', val.padStart(3, '0').slice(-3));
                            }}
                            className="h-9 w-full text-xs font-mono font-bold rounded-md border border-slate-200 bg-white pl-2 pr-6 outline-none focus:border-violet-500 transition text-center"
                          />
                          <button
                            type="button"
                            onClick={handleRandomizeSequence}
                            className="absolute right-1.5 text-slate-400 hover:text-violet-600 transition cursor-pointer active:scale-90"
                            title="Ngẫu nhiên số thứ tự"
                          >
                            <RotateCw size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-violet-50/50 px-3 py-1.5 rounded-lg border border-violet-100 text-xs font-semibold text-violet-800">
                      <span>Mã KKS hoàn chỉnh:</span>
                      <span className="font-mono font-bold tracking-wide text-sm text-violet-700 bg-white border border-violet-200 px-2 py-0.5 rounded shadow-sm">
                        {formData.kksCode}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Mã KKS *</label>
                      <button
                        type="button"
                        onClick={() => setKksMode('builder')}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline transition cursor-pointer"
                      >
                        Dựng mã chuẩn KKS
                      </button>
                    </div>
                    <input
                      name="kksCode"
                      className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition"
                      onChange={handleInputChange}
                      placeholder="Ví dụ: 10LBA10AA001"
                      required
                      value={formData.kksCode}
                    />
                  </div>
                )}
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
                {editingEquipment ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Hệ thống thiết bị</label>
                    {systemFilter !== 'all' ? (
                      <div className="mt-1 rounded-md bg-violet-50/50 p-3 border border-violet-100/50 text-xs text-slate-600 flex items-center justify-between">
                        <span>Tự động thêm vào hệ thống:</span>
                        <span className="font-semibold text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full">
                          {systemMap.get(systemFilter) || 'Hệ thống hiện tại'}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1 rounded-md bg-amber-50/60 p-3 border border-amber-100/60 text-xs text-amber-700">
                        Thiết bị sẽ được tạo mà không thuộc hệ thống nào. (Chọn một hệ thống cụ thể ở danh sách ngoài để tự động gán).
                      </div>
                    )}
                  </>
                )}
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

              {/* Dynamic Specs Section */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Thông số vận hành chi tiết</label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        specs: [...(prev.specs || []), { paramId: availableParams[0]?.paramId || '', paramValue: '', unitId: '' }]
                      }))
                    }}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1 transition cursor-pointer"
                  >
                    + Thêm thông số
                  </button>
                </div>

                {(formData.specs || []).length > 0 ? (
                  <div className="space-y-2">
                    {formData.specs.map((spec, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select
                          value={spec.paramId}
                          onChange={(e) => {
                            const newSpecs = [...formData.specs]
                            newSpecs[index].paramId = e.target.value
                            setFormData((prev) => ({ ...prev, specs: newSpecs }))
                          }}
                          className="h-10 flex-1 min-w-[120px] rounded-md border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-violet-500 transition"
                        >
                          <option value="">-- Tham số --</option>
                          {availableParams.map((p) => (
                            <option key={p.paramId} value={p.paramId}>
                              {p.paramName}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={spec.paramValue}
                          onChange={(e) => {
                            const newSpecs = [...formData.specs]
                            newSpecs[index].paramValue = e.target.value
                            setFormData((prev) => ({ ...prev, specs: newSpecs }))
                          }}
                          placeholder="Giá trị"
                          className="h-10 w-24 rounded-md border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-violet-500 transition"
                        />

                        <select
                          value={spec.unitId}
                          onChange={(e) => {
                            const newSpecs = [...formData.specs]
                            newSpecs[index].unitId = e.target.value
                            setFormData((prev) => ({ ...prev, specs: newSpecs }))
                          }}
                          className="h-10 w-24 rounded-md border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-violet-500 transition"
                        >
                          <option value="">-- Đơn vị --</option>
                          {availableUnits.map((u) => (
                            <option key={u.unitId} value={u.unitId}>
                              {u.symbol}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const newSpecs = formData.specs.filter((_, i) => i !== index)
                            setFormData((prev) => ({ ...prev, specs: newSpecs }))
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Xóa thông số này"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    Chưa có thông số chi tiết nào. Bấm "+ Thêm thông số" để thiết lập.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Hình ảnh thiết bị</label>

                {/* Existing images list if editing */}
                {editingEquipment && modalImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {modalImages.map((img) => (
                      <div key={img.id} className="relative group size-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                        <img
                          src={apiClient.url(img.imageUrl)}
                          alt="Equipment"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-pointer font-bold text-xs"
                          title="Xóa ảnh này"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview of newly selected files */}
                {newImageFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {newImageFiles.map((file, index) => {
                      const previewUrl = URL.createObjectURL(file);
                      return (
                        <div key={index} className="relative group size-20 rounded-lg overflow-hidden border border-violet-200 bg-violet-50 shrink-0">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute top-1 right-1 size-5 bg-slate-900/70 hover:bg-slate-950 text-white rounded-full flex items-center justify-center transition cursor-pointer text-[10px]"
                            title="Hủy chọn"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload Trigger Area */}
                <div className="relative border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-lg p-4 transition text-center bg-slate-50/50 hover:bg-slate-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        const filesArray = Array.from(e.target.files);
                        setNewImageFiles((prev) => [...prev, ...filesArray]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <Plus size={20} className="text-slate-400" />
                    <span className="font-semibold text-violet-600 hover:text-violet-700">Chọn ảnh tải lên</span>
                    <span>(JPG, PNG, WEBP, GIF tối đa 20MB)</span>
                  </div>
                </div>
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

      {/* Detail Modal */}
      {viewingEquipment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingEquipment(null)} />
          <div id="equipment-detail-print" className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <Eye className="text-violet-600" size={20} />
                <span>Chi tiết thiết bị</span>
              </h2>
              <button
                onClick={() => setViewingEquipment(null)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition no-print"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200/60 rounded-lg p-4">
                {viewingEquipment.images && viewingEquipment.images.length > 0 ? (
                  <div className="w-full space-y-3">
                    <img
                      src={apiClient.url(viewingEquipment.images[0].imageUrl)}
                      alt={viewingEquipment.equipmentName}
                      className="w-full h-48 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 hover:scale-[1.02] transition"
                      onClick={() => {
                        setGalleryTarget(viewingEquipment)
                        setActiveGalleryIndex(0)
                      }}
                      title="Click để xem toàn bộ ảnh"
                    />
                    {viewingEquipment.images.length > 1 && (
                      <div className="flex justify-center gap-1.5 overflow-x-auto py-1">
                        {viewingEquipment.images.map((img, index) => (
                          <img
                            key={img.id}
                            src={apiClient.url(img.imageUrl)}
                            alt="Thumbnail"
                            className="size-10 rounded object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
                            onClick={() => {
                              setGalleryTarget(viewingEquipment)
                              setActiveGalleryIndex(index)
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-center text-[10px] text-slate-400 italic">Click vào hình để xem thư viện ảnh ({viewingEquipment.images.length} ảnh)</p>
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-lg bg-slate-100 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200">
                    <span className="text-xs font-semibold">Chưa có hình ảnh thiết bị</span>
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã định danh KKS</div>
                  <div className="mt-1 font-mono font-bold text-sm text-violet-700 bg-violet-50/50 border border-violet-100 px-2.5 py-1.5 rounded-lg inline-block tracking-wide">
                    {viewingEquipment.kksCode}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên thiết bị</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{viewingEquipment.equipmentName}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phân loại</div>
                    <div className="mt-1 text-sm font-medium text-slate-700">{viewingEquipment.equipmentType}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</div>
                    <div className="mt-1">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold border ${getStatusBadgeStyle(viewingEquipment.status)}`}>
                        {viewingEquipment.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hệ thống quản lý</div>
                  <div className="mt-1 text-sm text-slate-700 font-medium">
                    {systemMap.get(viewingEquipment.systemId) || (
                      <span className="text-slate-400 italic">Chưa liên kết hệ thống</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vị trí lắp đặt</div>
                  <div className="mt-1 text-sm text-slate-700 font-medium">
                    {viewingEquipment.location || (
                      <span className="text-slate-400 italic">Chưa xác định vị trí</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Specs Section */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <Network className="text-violet-600 animate-pulse" size={16} />
                <span>Thông số kỹ thuật vận hành chi tiết</span>
              </h3>
              {viewingEquipment.specs && viewingEquipment.specs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/50">
                  {viewingEquipment.specs.map((spec) => (
                    <div key={spec.specId} className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 line-clamp-1">{spec.paramName}</div>
                      <div className="text-xs font-bold text-slate-800 font-mono">
                        {spec.paramValue} {spec.unitSymbol || ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 text-center">
                  Thiết bị này chưa được cấu hình thông số kỹ thuật vận hành.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-5 no-print">
              <Button
                onClick={() => handlePrint('equipment-detail-print')}
                variant="secondary"
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5"
              >
                <Printer size={16} />
                In chi tiết PDF
              </Button>
              <Button
                onClick={() => setViewingEquipment(null)}
                className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Custom Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa thiết bị"
        message={`Bạn có chắc chắn muốn xóa thiết bị "${deleteTarget?.equipmentName}" (${deleteTarget?.kksCode})?\n\n(Lưu ý: Thiết bị sẽ bị ẩn khỏi danh sách, nhưng toàn bộ lịch sử sửa chữa và hồ sơ liên quan vẫn được lưu giữ an toàn trên hệ thống).`}
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

      {/* Lightbox / Image Gallery Modal */}
      {galleryTarget && galleryTarget.images && galleryTarget.images.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
          <button
            onClick={() => setGalleryTarget(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition cursor-pointer"
            title="Đóng"
          >
            <X size={24} />
          </button>

          <div className="relative w-full max-w-4xl max-h-[80vh] flex items-center justify-center">
            {galleryTarget.images.length > 1 && (
              <button
                onClick={() => {
                  setActiveGalleryIndex((prev) => (prev === 0 ? galleryTarget.images.length - 1 : prev - 1));
                }}
                className="absolute left-4 z-10 text-white/70 hover:text-white bg-black/45 hover:bg-black/65 rounded-full p-3 transition cursor-pointer select-none active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <img
              src={apiClient.url(galleryTarget.images[activeGalleryIndex].imageUrl)}
              alt={galleryTarget.equipmentName}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/10"
            />

            {galleryTarget.images.length > 1 && (
              <button
                onClick={() => {
                  setActiveGalleryIndex((prev) => (prev === galleryTarget.images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 z-10 text-white/70 hover:text-white bg-black/45 hover:bg-black/65 rounded-full p-3 transition cursor-pointer select-none active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          <div className="mt-4 text-center text-white space-y-1">
            <h3 className="font-semibold text-lg">{galleryTarget.equipmentName}</h3>
            <p className="text-xs text-white/60 font-mono">{galleryTarget.kksCode}</p>
            {galleryTarget.images[activeGalleryIndex].caption && (
              <p className="text-sm text-white/80 italic">"{galleryTarget.images[activeGalleryIndex].caption}"</p>
            )}
            {galleryTarget.images.length > 1 && (
              <div className="inline-flex bg-white/10 rounded-full px-3 py-1 text-xs text-white/70 font-semibold mt-2">
                Ảnh {activeGalleryIndex + 1} / {galleryTarget.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


