import { ArrowUpRight, CalendarDays, ChevronDown, Clock3, Gauge, MapPin, Mountain, X } from 'lucide-react'
import { useState } from 'react'
import type { Volcano } from '../models/smithsonian'
import { formatCoordinates, formatDuration, formatEruptionDate, formatYear } from '../utils/format'

interface Props { volcano: Volcano; onClose: () => void }

export function VolcanoDetails({ volcano, onClose }: Props) {
  const [visibleEruptions, setVisibleEruptions] = useState(8)
  const [photoFailed, setPhotoFailed] = useState(false)
  const profileUrl = `https://volcano.si.edu/volcano.cfm?vn=${volcano.number}`

  return (
    <section className="detail-drawer" aria-label={`Szczegóły wulkanu ${volcano.name}`}>
      <button className="detail-close" onClick={onClose} aria-label="Zamknij szczegóły"><X size={20} /></button>
      {volcano.photoUrl && !photoFailed && <div className="detail-photo"><img src={volcano.photoUrl} alt={volcano.photoCaption ?? volcano.name} onError={() => setPhotoFailed(true)} /><span>SMITHSONIAN GVP</span></div>}
      <div className="detail-content">
        <div className="detail-kicker">GVP #{volcano.number} {volcano.isInWeeklyReport && <b>W AKTUALNYM RAPORCIE</b>}</div>
        <h2>{volcano.name}</h2>
        <p className="detail-location"><MapPin size={15} /> {volcano.country ?? 'Kraj nieznany'}{volcano.subregion ? ` · ${volcano.subregion}` : ''}</p>
        <div className="detail-stats">
          <div><Mountain size={17} /><span>Wysokość</span><strong>{volcano.elevation !== null ? `${volcano.elevation.toLocaleString('pl-PL')} m` : 'Brak danych'}</strong></div>
          <div><CalendarDays size={17} /><span>Ostatnia erupcja</span><strong>{formatYear(volcano.lastEruptionYear)}</strong></div>
          <div><MapPin size={17} /><span>Współrzędne</span><strong>{formatCoordinates(volcano.latitude, volcano.longitude)}</strong></div>
        </div>
        <dl className="facts">
          <div><dt>Typ</dt><dd>{volcano.primaryType ?? 'Nie określono'}</dd></div>
          <div><dt>Region</dt><dd>{volcano.region ?? 'Nie określono'}</dd></div>
          <div><dt>Środowisko tektoniczne</dt><dd>{volcano.tectonicSetting ?? 'Nie określono'}</dd></div>
          <div><dt>Główna skała</dt><dd>{volcano.rockType ?? 'Nie określono'}</dd></div>
        </dl>
        <div className="detail-section">
          <h3>Opis geologiczny</h3>
          <p>{volcano.geologicalSummary ?? 'Smithsonian nie udostępnia opisu geologicznego dla tego rekordu.'}</p>
        </div>
        <div className="detail-section eruptions-section">
          <div className="section-title"><h3>Historia erupcji</h3><span>{volcano.eruptions.length}</span></div>
          {volcano.eruptions.length === 0 ? <div className="empty-compact">Brak rekordów erupcji powiązanych z numerem GVP.</div> : (
            <div className="eruption-list">
              {volcano.eruptions.slice(0, visibleEruptions).map((eruption) => (
                <article className="eruption-row" key={eruption.id}>
                  <div className="eruption-timeline"><i /><span /></div>
                  <div className="eruption-body">
                    <div className="eruption-date">{formatEruptionDate(eruption.start)} <span>— {formatEruptionDate(eruption.end)}</span></div>
                    <p>{eruption.activityArea ?? eruption.activityUnit ?? eruption.activityType ?? 'Erupcja potwierdzona'}</p>
                    <div className="eruption-metrics">
                      <span><Gauge size={13} /> VEI <b>{eruption.vei !== null ? `${eruption.veiModifier ?? ''}${eruption.vei}` : 'brak'}</b></span>
                      <span><Clock3 size={13} /> Czas <b>{formatDuration(eruption)}</b></span>
                    </div>
                  </div>
                </article>
              ))}
              {visibleEruptions < volcano.eruptions.length && <button className="load-more" onClick={() => setVisibleEruptions((value) => value + 12)}>Pokaż starsze erupcje <ChevronDown size={15} /></button>}
            </div>
          )}
        </div>
        {volcano.photoCredit && <p className="photo-credit">Zdjęcie: {volcano.photoCredit}</p>}
        <a className="profile-link" href={profileUrl} target="_blank" rel="noreferrer">Pełny profil w Smithsonian GVP <ArrowUpRight size={15} /></a>
      </div>
    </section>
  )
}
