import { AlertCircle, X } from 'lucide-react'
import { Button } from './Button.jsx'

export function ErrorModal({
  isOpen,
  onClose,
  title = 'Thông báo lỗi',
  message
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Smooth glass backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[6px] transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Premium Top Accent Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-red-500" />

        <button
          onClick={onClose}
          className="absolute right-4 top-5 rounded-lg p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition cursor-pointer active:scale-90"
        >
          <X size={18} />
        </button>
        
        <div className="flex flex-col items-center text-center mt-3">
          {/* Bouncing Warn Icon */}
          <div className="grid size-14 place-items-center rounded-full border-2 bg-rose-50 text-rose-600 border-rose-100/80 shadow-sm animate-pulse">
            <AlertCircle size={28} />
          </div>
          
          <h3 className="mt-4 text-lg font-bold text-slate-900 tracking-tight leading-7">
            {title}
          </h3>
          
          <p className="mt-2.5 text-sm text-slate-500 whitespace-pre-line leading-relaxed px-2">
            {message}
          </p>
        </div>
        
        {/* Buttons */}
        <div className="mt-6 flex justify-center gap-3 pt-4 border-t border-slate-100">
          <Button 
            className="w-36 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-rose-200/50 cursor-pointer rounded-lg shadow-md active:scale-95 transition-all" 
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
