import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button.jsx'

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning' // 'warning' | 'danger' | 'info'
}) {
  if (!isOpen) return null

  const typeStyles = {
    danger: {
      gradient: 'from-rose-500 to-orange-500',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100/80',
      confirmBtn: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-rose-200/50',
    },
    warning: {
      gradient: 'from-amber-500 to-yellow-500',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100/80',
      confirmBtn: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-200/50',
    },
    info: {
      gradient: 'from-violet-500 to-indigo-500',
      iconBg: 'bg-violet-50 text-violet-600 border-violet-100/80',
      confirmBtn: 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-violet-200/50',
    }
  }

  const style = typeStyles[type] || typeStyles.warning

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
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.gradient}`} />

        <button
          onClick={onClose}
          className="absolute right-4 top-5 rounded-lg p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition cursor-pointer active:scale-90"
        >
          <X size={18} />
        </button>
        
        <div className="flex flex-col items-center text-center mt-3">
          {/* Bouncing Warn Icon */}
          <div className={`grid size-14 place-items-center rounded-full border-2 ${style.iconBg} shadow-sm animate-pulse`}>
            <AlertTriangle size={28} />
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
            variant="secondary" 
            onClick={onClose} 
            className="w-28 cursor-pointer rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
          >
            {cancelText}
          </Button>
          <Button 
            className={`w-36 ${style.confirmBtn} cursor-pointer rounded-lg shadow-md active:scale-95 transition-all`} 
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
