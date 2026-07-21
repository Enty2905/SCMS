import { useState } from 'react'
import { ConsumableImportPage } from './ConsumableImportPage.jsx'
import { SparePartImportPage } from './SparePartImportPage.jsx'

const TABS = [
  { key: 'consumable', label: 'Vật tư tiêu hao' },
  { key: 'sparepart', label: 'Vật tư thay thế' },
]

export function MaterialImportWrapperPage() {
  const [activeTab, setActiveTab] = useState('consumable')

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-950">Nhập kho vật tư</h1>
      </section>

      {/* Tabs */}
      <div className="mt-5 flex gap-2">
        {TABS.map((tab) => (
          <button
            className={[
              'rounded-full border px-5 py-2 text-sm font-semibold transition',
              activeTab === tab.key
                ? 'border-violet-600 bg-violet-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            ].join(' ')}
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {activeTab === 'consumable' ? (
          <ConsumableImportPage hideHeader={true} />
        ) : (
          <SparePartImportPage hideHeader={true} />
        )}
      </div>
    </div>
  )
}
