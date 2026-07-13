import type { WeeklyFeed, WeeklyReport } from '../models/smithsonian'
import { asFiniteNumber } from './primitives'

function text(element: Element | null, selector: string): string {
  return element?.querySelector(selector)?.textContent?.trim() ?? ''
}

function firstLineMatch(title: string): { name: string; country: string | null; range: string | null; activity: string | null } {
  // Separatory części tytułu mają otaczające spacje; łącznik w zakresie dat (np. 2 July-8 July) ich nie ma.
  const match = title.match(/^(.+?)\s+\((.+?)\)\s+[-–]\s+Report for\s+(.+?)\s+[-–]\s+(.+)$/i)
  if (!match) {
    return { name: title.split(' - ')[0]?.trim() || 'Nieznany wulkan', country: null, range: null, activity: null }
  }
  return { name: match[1].trim(), country: match[2].trim(), range: match[3].trim(), activity: match[4].trim() }
}

function gvpNumberFromGuid(guid: string): number | null {
  const match = guid.match(/(?:#|[?&])vn[_=](\d{5,7})\b/i)
  return match ? Number(match[1]) : null
}

function plainTextFromHtml(html: string): string {
  const document = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  return document.body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

function sourceFromHtml(html: string): string | null {
  const document = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const paragraphs = [...document.querySelectorAll('p')]
  const source = paragraphs.map((paragraph) => paragraph.textContent?.trim() ?? '').find((value) => /^Sources?:/i.test(value))
  return source?.replace(/^Sources?:\s*/i, '').trim() || null
}

function safeDate(value: string): string | null {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

function normalizeItem(item: Element, index: number): WeeklyReport {
  const title = text(item, 'title')
  const guid = text(item, 'guid')
  const parsed = firstLineMatch(title)
  const point = text(item, 'point').split(/\s+/).map(Number)
  const descriptionHtml = text(item, 'description')
  const gvpNumber = gvpNumberFromGuid(guid)

  return {
    id: guid || `${title}-${index}`,
    gvpNumber,
    volcanoName: parsed.name,
    country: parsed.country,
    reportRange: parsed.range,
    activityLabel: parsed.activity,
    descriptionHtml,
    descriptionText: plainTextFromHtml(descriptionHtml).replace(/\s*Sources?:.*$/i, '').trim(),
    sourceText: sourceFromHtml(descriptionHtml),
    link: guid || text(item, 'link') || 'https://volcano.si.edu/reports_weekly.cfm',
    publishedAt: safeDate(text(item, 'pubDate')),
    latitude: point.length === 2 ? asFiniteNumber(point[0]) : null,
    longitude: point.length === 2 ? asFiniteNumber(point[1]) : null,
    matchedVolcanoNumber: null,
    matchMethod: null,
  }
}

export function normalizeRss(xml: string): WeeklyFeed {
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  if (document.querySelector('parsererror')) throw new Error('Nieprawidłowy dokument RSS')
  const channel = document.querySelector('channel')
  if (!channel) throw new Error('Brak kanału RSS')

  return {
    title: text(channel, ':scope > title'),
    description: text(channel, ':scope > description'),
    publishedAt: safeDate(text(channel, ':scope > pubDate')),
    reports: [...channel.querySelectorAll(':scope > item')].map(normalizeItem),
  }
}
