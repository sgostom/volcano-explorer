import { getXml } from './client'

export const REPORT_SOURCE_URL = 'https://volcano.si.edu/news/WeeklyVolcanoRSS.xml'

export function fetchWeeklyReports() {
  return getXml('/smithsonian/rss')
}
