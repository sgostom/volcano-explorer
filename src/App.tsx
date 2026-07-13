import { AlertTriangle, Database, Filter, Flame, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FiltersPanel, EMPTY_FILTERS, type Filters } from './components/FiltersPanel'
import { ReportsPanel } from './components/ReportsPanel'
import { VolcanoDetails } from './components/VolcanoDetails'
import { VolcanoMap } from './components/VolcanoMap'
import { useExplorerData } from './hooks/useExplorerData'
import type { Volcano } from './models/smithsonian'
import { normalizeName } from './normalizers/primitives'

function matchesEruptionPeriod(volcano: Volcano, period: string) {
  const year = volcano.lastEruptionYear
  if (!period) return true
  if (period === 'unknown') return year === null
  if (year === null) return false
  if (period === 'since-2000') return year >= 2000
  if (period === '1900s') return year >= 1900 && year < 2000
  if (period === '1800s') return year >= 1800 && year < 1900
  if (period === 'older') return year < 1800
  return true
}

function LoadingState() {
  return <main className="center-state"><div className="loading-mark"><Flame /><i /></div><h1>Łączymy się ze Smithsonian</h1><p>Pobieramy katalog wulkanów, historię erupcji i najnowszy raport tygodniowy.</p><div className="loading-lines"><span /><span /><span /></div></main>
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <main className="center-state"><div className="error-mark"><AlertTriangle /></div><h1>Nie udało się wczytać atlasu</h1><p>{message}</p><button className="primary-button" onClick={retry}><RefreshCw size={16} /> Spróbuj ponownie</button></main>
}

export default function App() {
  const explorer = useExplorerData()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [selected, setSelected] = useState<Volcano | null>(null)
  const [mobileFilters, setMobileFilters] = useState(false)

  const filtered = useMemo(() => {
    if (!explorer.data) return []
    const search = normalizeName(filters.search)
    return explorer.data.volcanoes.filter((volcano) =>
      (!search || normalizeName(volcano.name).includes(search)) &&
      (!filters.country || volcano.country === filters.country) &&
      (!filters.region || volcano.region === filters.region) &&
      (!filters.type || volcano.primaryType === filters.type) &&
      matchesEruptionPeriod(volcano, filters.eruptionPeriod),
    )
  }, [explorer.data, filters])

  if (explorer.status === 'loading') return <LoadingState />
  if (explorer.status === 'error') return <ErrorState message={explorer.error} retry={explorer.retry} />

  const data = explorer.data
  const volcanoesByNumber = new Map(data.volcanoes.map((volcano) => [volcano.number, volcano]))
  const selectVolcano = (volcano: Volcano) => { setSelected(volcano); setMobileFilters(false) }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Flame size={19} /></span><div><strong>GLOBAL VOLCANO</strong><span>EXPLORER</span></div></div>
        <div className="dataset-status"><i /><Database size={14} /><span>{data.volcanoes.length.toLocaleString('pl-PL')} wulkanów · {data.reports.length} raportów</span></div>
        <nav><a href="https://volcano.si.edu" target="_blank" rel="noreferrer">Smithsonian GVP</a><span>© Dane GVP</span></nav>
        <button className="mobile-filter-button" onClick={() => setMobileFilters(true)}><Filter size={17} /> Filtry</button>
      </header>
      <div className="workspace">
        <FiltersPanel volcanoes={data.volcanoes} filters={filters} setFilters={setFilters} resultCount={filtered.length} mobileOpen={mobileFilters} onClose={() => setMobileFilters(false)} />
        <main className="map-column">
          {filtered.length > 0 ? <VolcanoMap volcanoes={filtered} selected={selected} onSelect={selectVolcano} /> : <div className="map-empty"><span>0</span><h2>Brak wulkanów dla tych filtrów</h2><p>Zmień kryteria lub wyczyść filtry, aby wrócić do pełnego katalogu.</p><button onClick={() => setFilters(EMPTY_FILTERS)}>Wyczyść filtry</button></div>}
        </main>
        <ReportsPanel reports={data.reports} publishedAt={data.feedPublishedAt} onSelectVolcano={selectVolcano} volcanoesByNumber={volcanoesByNumber} />
        {selected && <><div className="drawer-scrim" onClick={() => setSelected(null)} /><VolcanoDetails key={selected.number} volcano={selected} onClose={() => setSelected(null)} /></>}
      </div>
    </div>
  )
}
