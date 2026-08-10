import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'

export function SearchableSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = '-- Chọn --',
  placement = 'bottom'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Update search text when value changes from outside
  useEffect(() => {
    if (selectedOption && !isOpen) {
      setSearch(selectedOption.label)
    }
  }, [selectedOption, isOpen])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
        if (selectedOption) {
          setSearch(selectedOption.label)
        } else {
          setSearch('')
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedOption])

  // Filter options based on search text
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  function handleInputClick() {
    setIsOpen(true)
    setSearch('')
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger & Input */}
      <div 
        className={`flex items-center h-10 w-full rounded-lg border bg-white px-3 text-sm transition-all cursor-text ${isOpen ? 'border-violet-500 ring-4 ring-violet-500/10' : 'border-slate-200 hover:border-slate-300'}`}
        onClick={() => inputRef.current?.focus()}
      >
        <Search size={16} className={`mr-2 transition-colors ${isOpen ? 'text-violet-500' : 'text-slate-400'}`} />
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 truncate"
          placeholder={placeholder}
          value={search}
          onClick={handleInputClick}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
        />
        <ChevronDown 
          size={16} 
          className={`ml-2 text-slate-400 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''}`} 
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              setIsOpen(false);
              setSearch(selectedOption ? selectedOption.label : '');
            } else {
              setIsOpen(true);
              setSearch('');
              inputRef.current?.focus();
            }
          }} 
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-[100] w-full bg-white border border-slate-100 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in duration-150 ${placement === 'top' ? 'bottom-full mb-1.5 slide-in-from-bottom-2' : 'top-full mt-1.5 slide-in-from-top-2'}`}>
          <ul className="max-h-60 overflow-y-auto py-1.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li
                  key={opt.value}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    opt.value === value 
                      ? 'bg-violet-50 text-violet-700 font-semibold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    onChange(opt.value)
                    setSearch(opt.label)
                    setIsOpen(false)
                  }}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-sm text-center text-slate-500">
                Không tìm thấy kết quả phù hợp.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
