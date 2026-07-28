import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  X,
  Calendar,
  MapPin,
  Users,
  Info,
  Settings,
  Search,
  Loader2,
  AlertTriangle,
  Check,
  UserPlus
} from 'lucide-react'

import { Button } from '@/shared/components/ui/Button.jsx'
import { getWorkOrderService, updateWorkOrderMembersService } from '../services/maintenance.service.js'
import { fetchHrDirectoryData } from '@/features/hr/store/hr-directory.thunks.js'
import { selectHrEmployees } from '@/features/hr/store/hr-directory.selectors.js'
import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { ROLES, hasAnyRole } from '@/features/auth/utils/roles.js'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function WorkOrderDetailModal({ workOrder, orderId, onClose, onSuccess }) {
  const dispatch = useDispatch()
  const resolvedOrderId = orderId || workOrder?.orderId

  const [wo, setWo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  // Edit members state
  const [isEditingMembers, setIsEditingMembers] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState([])
  const [memberSearchQuery, setMemberSearchQuery] = useState('')

  // Redux data
  const employees = useSelector(selectHrEmployees)
  const currentUser = useSelector(selectCurrentUser)

  const canUpdateMembers = hasAnyRole(currentUser, [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER]) && wo?.status !== 'locked'

  // Fetch work order details on mount or ID change
  useEffect(() => {
    if (resolvedOrderId) {
      loadWorkOrderDetails(resolvedOrderId)
    } else if (workOrder) {
      setWo(workOrder)
      setLoading(false)
    }
  }, [resolvedOrderId, workOrder])

  // Fetch HR employees directory when entering edit mode or component mount
  useEffect(() => {
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  async function loadWorkOrderDetails(id) {
    try {
      setLoading(true)
      setError('')
      const data = await getWorkOrderService(id)
      setWo(data)
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết phiếu công tác')
    } finally {
      setLoading(false)
    }
  }

  function handleStartEdit() {
    if (!wo) return
    const currentMemberIds = wo.members ? wo.members.map(m => m.employeeId).filter(Boolean) : []
    setSelectedMemberIds(currentMemberIds)
    setMemberSearchQuery('')
    setError('')
    setIsEditingMembers(true)
  }

  function toggleMember(empId) {
    setSelectedMemberIds(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    )
  }

  async function handleSaveMembers() {
    if (!wo) return
    try {
      setActionLoading(true)
      setError('')
      const data = await updateWorkOrderMembersService(wo.orderId, selectedMemberIds)
      setWo(data)
      setIsEditingMembers(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err.message || 'Cập nhật nhân viên tham gia thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  // Filter candidates that are NOT part of leadership (workLeader, directCommander, safetySupervisor)
  const memberCandidates = useMemo(() => {
    if (!wo) return []
    const leaderIds = new Set([
      wo.workLeader?.employeeId,
      wo.directCommander?.employeeId,
      wo.safetySupervisor?.employeeId
    ].filter(Boolean))

    return employees.filter(e => !leaderIds.has(e.employeeId))
  }, [employees, wo])

  // Filter candidates by keyword
  const filteredCandidates = useMemo(() => {
    const q = memberSearchQuery.trim().toLowerCase()
    if (!q) return memberCandidates
    return memberCandidates.filter(e =>
      e.employeeName?.toLowerCase().includes(q) ||
      e.positionName?.toLowerCase().includes(q)
    )
  }, [memberCandidates, memberSearchQuery])

  if (!resolvedOrderId && !workOrder) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Chi tiết Phiếu công tác</h3>
            {wo && (
              <p className="text-sm text-slate-500">
                Mã số: <strong className="text-violet-700">{wo.orderNumber}</strong>
              </p>
            )}
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin mb-3 text-violet-600" size={32} />
              <p className="text-sm font-medium">Đang tải chi tiết phiếu công tác...</p>
            </div>
          ) : !wo ? (
            <div className="flex flex-col items-center justify-center py-20 text-rose-500">
              <AlertTriangle className="mb-3" size={32} />
              <p className="text-sm font-semibold">{error || 'Không tìm thấy dữ liệu phiếu công tác.'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Thông tin chung */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                    <Info size={16} className="text-violet-500" />
                    Thông tin chung
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Trạng thái:</span>
                      <span className="col-span-2 font-semibold capitalize text-slate-700">
                        {wo.status === 'open' ? 'Đang mở' :
                         wo.status === 'paused' ? 'Đang đóng' :
                         wo.status === 'draft' ? 'Mới tạo' : 'Hoàn thành'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Ngày tạo:</span>
                      <span className="col-span-2 text-slate-700">{formatDate(wo.createdAt)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Người tạo:</span>
                      <span className="col-span-2 text-slate-700">{wo.createdByName || wo.createdByUsername || '—'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Nội dung:</span>
                      <span className="col-span-2 text-slate-700 whitespace-pre-line">{wo.content || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin Thiết bị */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                    <Settings size={16} className="text-violet-500" />
                    Thiết bị cần bảo dưỡng
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Mã KKS:</span>
                      <span className="col-span-2 font-semibold text-slate-700">{wo.equipmentKksCode || '—'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Tên thiết bị:</span>
                      <span className="col-span-2 text-slate-700">{wo.equipmentName || '—'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Vị trí:</span>
                      <span className="col-span-2 text-slate-700 flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400" />
                        {wo.equipmentLocation || '—'}
                      </span>
                    </div>
                    {wo.requestDescription && (
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-50">
                        <span className="text-slate-500 font-medium">Yêu cầu gốc:</span>
                        <span className="col-span-2 text-slate-700 line-clamp-2">{wo.requestDescription}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thời gian */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                    <Calendar size={16} className="text-violet-500" />
                    Thời gian thực hiện
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Bắt đầu (DK):</span>
                      <span className="col-span-2 text-slate-700">{formatDate(wo.startDate)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Kết thúc (DK):</span>
                      <span className="col-span-2 text-slate-700">{formatDate(wo.endDate)}</span>
                    </div>
                    {wo.extendedTo && (
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 font-medium text-rose-600">Gia hạn đến:</span>
                        <span className="col-span-2 text-rose-600 font-medium">{formatDate(wo.extendedTo)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nhân sự phụ trách */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                    <Users size={16} className="text-violet-500" />
                    Nhân sự phụ trách
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Lãnh đạo thi công:</span>
                      <span className="col-span-2 text-slate-700 font-semibold">{wo.workLeader?.name || '—'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Chỉ huy TT:</span>
                      <span className="col-span-2 text-slate-700">{wo.directCommander?.name || '—'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">Giám sát AT:</span>
                      <span className="col-span-2 text-slate-700">{wo.safetySupervisor?.name || '—'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Thành viên tham gia thi công */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Users size={16} className="text-violet-500" />
                    Thành viên thi công {wo.members && wo.members.length > 0 ? `(${wo.members.length} người)` : ''}
                  </h4>
                  {canUpdateMembers && !isEditingMembers && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 text-xs border-violet-200 text-violet-700 hover:bg-violet-50"
                      onClick={handleStartEdit}
                    >
                      <UserPlus size={14} className="mr-1" />
                      Cập nhật thành viên
                    </Button>
                  )}
                </div>

                {isEditingMembers ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                        placeholder="Tìm nhân viên thực hiện..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredCandidates.length === 0 ? (
                        <p className="text-sm text-slate-400 col-span-2 text-center py-4">Không tìm thấy nhân viên phù hợp.</p>
                      ) : (
                        filteredCandidates.map((emp) => {
                          const isChecked = selectedMemberIds.includes(emp.employeeId)
                          return (
                            <label
                              key={emp.employeeId}
                              className={`flex items-center gap-2.5 rounded-md px-3 py-2 cursor-pointer border transition ${
                                isChecked
                                  ? 'bg-violet-50 border-violet-200 text-violet-900'
                                  : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMember(emp.employeeId)}
                                className="accent-violet-600 h-4 w-4"
                                disabled={actionLoading}
                              />
                              <div className="text-left">
                                <p className="text-sm font-medium">{emp.employeeName}</p>
                                {emp.positionName && (
                                  <p className="text-xs text-slate-400">{emp.positionName}</p>
                                )}
                              </div>
                            </label>
                          )
                        })
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500">Đã chọn {selectedMemberIds.length} nhân sự</p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setIsEditingMembers(false)}
                          disabled={actionLoading}
                        >
                          Huỷ
                        </Button>
                        <Button
                          type="button"
                          className="bg-violet-600 hover:bg-violet-700 text-white"
                          onClick={handleSaveMembers}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader2 className="animate-spin mr-1" size={16} /> : <Check size={16} className="mr-1" />}
                          Lưu cập nhật
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {!wo.members || wo.members.length === 0 ? (
                      <p className="text-sm text-slate-400 py-4 text-center">Chưa có thành viên nào tham gia thi công.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
                            <tr>
                              <th className="px-4 py-3 text-center w-12 border-b border-slate-200">STT</th>
                              <th className="px-4 py-3 border-b border-slate-200">Họ và tên</th>
                              <th className="px-4 py-3 border-b border-slate-200">Chức vụ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700">
                            {wo.members.map((m, idx) => (
                              <tr key={m.employeeId || idx} className="hover:bg-slate-50/50 transition">
                                <td className="px-4 py-3 text-center text-slate-400">{idx + 1}</td>
                                <td className="px-4 py-3 font-semibold text-slate-800">{m.name}</td>
                                <td className="px-4 py-3 text-slate-500">{m.positionName || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-xl sticky bottom-0">
          <Button onClick={onClose} variant="secondary" disabled={actionLoading}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
