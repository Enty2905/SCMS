import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, FileText, Loader2, Package, Printer, Upload, X, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { exportConsumableRequestPdf } from '../services/consumableRequest.service.js'
import { exportSparePartRequestPdf } from '../services/sparePartRequest.service.js'

const STEPS = [
  { id: 1, label: 'Kiểm tra tồn kho' },
  { id: 2, label: 'Xác nhận cấp phát' },
  { id: 3, label: 'Upload phiếu đã ký' },
]

const STATUS_LABELS = { pending: 'Chờ cấp phát', issued: 'Đã cấp phát', rejected: 'Từ chối', completed: 'Hoàn tất' }
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  issued: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  completed: 'bg-blue-100 text-blue-700',
}

/**
 * Modal cấp phát vật tư 3 bước dùng chung cho cả Tiêu hao và Thay thế.
 *
 * Props:
 * - isOpen, onClose: điều khiển mở/đóng
 * - request: object phiếu (từ FE transform về)
 * - type: 'consumable' | 'sparePart'
 * - onIssue: (reqId, payload) => Promise  (bước 2)
 * - onUploadPdf: (reqId, file) => Promise  (bước 3)
 * - stockMap: { [code]: number }  tồn kho thực tế
 */
export function IssueRequestModal({
  isOpen,
  onClose,
  request,
  type = 'consumable',
  onIssue,
  onReject,
  onUploadPdf,
  stockMap = {},
  stocks = {},
}) {
  const [step, setStep] = useState(() => {
    if (request?.status === 'issued' || request?.status === 'completed') {
      return 3
    }
    return 1
  })
  const [detailTab, setDetailTab] = useState('overview')
  const [issuedQtys, setIssuedQtys] = useState({})
  const [note, setNote] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfDragging, setPdfDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const fileInputRef = useRef(null)

  const isConsumable = type === 'consumable'
  const items = request?.items || []
  const isIssued = request?.status === 'issued' || request?.status === 'completed'

  // Khởi tạo trạng thái modal khi mở
  useEffect(() => {
    if (isOpen && request) {
      if (request.status === 'issued' || request.status === 'completed') {
        setStep(3)
        setDetailTab('overview')
      } else {
        setStep(1)
      }
      setNote('')
      setPdfFile(null)
      setError(null)
      setSuccess(false)
      setShowRejectConfirm(false)
      setRejectReason('')
    }
  }, [isOpen, request?.reqId, request?.status])

  function getStock(item) {
    const map = Object.keys(stockMap).length > 0 ? stockMap : stocks
    const val = map[item.code] ?? map[item.consumableId] ?? map[item.sparePartId] ?? map[item.itemId] ?? null
    if (val === null || val === undefined) return null
    return typeof val === 'object' ? (val.stockQuantity ?? val.quantity ?? 0) : Number(val)
  }

  function getDisplayQty(item) {
    if (request?.status === 'issued' || request?.status === 'completed') {
      return item.quantityIssued !== undefined && item.quantityIssued !== null
        ? item.quantityIssued
        : (item.quantityRequested ?? 0)
    }
    const val = issuedQtys[item.itemId] ?? issuedQtys[item.id] ?? issuedQtys[item.consumableId] ?? issuedQtys[item.sparePartId] ?? issuedQtys[item.code]
    if (val !== undefined && val !== null) {
      return val
    }
    const reqQty = item.quantityRequested ?? 0
    const stock = getStock(item)
    return stock !== null ? Math.min(reqQty, stock) : reqQty
  }

  // Khởi tạo SL thực cấp = SL yêu cầu (nếu tồn kho ít hơn yêu cầu thì để SL tồn kho)
  useEffect(() => {
    if (isOpen && request) {
      setIssuedQtys((prev) => {
        const nextQtys = { ...prev }
        ;(request.items || []).forEach((item) => {
          const defaultQty = getDisplayQty(item)
          if (item.itemId) nextQtys[item.itemId] = defaultQty
          if (item.id) nextQtys[item.id] = defaultQty
          if (item.consumableId) nextQtys[item.consumableId] = defaultQty
          if (item.sparePartId) nextQtys[item.sparePartId] = defaultQty
          if (item.code) nextQtys[item.code] = defaultQty
        })
        return nextQtys
      })
    }
  }, [isOpen, request, stockMap, stocks])

  function handleQtyChange(item, val) {
    const num = parseInt(val, 10)
    const validNum = isNaN(num) ? 0 : Math.max(0, num)
    setIssuedQtys((prev) => {
      const next = { ...prev }
      if (item.itemId) next[item.itemId] = validNum
      if (item.id) next[item.id] = validNum
      if (item.consumableId) next[item.consumableId] = validNum
      if (item.sparePartId) next[item.sparePartId] = validNum
      if (item.code) next[item.code] = validNum
      return next
    })
  }

  function hasStockIssue() {
    return items.some((item) => {
      const stock = getStock(item)
      const qty = getDisplayQty(item)
      return stock !== null && qty > stock
    })
  }

  function hasZeroIssue() {
    return items.some((item) => getDisplayQty(item) === 0)
  }

  function hasExceedRequestedIssue() {
    return items.some((item) => getDisplayQty(item) > item.quantityRequested)
  }

  async function handleIssue() {
    if (!onIssue || !request) return
    setError(null)
    setLoading(true)
    try {
      const payloadItems = items.map((item) => ({
        itemId: item.itemId,
        quantityIssued: getDisplayQty(item),
      }))
      await onIssue(request.reqId, { items: payloadItems, note })
      setStep(3)
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi cấp phát')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!onReject || !request) return
    setError(null)
    setLoading(true)
    try {
      await onReject(request.reqId, rejectReason)
      // onReject sẽ tự đóng modal và refresh list
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi từ chối')
      setLoading(false)
    }
  }

  async function handleUploadPdf() {
    if (!onUploadPdf || !request || !pdfFile) return
    setError(null)
    setLoading(true)
    try {
      await onUploadPdf(request.reqId, pdfFile)
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi upload PDF')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadExportPdf() {
    setLoading(true)
    setError(null)
    try {
      const fn = isConsumable ? exportConsumableRequestPdf : exportSparePartRequestPdf
      const blob = await fn(request.reqId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Phieu_Cap_Phat_${request.reqNumber || 'VT'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Lỗi khi tải phiếu in PDF từ server')
    } finally {
      setLoading(false)
    }
  }

  function handleFileDrop(e) {
    e.preventDefault()
    setPdfDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type === 'application/pdf') setPdfFile(file)
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0]
    if (file) setPdfFile(file)
  }

  if (!request) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isIssued ? 'Chi tiết phiếu cấp phát vật tư' : (isConsumable ? 'Cấp phát vật tư tiêu hao' : 'Cấp phát vật tư thay thế')}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Phiếu: <strong className="text-violet-700">{request.reqNumber}</strong></span>
              {request.orderNumber && (
                <><span>·</span><span>PCT: <strong>{request.orderNumber}</strong></span></>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status] || 'bg-slate-100 text-slate-700'}`}>
                {STATUS_LABELS[request.status] || request.status}
              </span>
            </p>
          </div>
          <button
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Header: Tabs for Issued requests vs Stepper for Pending requests */}
        {isIssued ? (
          <div className="flex border-b border-slate-200 px-6 pt-3 shrink-0 gap-6 bg-slate-50/60">
            <button
              type="button"
              onClick={() => setDetailTab('overview')}
              className={[
                'pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer',
                detailTab === 'overview' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              ].join(' ')}
            >
              <Package size={16} />
              Đối chiếu số lượng & Chi tiết
            </button>
            <button
              type="button"
              onClick={() => setDetailTab('pdf')}
              className={[
                'pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer',
                detailTab === 'pdf' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              ].join(' ')}
            >
              <FileText size={16} />
              Hồ sơ chứng từ PDF {request.pdfUrl ? '(Đã có file)' : '(Chưa có)'}
            </button>
          </div>
        ) : (
          /* Stepper */
          <div className="flex items-center gap-0 px-6 pt-5 pb-3 shrink-0">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={[
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                    step > s.id || ((success || request.pdfUrl) && s.id === 3)
                      ? 'bg-emerald-500 text-white'
                      : step === s.id
                        ? 'bg-violet-600 text-white ring-4 ring-violet-100'
                        : 'bg-slate-100 text-slate-400',
                  ].join(' ')}>
                    {step > s.id || ((success || request.pdfUrl) && s.id === 3) ? <CheckCircle2 size={14} /> : s.id}
                  </div>
                  <span className={[
                    'text-[11px] font-medium whitespace-nowrap',
                    step === s.id ? 'text-violet-700' : step > s.id || ((success || request.pdfUrl) && s.id === 3) ? 'text-emerald-600' : 'text-slate-400',
                  ].join(' ')}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={[
                    'h-0.5 flex-1 mx-2 mt-[-14px] rounded',
                    step > s.id ? 'bg-emerald-400' : 'bg-slate-200',
                  ].join(' ')} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* ── MODE 1: Đã cấp phát - Tab Overview ── */}
          {isIssued && detailTab === 'overview' && (
            <div className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block">Trạng thái phiếu</span>
                  <span className="text-sm font-bold text-emerald-600 mt-0.5 block">
                    {STATUS_LABELS[request.status] || request.status}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block">Ngày lập phiếu</span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                    {request.createdAt ? new Date(request.createdAt).toLocaleString('vi-VN') : '—'}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 sm:col-span-1 col-span-2">
                  <span className="text-xs text-slate-500 block">Người yêu cầu</span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                    {request.createdByName ?? request.createdByUsername ?? '—'}
                  </span>
                </div>
              </div>

              {/* Items table with requested vs issued */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
                  <span>Bảng đối chiếu số lượng yêu cầu vs thực tế cấp phát</span>
                  <span className="text-[11px] font-normal text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200">
                    Đã xuất kho thực tế
                  </span>
                </h4>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Mã VT</th>
                        <th className="px-4 py-3">Tên vật tư</th>
                        <th className="px-4 py-3 text-center">Đơn vị</th>
                        <th className="px-4 py-3 text-right">SL yêu cầu</th>
                        <th className="px-4 py-3 text-right">SL thực cấp</th>
                        <th className="px-4 py-3 text-right">Đối chiếu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => {
                        const reqQty = item.quantityRequested ?? 0
                        const issQty = getDisplayQty(item)
                        const diff = issQty - reqQty
                        return (
                          <tr key={item.itemId} className="hover:bg-slate-50/60">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.code}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                            <td className="px-4 py-3 text-center text-xs font-semibold text-slate-600">{item.unit}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{reqQty}</td>
                            <td className="px-4 py-3 text-right font-bold text-violet-700">{issQty}</td>
                            <td className="px-4 py-3 text-right">
                              {diff < 0 ? (
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                                  Cấp thiếu
                                </span>
                              ) : diff > 0 ? (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                                  Cấp dư (+{diff})
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                  Cấp đủ
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action notice for printing actual issue PDF */}
              <div className="rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80 p-4 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-sm font-bold text-violet-950 flex items-center gap-1.5">
                    <Printer size={16} className="text-violet-700" />
                    Phiếu in xuất kho / Cấp phát thực tế
                  </h5>
                  <p className="text-xs text-violet-700 mt-0.5">
                    Tải về bản in PDF từ hệ thống đã chốt đúng số lượng thực cấp để các bên ký nhận và tải lên.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDownloadExportPdf}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
                  Tải phiếu in thực tế
                </button>
              </div>
              {error && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── MODE 2: Đã cấp phát - Tab PDF ── HOẶC Wizard Step 3 cho đang cấp phát */}
          {((isIssued && detailTab === 'pdf') || (!isIssued && step === 3)) && (
            <div className="space-y-4">
              {success || (request.pdfUrl && !pdfFile) ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-600 mb-2" size={36} />
                  <h4 className="font-bold text-slate-900 text-base">Hồ sơ đã có file PDF đã ký!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Bạn có thể mở xem trực tiếp chứng từ hoặc chọn tải lên file mới nếu muốn thay thế.
                  </p>
                  
                  {request.pdfUrl && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <a
                        href={request.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <ExternalLink size={14} />
                        Xem file PDF hiện tại
                      </a>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                      >
                        <Upload size={14} />
                        Upload thay thế file khác
                      </button>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    accept="application/pdf"
                    className="hidden"
                    type="file"
                    onChange={handleFileInput}
                  />
                  
                  {pdfFile && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-left max-w-sm mx-auto">
                      <span className="text-xs font-medium text-slate-700 truncate">{pdfFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                      >
                        Hủy chọn
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-violet-50 p-4 border border-violet-200">
                    <p className="text-xs text-violet-800 leading-relaxed">
                      {isIssued ? (
                        <span><strong>Hướng dẫn:</strong> Hãy sử dụng bản in từ nút <strong>"Tải phiếu in thực tế"</strong> ở tab trước để có số lượng cấp phát chính xác, sau đó ký tên và tải lên đây.</span>
                      ) : (
                        <span><strong>Bước cuối cùng:</strong> Vui lòng upload bản scan phiếu đã ký để hoàn tất hồ sơ.</span>
                      )}
                    </p>
                  </div>

                  <div
                    className={[
                      'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
                      pdfDragging
                        ? 'border-violet-500 bg-violet-50/50'
                        : pdfFile
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-slate-200 hover:border-violet-400 hover:bg-slate-50',
                    ].join(' ')}
                    onClick={() => fileInputRef.current?.click()}
                    onDragLeave={() => setPdfDragging(false)}
                    onDragOver={(e) => { e.preventDefault(); setPdfDragging(true) }}
                    onDrop={handleFileDrop}
                  >
                    <input
                      ref={fileInputRef}
                      accept="application/pdf"
                      className="hidden"
                      type="file"
                      onChange={handleFileInput}
                    />
                    <div className="rounded-full bg-slate-100 p-3 text-slate-500 mb-3">
                      <Upload size={22} />
                    </div>
                    {pdfFile ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{pdfFile.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {(pdfFile.size / 1024).toFixed(1)} KB — Nhấp để chọn file khác
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Kéo thả file PDF vào đây hoặc <span className="text-violet-600">chọn từ máy tính</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Chỉ hỗ trợ định dạng .PDF (tối đa 10MB)</p>
                      </div>
                    )}
                  </div>

                  {pdfFile && (
                    <div className="flex justify-end">
                      <button
                        className="text-xs text-rose-500 hover:text-rose-700 underline cursor-pointer"
                        type="button"
                        onClick={() => setPdfFile(null)}
                      >
                        Xóa file đã chọn
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Step 1: Kiểm tra tồn kho (Dành cho phiếu chờ cấp phát) ── */}
          {!isIssued && step === 1 && (
            <div>
              <p className="text-sm text-slate-500 mb-3">
                Vui lòng kiểm tra tồn kho hiện tại và điều chỉnh số lượng cấp phát thực tế nếu cần.
              </p>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Mã VT</th>
                      <th className="px-4 py-3">Tên</th>
                      <th className="px-4 py-3 text-center">Đơn vị</th>
                      <th className="px-4 py-3 text-right">Tồn kho</th>
                      <th className="px-4 py-3 text-right">SL yêu cầu</th>
                      <th className="px-4 py-3 text-right">SL thực cấp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const stock = getStock(item)
                      const qty = getDisplayQty(item)
                      const insufficient = stock !== null && qty > stock
                      const isZero = qty === 0
                      const isExceedRequested = qty > item.quantityRequested
                      const hasError = insufficient || isZero || isExceedRequested
                      return (
                        <tr key={item.itemId} className={hasError ? 'bg-rose-50' : 'hover:bg-slate-50/60'}>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.code}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                          <td className="px-4 py-3 text-center text-xs font-semibold text-slate-600">{item.unit}</td>
                          <td className="px-4 py-3 text-right">
                            {stock === null ? (
                              <span className="text-slate-400 text-xs">Đang tải...</span>
                            ) : (
                              <span className={[
                                'font-semibold',
                                stock <= 0 ? 'text-rose-600' : stock < item.quantityRequested ? 'text-amber-600' : 'text-emerald-600',
                              ].join(' ')}>
                                {stock}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">{item.quantityRequested}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {hasError && <AlertTriangle className="text-rose-500 shrink-0" size={14} />}
                              <input
                                className={[
                                  'w-20 rounded-lg border px-2 py-1.5 text-sm text-right outline-none transition focus:ring-2',
                                  hasError
                                    ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-rose-200'
                                    : 'border-slate-200 focus:border-violet-500 focus:ring-violet-100',
                                ].join(' ')}
                                min={0}
                                max={stock ?? undefined}
                                type="number"
                                value={qty}
                                onChange={(e) => handleQtyChange(item, e.target.value)}
                              />
                            </div>
                            {insufficient && (
                              <p className="text-[11px] text-rose-500 mt-1 text-right">Vượt tồn kho</p>
                            )}
                            {isZero && (
                              <p className="text-[11px] text-rose-500 mt-1 text-right">Phải {'>'} 0</p>
                            )}
                            {isExceedRequested && (
                              <p className="text-[11px] text-rose-500 mt-1 text-right">Vượt yêu cầu</p>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {hasStockIssue() && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-700">
                  <AlertTriangle size={16} className="shrink-0" />
                  Một số vật tư có số lượng cấp vượt quá tồn kho hiện tại.
                </div>
              )}
              {hasZeroIssue() && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-700">
                  <AlertTriangle size={16} className="shrink-0" />
                  Số lượng cấp phát phải lớn hơn 0.
                </div>
              )}
              {hasExceedRequestedIssue() && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-700">
                  <AlertTriangle size={16} className="shrink-0" />
                  Số lượng cấp không được vượt quá số lượng yêu cầu.
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Xác nhận (Dành cho phiếu chờ cấp phát) ── */}
          {!isIssued && step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Xác nhận lại thông tin cấp phát trước khi thực hiện.</p>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  Danh sách vật tư sẽ cấp phát
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Mã VT</th>
                      <th className="px-4 py-2">Tên</th>
                      <th className="px-4 py-2 text-center">Đơn vị</th>
                      <th className="px-4 py-2 text-right">SL yêu cầu</th>
                      <th className="px-4 py-2 text-right font-semibold text-violet-700">SL thực cấp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.itemId} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.code}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                        <td className="px-4 py-3 text-center text-xs font-semibold text-slate-600">{item.unit}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{item.quantityRequested}</td>
                        <td className="px-4 py-3 text-right font-bold text-violet-700">
                          {getDisplayQty(item)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú cấp phát (tùy chọn)
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  placeholder="Ghi chú thêm cho người nhận..."
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-slate-50/40 rounded-b-2xl border-t border-slate-200">
          {/* Reject confirmation panel - hiện khi showRejectConfirm = true */}
          {showRejectConfirm && !isIssued && (
            <div className="px-6 pt-4 pb-2 border-b border-rose-200 bg-rose-50/60">
              <p className="text-sm font-semibold text-rose-800 mb-2">Xác nhận từ chối phiếu cấp phát</p>
              <textarea
                autoFocus
                className="w-full rounded-lg border border-rose-300 bg-white p-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100 resize-none"
                placeholder="Nhập lý do từ chối (bắt buộc)..."
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              {error && (
                <div className="mt-2 rounded-lg bg-rose-100 p-2.5 text-xs font-medium text-rose-700 border border-rose-200">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  disabled={loading}
                  onClick={() => { setShowRejectConfirm(false); setRejectReason(''); setError(null) }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer"
                  disabled={loading || !rejectReason.trim()}
                  onClick={handleReject}
                >
                  {loading && <Loader2 className="animate-spin" size={12} />}
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              {!isIssued && step > 1 && !success && !request.pdfUrl && !showRejectConfirm && (
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  disabled={loading}
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ChevronLeft size={16} />
                  Quay lại
                </button>
              )}
              {/* Nút từ chối - chỉ hiện khi phiếu đang pending và chưa ở confirm panel */}
              {!isIssued && onReject && !showRejectConfirm && (
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                  disabled={loading}
                  onClick={() => setShowRejectConfirm(true)}
                >
                  <XCircle size={15} />
                  Từ chối
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isIssued ? (
                <div className="flex items-center gap-2">
                  {detailTab === 'overview' && (
                    <button
                      type="button"
                      onClick={() => setDetailTab('pdf')}
                      className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText size={15} />
                      Sang phần chứng từ PDF
                    </button>
                  )}
                  {detailTab === 'pdf' && pdfFile && !success && (
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer"
                      disabled={loading}
                      onClick={handleUploadPdf}
                    >
                      {loading && <Loader2 className="animate-spin" size={15} />}
                      <Upload size={15} />
                      {loading ? 'Đang upload...' : 'Xác nhận Upload PDF'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition-colors cursor-pointer"
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </div>
              ) : success || request.pdfUrl ? (
                <button
                  type="button"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                  onClick={onClose}
                >
                  Hoàn tất & Đóng
                </button>
              ) : step === 1 ? (
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer"
                  disabled={hasStockIssue() || hasZeroIssue() || hasExceedRequestedIssue()}
                  onClick={() => setStep(2)}
                >
                  Tiếp theo
                  <ChevronRight size={16} />
                </button>
              ) : step === 2 ? (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer"
                  disabled={loading}
                  onClick={handleIssue}
                >
                  {loading && <Loader2 className="animate-spin" size={15} />}
                  {loading ? 'Đang cấp phát...' : 'Xác nhận cấp phát'}
                </button>
              ) : (
                /* Step 3 */
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer"
                  disabled={loading || !pdfFile}
                  onClick={handleUploadPdf}
                >
                  {loading && <Loader2 className="animate-spin" size={15} />}
                  <Upload size={15} />
                  {loading ? 'Đang upload...' : 'Upload PDF'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
