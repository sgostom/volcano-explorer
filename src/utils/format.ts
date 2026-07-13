import type { Eruption, EruptionDateParts } from '../models/smithsonian'

const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']

export function formatYear(year: number | null): string {
  if (year === null) return 'Nieznany'
  return year < 0 ? `${Math.abs(year)} p.n.e.` : `${year}`
}

export function formatEruptionDate(date: EruptionDateParts): string {
  if (date.year === null) return 'Nie określono'
  const year = formatYear(date.year)
  const month = date.month ? MONTHS[date.month - 1] : null
  const day = date.day ?? null
  const uncertainty = date.yearUncertainty ? ` ± ${date.yearUncertainty} lat` : ''
  const modifier = date.yearModifier === '?' ? 'ok. ' : date.yearModifier ? `${date.yearModifier} ` : ''
  return `${modifier}${[day, month, year].filter(Boolean).join(' ')}${uncertainty}`
}

function utcDate(date: EruptionDateParts): number | null {
  if (date.year === null || date.year <= 0) return null
  return Date.UTC(date.year, (date.month ?? 1) - 1, date.day ?? 1)
}

export function formatDuration(eruptions: Eruption): string {
  const start = utcDate(eruptions.start)
  const end = utcDate(eruptions.end)
  if (start === null || end === null || end < start) {
    if (eruptions.start.year !== null && eruptions.end.year !== null && eruptions.end.year >= eruptions.start.year) {
      const years = eruptions.end.year - eruptions.start.year
      return years === 0 ? 'mniej niż rok (daty przybliżone)' : `około ${years} ${years === 1 ? 'roku' : 'lat'}`
    }
    return 'Nie określono'
  }
  const days = Math.max(1, Math.round((end - start) / 86_400_000) + 1)
  if (days < 31) return `${days} ${days === 1 ? 'dzień' : 'dni'}`
  if (days < 730) return `około ${Math.round(days / 30.44)} mies.`
  return `około ${(days / 365.25).toFixed(1).replace('.0', '')} lat`
}

export function formatPublished(value: string | null): string {
  if (!value) return 'data nieznana'
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(3)}°${latitude >= 0 ? 'N' : 'S'}`
  const lng = `${Math.abs(longitude).toFixed(3)}°${longitude >= 0 ? 'E' : 'W'}`
  return `${lat} · ${lng}`
}
