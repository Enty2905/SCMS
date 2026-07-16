import { X, Calendar, MapPin, Users, Info, Settings } from 'lucide-react'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function WorkOrderDetailModal({ workOrder, onClose }) {
  if (!workOrder) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Chi tiết Phiếu công tác</h3>
            <p className="text-sm text-slate-500">
              Mã số: <strong className="text-violet-700">{workOrder.orderNumber}</strong>
            </p>
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
        <div className="flex-1 p-6 bg-slate-50">
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
                    {workOrder.status === 'open' ? 'Đang mở' :
                     workOrder.status === 'paused' ? 'Đang đóng' :
                     workOrder.status === 'draft' ? 'Mới tạo' : 'Hoàn thành'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Ngày tạo:</span>
                  <span className="col-span-2 text-slate-700">{formatDate(workOrder.createdAt)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Người tạo:</span>
                  <span className="col-span-2 text-slate-700">{workOrder.createdByName || workOrder.createdByUsername || '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Nội dung:</span>
                  <span className="col-span-2 text-slate-700 whitespace-pre-line">{workOrder.content || '—'}</span>
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
                  <span className="col-span-2 font-semibold text-slate-700">{workOrder.equipmentKksCode || '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Tên thiết bị:</span>
                  <span className="col-span-2 text-slate-700">{workOrder.equipmentName || '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Vị trí:</span>
                  <span className="col-span-2 text-slate-700 flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    {workOrder.equipmentLocation || '—'}
                  </span>
                </div>
                {workOrder.requestDescription && (
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-50">
                    <span className="text-slate-500 font-medium">Yêu cầu gốc:</span>
                    <span className="col-span-2 text-slate-700 line-clamp-2">{workOrder.requestDescription}</span>
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
                  <span className="col-span-2 text-slate-700">{formatDate(workOrder.startDate)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Kết thúc (DK):</span>
                  <span className="col-span-2 text-slate-700">{formatDate(workOrder.endDate)}</span>
                </div>
                {workOrder.extendedTo && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-medium text-rose-600">Gia hạn đến:</span>
                    <span className="col-span-2 text-rose-600 font-medium">{formatDate(workOrder.extendedTo)}</span>
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
                  <span className="text-slate-500 font-medium">Trưởng ca:</span>
                  <span className="col-span-2 text-slate-700 font-semibold">{workOrder.workLeader?.name || '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Chỉ huy TT:</span>
                  <span className="col-span-2 text-slate-700">{workOrder.directCommander?.name || '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Giám sát AT:</span>
                  <span className="col-span-2 text-slate-700">{workOrder.safetySupervisor?.name || '—'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
