const toneClasses = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
}

export function MetricCard({ label, value, change, tone, icon: Icon }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-zinc-950">{value}</p>
        </div>
        <div className={`rounded-md p-2 ring-1 ${toneClasses[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-600">{change}</p>
    </article>
  )
}
