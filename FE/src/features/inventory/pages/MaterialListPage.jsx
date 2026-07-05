import { Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'

import {
  selectMaterialError,
  selectMaterialItems,
  selectMaterialLoading,
  selectMaterialPage,
  selectMaterialTotalElements,
  selectMaterialTotalPages,
} from '../store/material.selectors.js'
import { fetchMaterials, deleteMaterial } from '../store/material.thunks.js'
import { clearMaterialError } from '../store/material.reducer.js'
import { MaterialFormModal } from './MaterialFormModal.jsx'
import { DeleteConfirmModal } from './DeleteConfirmModal.jsx'

const TABS = [
  { key: 'consumable', label: 'Vật tư tiêu hao' },
  { key: 'sparepart', label: 'Vật tư thay thế' },
]

export function MaterialListPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectMaterialItems)
  const loading = useSelector(selectMaterialLoading)
  const error = useSelector(selectMaterialError)
  const page = useSelector(selectMaterialPage)
  const totalPages = useSelector(selectMaterialTotalPages)
  const totalElements = useSelector(selectMaterialTotalElements)

  const [activeTab, setActiveTab] = useState('consumable')
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  // Modal states
  const [formModal, setFormModal] = useState({ open: false, item: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null })

  const loadData = useCallback(() => {
    dispatch(fetchMaterials({ tab: activeTab, keyword, page: currentPage, size: 10 }))
  }, [dispatch, activeTab, keyword, currentPage])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleTabChange(tab) {
    setActiveTab(tab)
    setKeyword('')
    setCurrentPage(0)
    dispatch(clearMaterialError())
  }

  function handleSearch(event) {
    setKeyword(event.target.value)
    setCurrentPage(0)
  }

  function handlePageChange(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  function openCreateModal() {
    setFormModal({ open: true, item: null })
  }

  function openEditModal(item) {
    setFormModal({ open: true, item })
  }

  function openDeleteModal(item) {
    setDeleteModal({ open: true, item })
  }

  function closeFormModal() {
    setFormModal({ open: false, item: null })
  }

  function closeDeleteModal() {
    setDeleteModal({ open: false, item: null })
  }

  function handleFormSuccess() {
    closeFormModal()
    loadData()
  }

  async function handleDeleteConfirm() {
    const item = deleteModal.item
    if (!item) return
    const id = activeTab === 'sparepart' ? item.sparePartId : item.consumableId
    await dispatch(deleteMaterial({ tab: activeTab, id })).unwrap()
    closeDeleteModal()
    loadData()
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-950">Danh mục vật tư</h1>
      </section>

      {/* Tabs */}
      <div className="mt-5 flex gap-2">
        {TABS.map((tab) => (
          <button
            className={[
              'rounded-full border px-5 py-2 text-sm font-semibold transition',
              activeTab === tab.key
                ? 'border-violet-600 bg-violet-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            ].join(' ')}
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Add button */}
      <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={handleSearch}
            placeholder="Tìm theo mã hoặc tên vật tư..."
            value={keyword}
          />
        </label>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={openCreateModal}
        >
          <Plus size={17} />
          Thêm vật tư
        </Button>
      </section>

      {/* Error */}
      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      {/* Table */}
      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {items.length} / {totalElements} vật tư
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Mã vật tư</th>
                <th className="px-5 py-3 font-semibold">Tên vật tư</th>
                <th className="px-5 py-3 font-semibold">Đơn vị</th>
                <th className="px-5 py-3 font-semibold">Mức tối thiểu</th>
                <th className="px-5 py-3 font-semibold">Ghi chú</th>
                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
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

              {!loading && !items.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                    Không có vật tư phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? items.map((item) => {
                    const id = activeTab === 'sparepart' ? item.sparePartId : item.consumableId
                    return (
                      <tr className="hover:bg-slate-50/80" key={id}>
                        <td className="px-5 py-4 font-semibold text-violet-600">
                          {item.code}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-slate-600">{item.unit}</td>
                        <td className="px-5 py-4 text-slate-600">{item.minQuantity}</td>
                        <td className="px-5 py-4 text-slate-600">
                          <span 
                            className="line-clamp-2 max-w-xs" 
                            title={item.note}
                          >
                            {item.note}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2 text-slate-400">
                            <button
                              className="rounded-md p-2 hover:bg-slate-100 hover:text-violet-600"
                              onClick={() => openEditModal(item)}
                              title="Sửa"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="rounded-md p-2 hover:bg-slate-100 hover:text-rose-600"
                              onClick={() => openDeleteModal(item)}
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-sm text-slate-500">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
                size="sm"
                variant="secondary"
              >
                Trước
              </Button>
              <Button
                disabled={page >= totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
                size="sm"
                variant="secondary"
              >
                Sau
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Modals */}
      {formModal.open ? (
        <MaterialFormModal
          item={formModal.item}
          onClose={closeFormModal}
          onSuccess={handleFormSuccess}
          tab={activeTab}
        />
      ) : null}

      {deleteModal.open ? (
        <DeleteConfirmModal
          itemName={deleteModal.item?.name || ''}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </div>
  )
}
