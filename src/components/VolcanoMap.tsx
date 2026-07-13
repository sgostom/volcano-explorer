import { useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, Pane, Polyline, Tooltip, useMap } from 'react-leaflet'
import type { Volcano } from '../models/smithsonian'
import { formatYear } from '../utils/format'

interface Props {
  volcanoes: Volcano[]
  selected: Volcano | null
  onSelect: (volcano: Volcano) => void
}

function MapFocus({ volcano }: { volcano: Volcano | null }) {
  const map = useMap()
  useEffect(() => {
    if (volcano) map.flyTo([volcano.latitude, volcano.longitude], Math.max(map.getZoom(), 5), { duration: 0.8 })
  }, [map, volcano])
  return null
}

function WorldGrid() {
  const lines = useMemo(() => {
    const grid: [number, number][][] = []
    for (let latitude = -60; latitude <= 60; latitude += 30) grid.push([[-180, latitude], [180, latitude]].map(([lng, lat]) => [lat, lng]))
    for (let longitude = -180; longitude <= 180; longitude += 30) grid.push([[-80, longitude], [80, longitude]].map(([lat, lng]) => [lat, lng]))
    return grid
  }, [])
  return <Pane name="grid" style={{ zIndex: 210 }}>{lines.map((line, index) => <Polyline key={index} positions={line} pathOptions={{ color: '#ffffff', opacity: 0.075, weight: 1 }} />)}</Pane>
}

export function VolcanoMap({ volcanoes, selected, onSelect }: Props) {
  return (
    <div className="map-shell" aria-label="Interaktywna mapa wulkanów">
      <MapContainer
        center={[15, 5]}
        zoom={2}
        minZoom={2}
        maxZoom={9}
        zoomControl
        attributionControl={false}
        maxBounds={[[-85, -190], [85, 190]]}
        className="map"
      >
        <WorldGrid />
        <MapFocus volcano={selected} />
        {volcanoes.map((volcano) => {
          const isSelected = selected?.number === volcano.number
          return (
            <CircleMarker
              key={volcano.number}
              center={[volcano.latitude, volcano.longitude]}
              radius={isSelected ? 9 : volcano.isInWeeklyReport ? 7 : 4}
              pathOptions={{
                color: isSelected ? '#fff7df' : volcano.isInWeeklyReport ? '#ff9c72' : '#e5bc78',
                fillColor: volcano.isInWeeklyReport ? '#f15a32' : '#c58a42',
                fillOpacity: volcano.isInWeeklyReport ? 0.95 : 0.72,
                opacity: 1,
                weight: isSelected ? 3 : volcano.isInWeeklyReport ? 2 : 1,
              }}
              eventHandlers={{ click: () => onSelect(volcano) }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                <strong>{volcano.name}</strong>
                <span>{volcano.country ?? 'Kraj nieznany'} · ostatnia erupcja: {formatYear(volcano.lastEruptionYear)}</span>
                {volcano.isInWeeklyReport && <em>W aktualnym raporcie</em>}
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
      <div className="map-title">
        <span>ŚWIAT · WULKANY HOLOCEŃSKIE</span>
        <b>{volcanoes.length.toLocaleString('pl-PL')} widocznych</b>
      </div>
      <div className="map-legend" aria-label="Legenda mapy">
        <span><i className="dot dot--report" /> W raporcie</span>
        <span><i className="dot" /> Pozostałe</span>
      </div>
    </div>
  )
}
