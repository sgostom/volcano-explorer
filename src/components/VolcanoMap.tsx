import { useEffect, useMemo, useRef } from 'react'
import maplibregl, { type GeoJSONSource, type StyleSpecification } from 'maplibre-gl'
import type { Volcano } from '../models/smithsonian'
import { formatYear } from '../utils/format'

interface Props {
  volcanoes: Volcano[]
  selected: Volcano | null
  onSelect: (volcano: Volcano) => void
}

const SATELLITE_TILES = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg'

const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  projection: { type: 'globe' },
  sources: {
    satellite: {
      type: 'raster',
      tiles: [SATELLITE_TILES],
      tileSize: 256,
      maxzoom: 14,
      attribution: '<a href="https://cloudless.eox.at" target="_blank">EOxCloudless</a> by EOX · modified Copernicus Sentinel data 2020',
    },
  },
  layers: [
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      paint: {
        'raster-saturation': -0.18,
        'raster-contrast': 0.16,
        'raster-brightness-max': 0.82,
      },
    },
  ],
  sky: {
    'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
  },
}

function volcanoFeatureCollection(volcanoes: Volcano[], selectedNumber: number | null): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: volcanoes.map((volcano) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [volcano.longitude, volcano.latitude] },
      properties: {
        number: volcano.number,
        isReport: volcano.isInWeeklyReport,
        selected: volcano.number === selectedNumber,
      },
    })),
  }
}

function tooltipContent(volcano: Volcano) {
  const content = document.createElement('div')
  content.className = 'volcano-tooltip'

  const name = document.createElement('strong')
  name.textContent = volcano.name
  content.append(name)

  const details = document.createElement('span')
  details.textContent = `${volcano.country ?? 'Kraj nieznany'} · ostatnia erupcja: ${formatYear(volcano.lastEruptionYear)}`
  content.append(details)

  if (volcano.isInWeeklyReport) {
    const report = document.createElement('em')
    report.textContent = 'W aktualnym raporcie'
    content.append(report)
  }

  return content
}

function ensureVolcanoLayers(
  map: maplibregl.Map,
  data: GeoJSON.FeatureCollection<GeoJSON.Point>,
) {
  let source = map.getSource('volcanoes') as GeoJSONSource | undefined

  if (!source) {
    map.addSource('volcanoes', { type: 'geojson', data })
    source = map.getSource('volcanoes') as GeoJSONSource
  } else {
    source.setData(data)
  }

  if (!map.getLayer('volcano-halo')) {
    map.addLayer({
      id: 'volcano-halo',
      type: 'circle',
      source: 'volcanoes',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 7, 5, 12],
        'circle-color': ['case', ['get', 'isReport'], '#ef5a32', '#ffc66d'],
        'circle-opacity': ['case', ['get', 'isReport'], 0.3, 0.18],
        'circle-blur': 0.45,
      },
    })
  }

  if (!map.getLayer('volcano-points')) {
    map.addLayer({
      id: 'volcano-points',
      type: 'circle',
      source: 'volcanoes',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          0, ['case', ['get', 'selected'], 10, ['get', 'isReport'], 7.5, 4],
          5, ['case', ['get', 'selected'], 10, ['get', 'isReport'], 9, 6],
        ],
        'circle-color': [
          'case',
          ['get', 'selected'], '#fff7df',
          ['get', 'isReport'], '#ef5a32',
          '#ffc66d',
        ],
        'circle-opacity': 0.96,
        'circle-stroke-color': [
          'case',
          ['get', 'selected'], '#ef5a32',
          ['get', 'isReport'], '#ffd2bd',
          '#fff7e8',
        ],
        'circle-stroke-width': ['case', ['get', 'selected'], 3, 1.25],
      },
    })
  }
}

export function VolcanoMap({ volcanoes, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const volcanoesRef = useRef(volcanoes)
  const onSelectRef = useRef(onSelect)
  const popupRef = useRef<maplibregl.Popup | null>(null)

  volcanoesRef.current = volcanoes
  onSelectRef.current = onSelect

  const data = useMemo(
    () => volcanoFeatureCollection(volcanoes, selected?.number ?? null),
    [selected?.number, volcanoes],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      center: [5, 15],
      zoom: 0.7,
      minZoom: 0,
      maxZoom: 9,
      renderWorldCopies: false,
      attributionControl: false,
      canvasContextAttributes: { antialias: true },
    })

    mapRef.current = map
    popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-left')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    const restoreLayers = () => {
      ensureVolcanoLayers(map, volcanoFeatureCollection(volcanoesRef.current, null))
    }
    map.on('load', restoreLayers)
    map.on('style.load', restoreLayers)

    return () => {
      map.off('load', restoreLayers)
      map.off('style.load', restoreLayers)
      popupRef.current?.remove()
      popupRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handleMouseEnter = (event: maplibregl.MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = 'pointer'
      const number = Number(event.features?.[0]?.properties?.number)
      const volcano = volcanoesRef.current.find((candidate) => candidate.number === number)
      if (!volcano) return
      popupRef.current
        ?.setLngLat([volcano.longitude, volcano.latitude])
        .setDOMContent(tooltipContent(volcano))
        .addTo(map)
    }
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
      popupRef.current?.remove()
    }
    const handleClick = (event: maplibregl.MapLayerMouseEvent) => {
      const number = Number(event.features?.[0]?.properties?.number)
      const volcano = volcanoesRef.current.find((candidate) => candidate.number === number)
      if (volcano) onSelectRef.current(volcano)
    }

    map.on('mouseenter', 'volcano-points', handleMouseEnter)
    map.on('mouseleave', 'volcano-points', handleMouseLeave)
    map.on('click', 'volcano-points', handleClick)

    return () => {
      map.off('mouseenter', 'volcano-points', handleMouseEnter)
      map.off('mouseleave', 'volcano-points', handleMouseLeave)
      map.off('click', 'volcano-points', handleClick)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    ensureVolcanoLayers(map, data)
  }, [data])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selected) return
    map.flyTo({
      center: [selected.longitude, selected.latitude],
      zoom: Math.max(map.getZoom(), 5),
      duration: 900,
    })
  }, [selected])

  return (
    <div className="map-shell" aria-label="Interaktywna satelitarna mapa wulkanów">
      <div ref={containerRef} className="map" />
      <div className="map-title">
        <span>GLOB · WULKANY HOLOCEŃSKIE</span>
        <b>{volcanoes.length.toLocaleString('pl-PL')} widocznych</b>
      </div>
      <div className="map-legend" aria-label="Legenda mapy">
        <span><i className="dot dot--report" /> W raporcie</span>
        <span><i className="dot" /> Pozostałe</span>
      </div>
    </div>
  )
}
