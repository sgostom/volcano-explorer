import { Activity, ArrowUpRight, Clock3, Radio, Unlink } from 'lucide-react'
import type { Volcano, WeeklyReport } from '../models/smithsonian'
import { useI18n } from '../i18n'
import { formatPublished } from '../utils/format'
import { REPORT_SOURCE_URL } from '../api/reports'

interface Props {
  reports: WeeklyReport[]
  publishedAt: string | null
  snapshotFetchedAt: string | null
  onSelectVolcano: (volcano: Volcano) => void
  volcanoesByNumber: Map<number, Volcano>
}

export function ReportsPanel({ reports, publishedAt, snapshotFetchedAt, onSelectVolcano, volcanoesByNumber }: Props) {
  const { locale, t } = useI18n()
  return (
    <aside id="weekly-reports" className="reports-panel" aria-label={t('reports.aria')} tabIndex={-1}>
      <div className="reports-header">
        <div className="eyebrow"><Radio size={14} /> {t('reports.bulletin')}</div>
        <h2>{t('reports.title')}</h2>
        <p><Clock3 size={13} /> {t('reports.updated', { date: formatPublished(publishedAt, locale) })}</p>
        {snapshotFetchedAt && <p><Clock3 size={13} /> {t('reports.snapshot', { date: formatPublished(snapshotFetchedAt, locale) })}</p>}
      </div>
      <div className="coverage-note">
        <Activity size={18} />
        <p><strong>{t('reports.coverageTitle')}</strong> {t('reports.coverageBody')}</p>
      </div>
      <div className="report-list">
        {reports.length === 0 ? <div className="empty-compact">{t('reports.empty')}</div> : reports.map((report) => {
          const volcano = report.matchedVolcanoNumber ? volcanoesByNumber.get(report.matchedVolcanoNumber) : null
          return (
            <article key={report.id} className="report-card">
              <div className="report-card__meta"><span>{report.activityLabel ?? t('reports.activity')}</span><span>{report.reportRange ?? t('reports.currentWeek')}</span></div>
              <h3>{report.volcanoName || t('common.unknownVolcano')}</h3>
              <p className="report-country">{report.country ?? t('common.unknownLocation')}</p>
              <p className="report-excerpt">{report.descriptionText}</p>
              <div className="report-actions">
                {volcano ? <button onClick={() => onSelectVolcano(volcano)}>{t('reports.showOnMap')}</button> : <span className="unmatched"><Unlink size={12} /> {t('reports.unmatched')}</span>}
                <a href={report.link} target="_blank" rel="noreferrer" aria-label={t('reports.openAria', { name: report.volcanoName || t('common.unknownVolcano') })}><ArrowUpRight size={16} /></a>
              </div>
            </article>
          )
        })}
      </div>
      <a className="source-link" href={REPORT_SOURCE_URL} target="_blank" rel="noreferrer">{t('reports.openRss')} <ArrowUpRight size={14} /></a>
    </aside>
  )
}
