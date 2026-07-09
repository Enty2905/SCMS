import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button.jsx'

export function ConsumableImportDetailModal({ item, onClose }) {
  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">
            Chi tiết phiếu nhập: <span className="text-violet-600">{item.importNumber}</span>
          </h2>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <DetailItem label="Người nhập" value={item.importedByName || item.importedBy} />
            <DetailItem label="Ngày nhập" value={new Date(item.importedAt).toLocaleString('vi-VN')} />
            <DetailItem label="Tổng loại vật tư" value={item.items?.length || 0} />
            <DetailItem label="Ghi chú" value={item.note || '---'} />
          </div>

          <h3 className="text-base font-semibold text-slate-950 mb-3">Danh sách vật tư nhập</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold text-center w-12">STT</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Mã VT</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Tên vật tư</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">ĐVT</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold text-right">Số lượng</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {item.items && item.items.length > 0 ? (
                  item.items.map((importedItem, idx) => (
                    <tr key={importedItem.itemId || idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500 text-center font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-violet-600">{importedItem.consumableCode}</td>
                      <td className="px-4 py-3 font-semibold text-slate-950">{importedItem.consumableName}</td>
                      <td className="px-4 py-3 text-slate-600">{importedItem.consumableUnit}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700">{importedItem.quantity}</td>
                      <td className="px-4 py-3 text-slate-600">{importedItem.note || '---'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Không có vật tư nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button onClick={onClose} variant="secondary">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-base font-medium text-slate-950">{value}</p>
    </div>
  )
}
