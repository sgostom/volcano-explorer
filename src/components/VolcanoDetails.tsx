import { ArrowUpRight, CalendarDays, ChevronDown, Clock3, Gauge, MapPin, Mountain, X } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n'
import type { Volcano } from '../models/smithsonian'
import { formatCoordinates, formatDuration, formatEruptionDate, formatYear } from '../utils/format'

interface Props { volcano: Volcano; onClose: () => void }

export function VolcanoDetails({ volcano, onClose }: Props) {
  const { locale, intlLocale, t } = useI18n()
  const [visibleEruptions, setVisibleEruptions] = useState(8)
  const [photoFailed, setPhotoFailed] = useState(false)
  const profileUrl = `https://volcano.si.edu/volcano.cfm?vn=${volcano.number}`

  return (
    <section className="detail-drawer" role="dialog" aria-modal="true" aria-label={t('details.aria', { name: volcano.name })}>
      <button className="detail-close" onClick={onClose} aria-label={t('details.close')}><X size={20} /></button>
      <div className="detail-scroll">
        {volcano.photoUrl && <div className={`detail-photo${photoFailed ? ' detail-photo--failed' : ''}`}><img src={volcano.photoUrl} alt={volcano.photoCaption ?? volcano.name} referrerPolicy="no-referrer" onError={() => setPhotoFailed(true)} />{!photoFailed && <span>SMITHSONIAN GVP</span>}</div>}
        <div className="detail-content">
          <div className="detail-kicker">GVP #{volcano.number} {volcano.isInWeeklyReport && <b>{t('details.currentReport')}</b>}</div>
          <h2>{volcano.name}</h2>
          <p className="detail-location"><MapPin size={15} /> {volcano.country ?? t('common.unknownCountry')}{volcano.subregion ? ` · ${volcano.subregion}` : ''}</p>
          <div className="detail-stats">
            <div><Mountain size={17} /><span>{t('details.elevation')}</span><strong>{volcano.elevation !== null ? `${volcano.elevation.toLocaleString(intlLocale)} m` : t('details.noData')}</strong></div>
            <div><CalendarDays size={17} /><span>{t('details.lastEruption')}</span><strong>{formatYear(volcano.lastEruptionYear, locale)}</strong></div>
            <div><MapPin size={17} /><span>{t('details.coordinates')}</span><strong>{formatCoordinates(volcano.latitude, volcano.longitude)}</strong></div>
          </div>
          <dl className="facts">
            <div><dt>{t('details.type')}</dt><dd>{volcano.primaryType ?? t('common.notSpecified')}</dd></div>
            <div><dt>{t('details.region')}</dt><dd>{volcano.region ?? t('common.notSpecified')}</dd></div>
            <div><dt>{t('details.tectonicSetting')}</dt><dd>{volcano.tectonicSetting ?? t('common.notSpecified')}</dd></div>
            <div><dt>{t('details.rockType')}</dt><dd>{volcano.rockType ?? t('common.notSpecified')}</dd></div>
          </dl>
          <div className="detail-section">
            <h3>{t('details.summary')}</h3>
            <p>{volcano.geologicalSummary ?? t('details.noSummary')}</p>
          </div>
          <div className="detail-section eruptions-section">
            <div className="section-title"><h3>{t('details.eruptionHistory')}</h3><span>{volcano.eruptions.length}</span></div>
            {volcano.eruptions.length === 0 ? <div className="empty-compact">{t('details.noEruptions')}</div> : (
              <div className="eruption-list">
                {volcano.eruptions.slice(0, visibleEruptions).map((eruption) => (
                  <article className="eruption-row" key={eruption.id}>
                    <div className="eruption-timeline"><i /><span /></div>
                    <div className="eruption-body">
                      <div className="eruption-date">{formatEruptionDate(eruption.start, locale)} <span>— {formatEruptionDate(eruption.end, locale)}</span></div>
                      <p>{eruption.activityArea ?? eruption.activityUnit ?? eruption.activityType ?? t('details.confirmedEruption')}</p>
                      <div className="eruption-metrics">
                        <span><Gauge size={13} /> VEI <b>{eruption.vei !== null ? `${eruption.veiModifier ?? ''}${eruption.vei}` : t('details.missing')}</b></span>
                        <span><Clock3 size={13} /> {t('details.duration')} <b>{formatDuration(eruption, locale)}</b></span>
                      </div>
                    </div>
                  </article>
                ))}
                {visibleEruptions < volcano.eruptions.length && <button className="load-more" onClick={() => setVisibleEruptions((value) => value + 12)}>{t('details.olderEruptions')} <ChevronDown size={15} /></button>}
              </div>
            )}
          </div>
          {volcano.photoCredit && <p className="photo-credit">{t('details.photo', { credit: volcano.photoCredit })}</p>}
          <a className="profile-link" href={profileUrl} target="_blank" rel="noreferrer">{t('details.fullProfile')} <ArrowUpRight size={15} /></a>
        </div>
      </div>
    </section>
  )
}
