import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import type { Volcano } from '../models/smithsonian'

export interface Filters {
  search: string
  country: string
  region: string
  type: string
  eruptionPeriod: string
}

interface Props {
  volcanoes: Volcano[]
  filters: Filters
  setFilters: (filters: Filters) => void
  resultCount: number
  mobileOpen: boolean
  onClose: () => void
}

const EMPTY_FILTERS: Filters = { search: '', country: '', region: '', type: '', eruptionPeriod: '' }

function unique(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'pl'))
}

export function FiltersPanel({ volcanoes, filters, setFilters, resultCount, mobileOpen, onClose }: Props) {
  const countries = unique(volcanoes.map((volcano) => volcano.country))
  const regions = unique(volcanoes.map((volcano) => volcano.region))
  const types = unique(volcanoes.map((volcano) => volcano.primaryType))
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value })
  const isFiltered = Object.values(filters).some(Boolean)

  return (
    <aside className={`filters-panel ${mobileOpen ? 'filters-panel--open' : ''}`} aria-label="Filtry wulkanów">
      <div className="panel-heading">
        <div><SlidersHorizontal size={17} /><span>Eksploruj</span></div>
        <button className="icon-button mobile-only" onClick={onClose} aria-label="Zamknij filtry"><X size={20} /></button>
      </div>
      <label className="search-field">
        <Search size={18} />
        <input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder="Szukaj po nazwie…" />
        {filters.search && <button onClick={() => update('search', '')} aria-label="Wyczyść wyszukiwanie"><X size={15} /></button>}
      </label>
      <div className="filter-fields">
        <label><span>Kraj</span><select value={filters.country} onChange={(event) => update('country', event.target.value)}><option value="">Wszystkie kraje</option>{countries.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Region</span><select value={filters.region} onChange={(event) => update('region', event.target.value)}><option value="">Wszystkie regiony</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Typ wulkanu</span><select value={filters.type} onChange={(event) => update('type', event.target.value)}><option value="">Wszystkie typy</option>{types.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Ostatnia erupcja</span><select value={filters.eruptionPeriod} onChange={(event) => update('eruptionPeriod', event.target.value)}><option value="">Dowolny rok</option><option value="since-2000">Od 2000</option><option value="1900s">1900–1999</option><option value="1800s">1800–1899</option><option value="older">Przed 1800</option><option value="unknown">Rok nieznany</option></select></label>
      </div>
      <div className="filter-summary">
        <span><strong>{resultCount.toLocaleString('pl-PL')}</strong> wyników</span>
        {isFiltered && <button onClick={() => setFilters(EMPTY_FILTERS)}><RotateCcw size={14} /> Wyczyść</button>}
      </div>
      <div className="filter-note">
        <span>ŹRÓDŁO DANYCH</span>
        <p>Smithsonian Global Volcanism Program · dane ładowane przy uruchomieniu, wyłącznie w pamięci.</p>
      </div>
    </aside>
  )
}

export { EMPTY_FILTERS }
