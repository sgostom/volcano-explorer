import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Locale = 'pl' | 'en'
export type TranslationValues = Record<string, string | number>

const pl = {
  'meta.description': 'Interaktywny atlas wulkanów holoceńskich Smithsonian Global Volcanism Program',
  'language.label': 'Język interfejsu',
  'language.polish': 'Polski',
  'language.english': 'Angielski',
  'common.unknown': 'Nieznany',
  'common.notSpecified': 'Nie określono',
  'common.unknownCountry': 'Kraj nieznany',
  'common.unknownLocation': 'Lokalizacja niepodana',
  'common.unknownVolcano': 'Nieznany wulkan',
  'loading.title': 'Wczytujemy dane Smithsonian',
  'loading.body': 'Wczytujemy katalog wulkanów, historię erupcji i najnowszy raport tygodniowy.',
  'error.title': 'Nie udało się wczytać atlasu',
  'error.retry': 'Spróbuj ponownie',
  'error.http': 'Źródło Smithsonian zwróciło błąd HTTP {status}.',
  'error.timeout': 'Przekroczono czas oczekiwania na dane Smithsonian.',
  'error.network': 'Nie udało się połączyć ze źródłem Smithsonian.',
  'error.invalidGeoJson': 'Smithsonian zwrócił nieprawidłowy dokument GeoJSON.',
  'error.invalidRss': 'Smithsonian zwrócił nieprawidłowy dokument RSS.',
  'error.missingRssChannel': 'W dokumencie RSS brakuje kanału.',
  'error.generic': 'Nie udało się wczytać danych.',
  'dataset.volcanoes.one': 'wulkan',
  'dataset.volcanoes.few': 'wulkany',
  'dataset.volcanoes.many': 'wulkanów',
  'dataset.volcanoes.other': 'wulkana',
  'dataset.reports.one': 'raport',
  'dataset.reports.few': 'raporty',
  'dataset.reports.many': 'raportów',
  'dataset.reports.other': 'raportu',
  'dataset.credit': '© Dane GVP',
  'filters.mobileButton': 'Filtry',
  'filters.aria': 'Filtry wulkanów',
  'filters.heading': 'Eksploruj',
  'filters.close': 'Zamknij filtry',
  'filters.searchPlaceholder': 'Szukaj po nazwie…',
  'filters.clearSearch': 'Wyczyść wyszukiwanie',
  'filters.suggestions': 'Sugerowane wulkany',
  'filters.country': 'Kraj',
  'filters.allCountries': 'Wszystkie kraje',
  'filters.region': 'Region',
  'filters.allRegions': 'Wszystkie regiony',
  'filters.type': 'Typ wulkanu',
  'filters.allTypes': 'Wszystkie typy',
  'filters.lastEruption': 'Ostatnia erupcja',
  'filters.anyYear': 'Dowolny rok',
  'filters.since2000': 'Od 2000',
  'filters.before1800': 'Przed 1800',
  'filters.unknownYear': 'Rok nieznany',
  'filters.results.one': 'wynik',
  'filters.results.few': 'wyniki',
  'filters.results.many': 'wyników',
  'filters.results.other': 'wyniku',
  'filters.clear': 'Wyczyść',
  'filters.sources': 'ŹRÓDŁA',
  'filters.sourceNote': 'Dane wulkanologiczne: Smithsonian GVP. Podkład satelitarny: EOxCloudless / Copernicus Sentinel-2. Stan aplikacji w przeglądarce pozostaje wyłącznie w pamięci.',
  'map.emptyTitle': 'Brak wulkanów dla tych filtrów',
  'map.emptyBody': 'Zmień kryteria lub wyczyść filtry, aby wrócić do pełnego katalogu.',
  'map.clearFilters': 'Wyczyść filtry',
  'map.aria': 'Interaktywna satelitarna mapa wulkanów',
  'map.title': 'GLOB · WULKANY HOLOCEŃSKIE',
  'map.visible.one': 'widoczny',
  'map.visible.few': 'widoczne',
  'map.visible.many': 'widocznych',
  'map.visible.other': 'widocznego',
  'map.legend': 'Legenda mapy',
  'map.inReport': 'W raporcie',
  'map.remaining': 'Pozostałe',
  'map.lastEruption': 'ostatnia erupcja',
  'map.currentReport': 'W aktualnym raporcie',
  'reports.aria': 'Najnowsze raporty tygodniowe',
  'reports.bulletin': 'AKTUALNY BIULETYN',
  'reports.title': 'Tygodniowa aktywność',
  'reports.updated': 'Aktualizacja {date}',
  'reports.snapshot': 'Migawka danych z {date}',
  'reports.coverageTitle': 'To nie jest pełna lista aktywnych wulkanów.',
  'reports.coverageBody': 'Raport obejmuje wybrane istotne zmiany i aktywność spełniającą kryteria Smithsonian/USGS.',
  'reports.empty': 'W aktualnym kanale nie znaleziono raportów.',
  'reports.activity': 'Raport aktywności',
  'reports.currentWeek': 'Bieżący tydzień',
  'reports.showOnMap': 'Pokaż na mapie',
  'reports.unmatched': 'Nie dopasowano profilu',
  'reports.openAria': 'Otwórz raport {name} w Smithsonian',
  'reports.openRss': 'Otwórz źródłowy kanał RSS',
  'details.aria': 'Szczegóły wulkanu {name}',
  'details.close': 'Zamknij szczegóły',
  'details.currentReport': 'W AKTUALNYM RAPORCIE',
  'details.elevation': 'Wysokość',
  'details.noData': 'Brak danych',
  'details.lastEruption': 'Ostatnia erupcja',
  'details.coordinates': 'Współrzędne',
  'details.type': 'Typ',
  'details.region': 'Region',
  'details.tectonicSetting': 'Środowisko tektoniczne',
  'details.rockType': 'Główna skała',
  'details.summary': 'Opis geologiczny',
  'details.noSummary': 'Smithsonian nie udostępnia opisu geologicznego dla tego rekordu.',
  'details.eruptionHistory': 'Historia erupcji',
  'details.noEruptions': 'Brak rekordów erupcji powiązanych z numerem GVP.',
  'details.confirmedEruption': 'Erupcja potwierdzona',
  'details.missing': 'brak',
  'details.duration': 'Czas',
  'details.olderEruptions': 'Pokaż starsze erupcje',
  'details.photo': 'Zdjęcie: {credit}',
  'details.fullProfile': 'Pełny profil w Smithsonian GVP',
  'format.bce': '{year} p.n.e.',
  'format.notSpecified': 'Nie określono',
  'format.circa': 'ok. ',
  'format.uncertaintyYears': ' ± {years} lat',
  'format.lessThanYear': 'mniej niż rok (daty przybliżone)',
  'format.approxYears.one': 'około {count} roku',
  'format.approxYears.other': 'około {count} lat',
  'format.days.one': '{count} dzień',
  'format.days.other': '{count} dni',
  'format.approxMonths': 'około {count} mies.',
  'format.approxDecimalYears': 'około {count} lat',
  'format.unknownDate': 'data nieznana',
} as const

export type TranslationKey = keyof typeof pl

const en: Record<TranslationKey, string> = {
  'meta.description': 'Interactive atlas of Holocene volcanoes from the Smithsonian Global Volcanism Program',
  'language.label': 'Interface language',
  'language.polish': 'Polish',
  'language.english': 'English',
  'common.unknown': 'Unknown',
  'common.notSpecified': 'Not specified',
  'common.unknownCountry': 'Unknown country',
  'common.unknownLocation': 'Location not provided',
  'common.unknownVolcano': 'Unknown volcano',
  'loading.title': 'Loading Smithsonian data',
  'loading.body': 'Loading the volcano catalog, eruption history, and the latest weekly report.',
  'error.title': 'The explorer could not be loaded',
  'error.retry': 'Try again',
  'error.http': 'The Smithsonian source returned HTTP error {status}.',
  'error.timeout': 'The Smithsonian data request timed out.',
  'error.network': 'Could not connect to the Smithsonian source.',
  'error.invalidGeoJson': 'Smithsonian returned an invalid GeoJSON document.',
  'error.invalidRss': 'Smithsonian returned an invalid RSS document.',
  'error.missingRssChannel': 'The RSS document is missing its channel.',
  'error.generic': 'The data could not be loaded.',
  'dataset.volcanoes.one': 'volcano', 'dataset.volcanoes.few': 'volcanoes', 'dataset.volcanoes.many': 'volcanoes', 'dataset.volcanoes.other': 'volcanoes',
  'dataset.reports.one': 'report', 'dataset.reports.few': 'reports', 'dataset.reports.many': 'reports', 'dataset.reports.other': 'reports',
  'dataset.credit': '© GVP data',
  'filters.mobileButton': 'Filters', 'filters.aria': 'Volcano filters', 'filters.heading': 'Explore', 'filters.close': 'Close filters',
  'filters.searchPlaceholder': 'Search by name…', 'filters.clearSearch': 'Clear search', 'filters.suggestions': 'Suggested volcanoes',
  'filters.country': 'Country', 'filters.allCountries': 'All countries', 'filters.region': 'Region', 'filters.allRegions': 'All regions',
  'filters.type': 'Volcano type', 'filters.allTypes': 'All types', 'filters.lastEruption': 'Last eruption', 'filters.anyYear': 'Any year',
  'filters.since2000': 'Since 2000', 'filters.before1800': 'Before 1800', 'filters.unknownYear': 'Unknown year',
  'filters.results.one': 'result', 'filters.results.few': 'results', 'filters.results.many': 'results', 'filters.results.other': 'results',
  'filters.clear': 'Clear', 'filters.sources': 'SOURCES',
  'filters.sourceNote': 'Volcanological data: Smithsonian GVP. Satellite basemap: EOxCloudless / Copernicus Sentinel-2. Browser application state remains only in memory.',
  'map.emptyTitle': 'No volcanoes match these filters', 'map.emptyBody': 'Change the criteria or clear the filters to return to the full catalog.', 'map.clearFilters': 'Clear filters',
  'map.aria': 'Interactive satellite map of volcanoes', 'map.title': 'GLOBE · HOLOCENE VOLCANOES',
  'map.visible.one': 'visible', 'map.visible.few': 'visible', 'map.visible.many': 'visible', 'map.visible.other': 'visible',
  'map.legend': 'Map legend', 'map.inReport': 'In report', 'map.remaining': 'Others', 'map.lastEruption': 'last eruption', 'map.currentReport': 'In the current report',
  'reports.aria': 'Latest weekly reports', 'reports.bulletin': 'CURRENT BULLETIN', 'reports.title': 'Weekly activity', 'reports.updated': 'Updated {date}',
  'reports.snapshot': 'Data snapshot from {date}',
  'reports.coverageTitle': 'This is not a complete list of active volcanoes.',
  'reports.coverageBody': 'The report covers selected significant changes and activity that meets Smithsonian/USGS criteria.',
  'reports.empty': 'No reports were found in the current feed.', 'reports.activity': 'Activity report', 'reports.currentWeek': 'Current week',
  'reports.showOnMap': 'Show on map', 'reports.unmatched': 'No matching profile', 'reports.openAria': 'Open the {name} report at Smithsonian', 'reports.openRss': 'Open source RSS feed',
  'details.aria': '{name} volcano details', 'details.close': 'Close details', 'details.currentReport': 'IN CURRENT REPORT',
  'details.elevation': 'Elevation', 'details.noData': 'No data', 'details.lastEruption': 'Last eruption', 'details.coordinates': 'Coordinates',
  'details.type': 'Type', 'details.region': 'Region', 'details.tectonicSetting': 'Tectonic setting', 'details.rockType': 'Primary rock',
  'details.summary': 'Geological summary', 'details.noSummary': 'Smithsonian does not provide a geological summary for this record.',
  'details.eruptionHistory': 'Eruption history', 'details.noEruptions': 'No eruption records are linked to this GVP number.',
  'details.confirmedEruption': 'Confirmed eruption', 'details.missing': 'missing', 'details.duration': 'Duration',
  'details.olderEruptions': 'Show older eruptions', 'details.photo': 'Photo: {credit}', 'details.fullProfile': 'Full profile at Smithsonian GVP',
  'format.bce': '{year} BCE', 'format.notSpecified': 'Not specified', 'format.circa': 'c. ', 'format.uncertaintyYears': ' ± {years} years',
  'format.lessThanYear': 'less than one year (approximate dates)', 'format.approxYears.one': 'about {count} year', 'format.approxYears.other': 'about {count} years',
  'format.days.one': '{count} day', 'format.days.other': '{count} days', 'format.approxMonths': 'about {count} months',
  'format.approxDecimalYears': 'about {count} years', 'format.unknownDate': 'unknown date',
}

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { pl, en }
const intlLocales: Record<Locale, string> = { pl: 'pl-PL', en: 'en-US' }

export function translate(locale: Locale, key: TranslationKey, values: TranslationValues = {}) {
  return dictionaries[locale][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`))
}

type PluralBase = 'dataset.volcanoes' | 'dataset.reports' | 'filters.results' | 'map.visible'

interface I18nValue {
  locale: Locale
  intlLocale: string
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, values?: TranslationValues) => string
  plural: (base: PluralBase, count: number) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function initialLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('pl') ? 'pl' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  const value = useMemo<I18nValue>(() => ({
    locale,
    intlLocale: intlLocales[locale],
    setLocale,
    t: (key, values) => translate(locale, key, values),
    plural: (base, count) => {
      const category = new Intl.PluralRules(intlLocales[locale]).select(count)
      const key = `${base}.${category}` as TranslationKey
      return translate(locale, key in dictionaries[locale] ? key : `${base}.other` as TranslationKey)
    },
  }), [locale])

  useEffect(() => {
    document.documentElement.lang = locale
    document.querySelector('meta[name="description"]')?.setAttribute('content', value.t('meta.description'))
  }, [locale, value])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used within I18nProvider')
  return value
}
