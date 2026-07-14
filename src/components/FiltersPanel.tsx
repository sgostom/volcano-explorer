import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { useI18n } from '../i18n'
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

function unique(values: Array<string | null>, locale: string) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, locale))
}

export function FiltersPanel({ volcanoes, filters, setFilters, resultCount, mobileOpen, onClose }: Props) {
  const { intlLocale, t, plural } = useI18n()
  const suggestionListId = useId()
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const countries = unique(volcanoes.map((volcano) => volcano.country), intlLocale)
  const regions = unique(volcanoes.map((volcano) => volcano.region), intlLocale)
  const types = unique(volcanoes.map((volcano) => volcano.primaryType), intlLocale)
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
        return a.name.localeCompare(b.name, intlLocale)
      })
      .slice(0, 8)
  }, [filters.search, intlLocale, volcanoes])

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
    <aside className={`filters-panel ${mobileOpen ? 'filters-panel--open' : ''}`} aria-label={t('filters.aria')}>
      <div className="panel-heading">
        <div><SlidersHorizontal size={17} /><span>{t('filters.heading')}</span></div>
        <button className="icon-button mobile-only" onClick={onClose} aria-label={t('filters.close')}><X size={20} /></button>
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
            placeholder={t('filters.searchPlaceholder')}
            role="combobox"
            aria-autocomplete="list"
            aria-controls={suggestionListId}
            aria-expanded={Boolean(showSuggestions)}
            aria-activedescendant={activeSuggestion >= 0 ? `${suggestionListId}-${activeSuggestion}` : undefined}
          />
          {filters.search && <button type="button" onClick={() => update('search', '')} aria-label={t('filters.clearSearch')}><X size={15} /></button>}
        </label>
        {showSuggestions && (
          <div className="search-suggestions" id={suggestionListId} role="listbox" aria-label={t('filters.suggestions')}>
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
                <span>{volcano.country ?? t('common.unknownCountry')}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="filter-fields">
        <label><span>{t('filters.country')}</span><select value={filters.country} onChange={(event) => update('country', event.target.value)}><option value="">{t('filters.allCountries')}</option>{countries.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>{t('filters.region')}</span><select value={filters.region} onChange={(event) => update('region', event.target.value)}><option value="">{t('filters.allRegions')}</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>{t('filters.type')}</span><select value={filters.type} onChange={(event) => update('type', event.target.value)}><option value="">{t('filters.allTypes')}</option>{types.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>{t('filters.lastEruption')}</span><select value={filters.eruptionPeriod} onChange={(event) => update('eruptionPeriod', event.target.value)}><option value="">{t('filters.anyYear')}</option><option value="since-2000">{t('filters.since2000')}</option><option value="1900s">1900–1999</option><option value="1800s">1800–1899</option><option value="older">{t('filters.before1800')}</option><option value="unknown">{t('filters.unknownYear')}</option></select></label>
      </div>
      <div className="filter-summary">
        <span><strong>{resultCount.toLocaleString(intlLocale)}</strong> {plural('filters.results', resultCount)}</span>
        {isFiltered && <button onClick={() => setFilters(EMPTY_FILTERS)}><RotateCcw size={14} /> {t('filters.clear')}</button>}
      </div>
      <div className="filter-note">
        <span>{t('filters.sources')}</span>
        <p>{t('filters.sourceNote')}</p>
      </div>
    </aside>
  )
}

export { EMPTY_FILTERS }
