import { getXml } from './client'

export const REPORT_SOURCE_URL = 'https://volcano.si.edu/news/WeeklyVolcanoRSS.xml'

export function fetchWeeklyReports() {
  const url = import.meta.env.DEV
    ? '/smithsonian/rss'
    : `${import.meta.env.BASE_URL}data/weekly-volcano-rss.xml`
  return getXml(url)
}
