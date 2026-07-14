import type { Eruption, EruptionDateParts } from '../models/smithsonian'
import { translate, type Locale } from '../i18n'

const intlLocales: Record<Locale, string> = { pl: 'pl-PL', en: 'en-US' }

export function formatYear(year: number | null, locale: Locale): string {
  if (year === null) return translate(locale, 'common.unknown')
  return year < 0 ? translate(locale, 'format.bce', { year: Math.abs(year) }) : `${year}`
}

export function formatEruptionDate(date: EruptionDateParts, locale: Locale): string {
  if (date.year === null) return translate(locale, 'format.notSpecified')
  const year = formatYear(date.year, locale)
  const month = date.month
    ? new Intl.DateTimeFormat(intlLocales[locale], { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, date.month - 1, 1))).replace('.', '')
    : null
  const day = date.day ?? null
  const uncertainty = date.yearUncertainty ? translate(locale, 'format.uncertaintyYears', { years: date.yearUncertainty }) : ''
  const modifier = date.yearModifier === '?' ? translate(locale, 'format.circa') : date.yearModifier ? `${date.yearModifier} ` : ''
  return `${modifier}${[day, month, year].filter(Boolean).join(' ')}${uncertainty}`
}

function utcDate(date: EruptionDateParts): number | null {
  if (date.year === null || date.year <= 0) return null
  return Date.UTC(date.year, (date.month ?? 1) - 1, date.day ?? 1)
}

export function formatDuration(eruption: Eruption, locale: Locale): string {
  const start = utcDate(eruption.start)
  const end = utcDate(eruption.end)
  if (start === null || end === null || end < start) {
    if (eruption.start.year !== null && eruption.end.year !== null && eruption.end.year >= eruption.start.year) {
      const years = eruption.end.year - eruption.start.year
      return years === 0
        ? translate(locale, 'format.lessThanYear')
        : translate(locale, years === 1 ? 'format.approxYears.one' : 'format.approxYears.other', { count: years })
    }
    return translate(locale, 'format.notSpecified')
  }
  const days = Math.max(1, Math.round((end - start) / 86_400_000) + 1)
  if (days < 31) return translate(locale, days === 1 ? 'format.days.one' : 'format.days.other', { count: days })
  if (days < 730) return translate(locale, 'format.approxMonths', { count: Math.round(days / 30.44) })
  const years = Number((days / 365.25).toFixed(1))
  return translate(locale, 'format.approxDecimalYears', { count: years.toLocaleString(intlLocales[locale]) })
}

export function formatPublished(value: string | null, locale: Locale): string {
  if (!value) return translate(locale, 'format.unknownDate')
  return new Intl.DateTimeFormat(intlLocales[locale], { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(3)}°${latitude >= 0 ? 'N' : 'S'}`
  const lng = `${Math.abs(longitude).toFixed(3)}°${longitude >= 0 ? 'E' : 'W'}`
  return `${lat} · ${lng}`
}
