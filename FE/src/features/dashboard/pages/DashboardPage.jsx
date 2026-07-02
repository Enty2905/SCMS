import {
  Boxes,
  ClipboardCheck,
  PackageCheck,
  Route,
  ShieldAlert,
  Truck,
} from 'lucide-react'

import { apiClient } from '@/shared/api/httpClient.js'
import { MetricCard } from '@/shared/components/ui/MetricCard.jsx'

const metrics = [
  {
    label: 'Active shipments',
    value: '1,284',
    change: '+12.4% from last week',
    tone: 'emerald',
    icon: Truck,
  },
  {
    label: 'Inventory accuracy',
    value: '98.2%',
    change: 'Cycle count stable',
    tone: 'sky',
    icon: Boxes,
  },
  {
    label: 'Open exceptions',
    value: '14',
    change: '5 need owner review',
    tone: 'amber',
    icon: ShieldAlert,
  },
  {
    label: 'Orders fulfilled',
    value: '4,918',
    change: '+8.1% month to date',
    tone: 'rose',
    icon: ClipboardCheck,
  },
]

const lanes = [
  { name: 'Inbound', value: 84, color: 'bg-emerald-500' },
  { name: 'Warehouse', value: 68, color: 'bg-sky-500' },
  { name: 'Outbound', value: 76, color: 'bg-amber-500' },
  { name: 'Returns', value: 31, color: 'bg-rose-500' },
]

export function DashboardPage() {
  const healthUrl = apiClient.url('/health')

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700">
            Operations Command
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Supply chain overview
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-600">
            Track movement, capacity, and exceptions across the network in one
            focused workspace.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Network flow</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Current throughput by operating lane.
              </p>
            </div>
            <Route className="text-zinc-500" size={21} />
          </div>

          <div className="mt-6 space-y-5">
            {lanes.map((lane) => (
              <div key={lane.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700">
                    {lane.name}
                  </span>
                  <span className="text-zinc-500">{lane.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-zinc-100">
                  <div
                    className={`h-3 rounded-full ${lane.color}`}
                    style={{ width: `${lane.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">API contract</h2>
            <PackageCheck className="text-emerald-300" size={22} />
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            API calls should live in feature service files and use the shared
            client. Health endpoint target:
          </p>
          <code className="mt-4 block break-all rounded-md bg-white/10 p-3 text-sm text-emerald-100">
            {healthUrl}
          </code>
        </article>
      </section>
    </div>
  )
}
