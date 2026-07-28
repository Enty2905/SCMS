export function Pagination({ disabled = false, onChange, page, totalPages }) {
  if (totalPages <= 1) {
    return null
  }

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
  for (let currentPage = startPage; currentPage <= endPage; currentPage += 1) {
    pages.push(currentPage)
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="shrink-0 text-sm text-slate-500">
        Hiển thị trang {page + 1} / {totalPages}
      </p>

      <nav
        aria-label="Phân trang"
        className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:pb-0"
      >
        <button
          className="shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || page === 0}
          onClick={() => onChange(0)}
          type="button"
        >
          Trang đầu
        </button>

        {pages.map((pageNumber) => (
          <button
            aria-current={page === pageNumber ? 'page' : undefined}
            className={[
              'min-w-9 shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition',
              page === pageNumber
                ? 'bg-violet-600 text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
            ].join(' ')}
            disabled={disabled}
            key={pageNumber}
            onClick={() => onChange(pageNumber)}
            type="button"
          >
            {pageNumber + 1}
          </button>
        ))}

        <button
          className="shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || page >= totalPages - 1}
          onClick={() => onChange(totalPages - 1)}
          type="button"
        >
          Trang cuối
        </button>
      </nav>
    </div>
  )
}
