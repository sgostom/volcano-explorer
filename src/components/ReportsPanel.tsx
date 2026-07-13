import { Activity, ArrowUpRight, Clock3, Radio, Unlink } from 'lucide-react'
import type { Volcano, WeeklyReport } from '../models/smithsonian'
import { formatPublished } from '../utils/format'
import { REPORT_SOURCE_URL } from '../api/reports'

interface Props {
  reports: WeeklyReport[]
  publishedAt: string | null
  onSelectVolcano: (volcano: Volcano) => void
  volcanoesByNumber: Map<number, Volcano>
}

export function ReportsPanel({ reports, publishedAt, onSelectVolcano, volcanoesByNumber }: Props) {
  return (
    <aside className="reports-panel" aria-label="Najnowsze raporty tygodniowe">
      <div className="reports-header">
        <div className="eyebrow"><Radio size={14} /> AKTUALNY BIULETYN</div>
        <h2>Tygodniowa aktywność</h2>
        <p><Clock3 size={13} /> Aktualizacja {formatPublished(publishedAt)}</p>
      </div>
      <div className="coverage-note">
        <Activity size={18} />
        <p><strong>To nie jest pełna lista aktywnych wulkanów.</strong> Raport obejmuje wybrane istotne zmiany i aktywność spełniającą kryteria Smithsonian/USGS.</p>
      </div>
      <div className="report-list">
        {reports.length === 0 ? <div className="empty-compact">W aktualnym kanale nie znaleziono raportów.</div> : reports.map((report) => {
          const volcano = report.matchedVolcanoNumber ? volcanoesByNumber.get(report.matchedVolcanoNumber) : null
          return (
            <article key={report.id} className="report-card">
              <div className="report-card__meta"><span>{report.activityLabel ?? 'Raport aktywności'}</span><span>{report.reportRange ?? 'Bieżący tydzień'}</span></div>
              <h3>{report.volcanoName}</h3>
              <p className="report-country">{report.country ?? 'Lokalizacja niepodana'}</p>
              <p className="report-excerpt">{report.descriptionText}</p>
              <div className="report-actions">
                {volcano ? <button onClick={() => onSelectVolcano(volcano)}>Pokaż na mapie</button> : <span className="unmatched"><Unlink size={12} /> Nie dopasowano profilu</span>}
                <a href={report.link} target="_blank" rel="noreferrer" aria-label={`Otwórz raport ${report.volcanoName} w Smithsonian`}><ArrowUpRight size={16} /></a>
              </div>
            </article>
          )
        })}
      </div>
      <a className="source-link" href={REPORT_SOURCE_URL} target="_blank" rel="noreferrer">Otwórz źródłowy kanał RSS <ArrowUpRight size={14} /></a>
    </aside>
  )
}
