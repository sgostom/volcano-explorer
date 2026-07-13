import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import type { Volcano } from '../models/smithsonian'
import { normalizeName } from '../normalizers/primitives'

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
  const suggestionListId = useId()
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const countries = unique(volcanoes.map((volcano) => volcano.country))
  const regions = unique(volcanoes.map((volcano) => volcano.region))
  const types = unique(volcanoes.map((volcano) => volcano.primaryType))
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value })
  const isFiltered = Object.values(filters).some(Boolean)
  const suggestions = useMemo(() => {
    const query = normalizeName(filters.search)
    if (!query) return []

    return volcanoes
      .filter((volcano) => normalizeName(volcano.name).includes(query))
      .sort((a, b) => {
        const aStarts = normalizeName(a.name).startsWith(query)
        const bStarts = normalizeName(b.name).startsWith(query)
        if (aStarts !== bStarts) return aStarts ? -1 : 1
        return a.name.localeCompare(b.name, 'pl')
      })
      .slice(0, 8)
  }, [filters.search, volcanoes])

  const chooseSuggestion = (volcano: Volcano) => {
    update('search', volcano.name)
    setSuggestionsOpen(false)
    setActiveSuggestion(-1)
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setSuggestionsOpen(false)
      setActiveSuggestion(-1)
      return
    }

    if (!suggestions.length || !suggestionsOpen) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestion((current) => (current + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
    } else if (event.key === 'Enter' && activeSuggestion >= 0) {
      event.preventDefault()
      chooseSuggestion(suggestions[activeSuggestion])
    }
  }

  const showSuggestions = suggestionsOpen && filters.search.trim() && suggestions.length > 0

  return (
    <aside className={`filters-panel ${mobileOpen ? 'filters-panel--open' : ''}`} aria-label="Filtry wulkanów">
      <div className="panel-heading">
        <div><SlidersHorizontal size={17} /><span>Eksploruj</span></div>
        <button className="icon-button mobile-only" onClick={onClose} aria-label="Zamknij filtry"><X size={20} /></button>
      </div>
      <div className="search-autocomplete">
        <label className="search-field">
          <Search size={18} />
          <input
            value={filters.search}
            onChange={(event) => {
              update('search', event.target.value)
              setSuggestionsOpen(true)
              setActiveSuggestion(-1)
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => setSuggestionsOpen(false)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Szukaj po nazwie…"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={suggestionListId}
            aria-expanded={Boolean(showSuggestions)}
            aria-activedescendant={activeSuggestion >= 0 ? `${suggestionListId}-${activeSuggestion}` : undefined}
          />
          {filters.search && <button type="button" onClick={() => update('search', '')} aria-label="Wyczyść wyszukiwanie"><X size={15} /></button>}
        </label>
        {showSuggestions && (
          <div className="search-suggestions" id={suggestionListId} role="listbox" aria-label="Sugerowane wulkany">
            {suggestions.map((volcano, index) => (
              <button
                type="button"
                id={`${suggestionListId}-${index}`}
                key={volcano.number}
                role="option"
                aria-selected={index === activeSuggestion}
                className={index === activeSuggestion ? 'search-suggestion--active' : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseSuggestion(volcano)}
              >
                <strong>{volcano.name}</strong>
                <span>{volcano.country ?? 'Kraj nieznany'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="filter-fields">
        <label><span>Kraj</span><select value={filters.country} onChange={(event) => update('country', event.target.value)}><option value="">Wszystkie kraje</option>{countries.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Region</span><select value={filters.region} onChange={(event) => update('region', event.target.value)}><option value="">Wszystkie regiony</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Typ wulkanu</span><select value={filters.type} onChange={(event) => update('type', event.target.value)}><option value="">Wszystkie typy</option>{types.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Ostatnia erupcja</span><select value={filters.eruptionPeriod} onChange={(event) => update('eruptionPeriod', event.target.value)}><option value="">Dowolny rok</option><option value="since-2000">Od 2000</option><option value="1900s">1900–1999</option><option value="1800s">1800–1899</option><option value="older">Przed 1800</option><option value="unknown">Rok nieznany</option></select></label>
      </div>
      <div className="filter-summary">
        <span><strong>{resultCount.toLocaleString('pl-PL')}</strong> {resultCount === 1 ? 'wynik' : 'wyników'}</span>
        {isFiltered && <button onClick={() => setFilters(EMPTY_FILTERS)}><RotateCcw size={14} /> Wyczyść</button>}
      </div>
      <div className="filter-note">
        <span>ŹRÓDŁA</span>
        <p>Dane wulkanologiczne: Smithsonian GVP. Podkład satelitarny: EOxCloudless / Copernicus Sentinel-2. Dane aplikacji pozostają wyłącznie w pamięci.</p>
      </div>
    </aside>
  )
}

export { EMPTY_FILTERS }
