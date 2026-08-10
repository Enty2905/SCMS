import { Edit3, Plus, Search, Trash2, Download } from 'lucide-react'
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
import { ErrorModal } from '@/shared/components/ui/ErrorModal.jsx'
import { ConsumableImportFormModal } from './ConsumableImportFormModal.jsx'
import { SparePartImportFormModal } from './SparePartImportFormModal.jsx'

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
  const [searchCode, setSearchCode] = useState('')
  const [searchName, setSearchName] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  // Modal states
  const [formModal, setFormModal] = useState({ open: false, item: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null })
  const [importModal, setImportModal] = useState({ open: false, item: null })
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState(null)

  const loadData = useCallback(() => {
    const params = { tab: activeTab, page: currentPage, size: 10 }
    if (searchCode) params.code = searchCode
    if (searchName) params.name = searchName
    dispatch(fetchMaterials(params))
  }, [dispatch, activeTab, searchCode, searchName, currentPage])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSearchCode('')
    setSearchName('')
    setCurrentPage(0)
    dispatch(clearMaterialError())
  }

  function handleSearchCode(event) {
    setSearchCode(event.target.value)
    setCurrentPage(0)
  }

  function handleSearchName(event) {
    setSearchName(event.target.value)
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

  function openImportModal(item) {
    setImportModal({ open: true, item })
  }

  function closeImportModal() {
    setImportModal({ open: false, item: null })
  }

  function handleImportSuccess() {
    closeImportModal()
    // Optional: add toast notification here
  }

  async function handleDeleteConfirm() {
    const item = deleteModal.item
    if (!item) return
    const id = activeTab === 'sparepart' ? item.sparePartId : item.consumableId
    await dispatch(deleteMaterial({ tab: activeTab, id })).unwrap()
    closeDeleteModal()
    setDeleteSuccessMsg('Xóa vật tư thành công!')
    setTimeout(() => setDeleteSuccessMsg(null), 3500)
    loadData()
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-950">Danh mục vật tư</h1>
      </section>

      {/* Toast thông báo xóa thành công */}
      {deleteSuccessMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          ✓ {deleteSuccessMsg}
        </div>
      )}

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
        <div className="flex flex-1 items-center gap-4">
          <label className="relative flex-[1]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={handleSearchCode}
              placeholder="Nhập mã vật tư..."
              value={searchCode}
            />
          </label>
          <label className="relative flex-[2]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={handleSearchName}
              placeholder="Nhập tên vật tư..."
              value={searchName}
            />
          </label>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={openCreateModal}
        >
          <Plus size={17} />
          Thêm vật tư
        </Button>
      </section>

      {/* Error Modal */}
      <ErrorModal
        isOpen={!!error}
        message={error}
        onClose={() => dispatch(clearMaterialError())}
      />

      {/* Table */}
      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {items.length} / {totalElements} vật tư
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/50 text-sm uppercase tracking-wide font-bold text-slate-700">
              <tr>
                <th className="px-5 py-3 w-16 text-center">STT</th>
                <th className="px-5 py-3">Mã vật tư</th>
                <th className="px-5 py-3">Tên vật tư</th>
                <th className="px-5 py-3">Đơn vị</th>
                <th className="px-5 py-3 text-right">Mức tối thiểu</th>
                <th className="px-5 py-3">Ghi chú</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={7}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !items.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={7}>
                    Không có vật tư phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? items.map((item, index) => {
                    const id = activeTab === 'sparepart' ? item.sparePartId : item.consumableId
                    return (
                      <tr className="hover:bg-slate-50/80" key={id}>
                        <td className="px-5 py-4 text-center text-slate-600 font-medium">
                          {page * 10 + index + 1}
                        </td>
                        <td className="px-5 py-4 font-semibold text-violet-600">
                          {item.code}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-slate-600">{item.unit}</td>
                        <td className="px-5 py-4 text-right text-slate-600">{item.minQuantity}</td>
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
                              className="rounded-md p-2 hover:bg-emerald-50 hover:text-emerald-600"
                              onClick={() => openImportModal(item)}
                              title="Nhập kho"
                            >
                              <Download size={16} />
                            </button>
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
        {totalPages > 1 ? (() => {
          let startPage = Math.max(0, page - 2)
          let endPage = Math.min(totalPages - 1, page + 2)

          if (endPage - startPage < 4) {
            if (startPage === 0) {
              endPage = Math.min(totalPages - 1, startPage + 4)
            } else if (endPage === totalPages - 1) {
              startPage = Math.max(0, endPage - 4)
            }
          }

          const pages = []
          for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
          }

          return (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <p className="text-sm text-slate-500">
                Hiển thị trang {page + 1} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  disabled={page === 0}
                  onClick={() => handlePageChange(0)}
                >
                  Trang đầu
                </button>
                
                {pages.map((p) => (
                  <button
                    key={p}
                    className={[
                      'rounded-md px-3 py-1.5 text-sm font-medium transition min-w-[36px]',
                      page === p
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                    onClick={() => handlePageChange(p)}
                  >
                    {p + 1}
                  </button>
                ))}

                <button
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(totalPages - 1)}
                >
                  Trang cuối
                </button>
              </div>
            </div>
          )
        })() : null}
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

      {importModal.open ? (
        activeTab === 'consumable' ? (
          <ConsumableImportFormModal
            onClose={closeImportModal}
            onSuccess={handleImportSuccess}
            initialItem={importModal.item}
          />
        ) : (
          <SparePartImportFormModal
            onClose={closeImportModal}
            onSuccess={handleImportSuccess}
            initialItem={importModal.item}
          />
        )
      ) : null}
    </div>
  )
}
