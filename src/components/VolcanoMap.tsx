import { useEffect, useMemo, useRef } from 'react'
import type { FeatureCollection, Point } from 'geojson'
import maplibregl, { type GeoJSONSource, type StyleSpecification } from 'maplibre-gl'
import { useI18n, type Locale, type TranslationKey, type TranslationValues } from '../i18n'
import type { Volcano } from '../models/smithsonian'
import { formatYear } from '../utils/format'

interface Props {
  volcanoes: Volcano[]
  selected: Volcano | null
  filtersActive: boolean
  searchTerm: string
  onSelect: (volcano: Volcano) => void
}

const SATELLITE_TILES = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg'
const DEFAULT_CENTER: [number, number] = [5, 15]
const DEFAULT_ZOOM = 2
const SEARCH_CAMERA_DEBOUNCE_MS = 450

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

function volcanoFeatureCollection(volcanoes: Volcano[], selectedNumber: number | null): FeatureCollection<Point> {
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

function tooltipContent(volcano: Volcano, locale: Locale, t: (key: TranslationKey, values?: TranslationValues) => string) {
  const content = document.createElement('div')
  content.className = 'volcano-tooltip'

  const name = document.createElement('strong')
  name.textContent = volcano.name
  content.append(name)

  const details = document.createElement('span')
  details.textContent = `${volcano.country ?? t('common.unknownCountry')} · ${t('map.lastEruption')}: ${formatYear(volcano.lastEruptionYear, locale)}`
  content.append(details)

  if (volcano.isInWeeklyReport) {
    const report = document.createElement('em')
    report.textContent = t('map.currentReport')
    content.append(report)
  }

  return content
}

function ensureVolcanoLayers(
  map: maplibregl.Map,
  data: FeatureCollection<Point>,
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

function getVolcanoBounds(volcanoes: Volcano[]) {
  const longitudes = volcanoes.map((volcano) => volcano.longitude).sort((a, b) => a - b)
  let largestGap = -1
  let startIndex = 0

  for (let index = 0; index < longitudes.length; index += 1) {
    const current = longitudes[index]
    const next = index === longitudes.length - 1 ? longitudes[0] + 360 : longitudes[index + 1]
    const gap = next - current
    if (gap > largestGap) {
      largestGap = gap
      startIndex = (index + 1) % longitudes.length
    }
  }

  const west = longitudes[startIndex]
  const bounds = new maplibregl.LngLatBounds()
  volcanoes.forEach((volcano) => {
    const longitude = volcano.longitude < west ? volcano.longitude + 360 : volcano.longitude
    bounds.extend([longitude, volcano.latitude])
  })
  return bounds
}

function updateViewport(map: maplibregl.Map, volcanoes: Volcano[], filtersActive: boolean, animate = true) {
  const duration = animate ? 850 : 0

  if (!filtersActive) {
    map.easeTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, bearing: 0, pitch: 0, duration })
    return
  }

  if (volcanoes.length === 1) {
    map.flyTo({
      center: [volcanoes[0].longitude, volcanoes[0].latitude],
      zoom: 5.5,
      bearing: 0,
      pitch: 0,
      duration,
    })
    return
  }

  if (volcanoes.length > 1) {
    map.fitBounds(getVolcanoBounds(volcanoes), {
      padding: { top: 85, right: 70, bottom: 85, left: 70 },
      maxZoom: 5.5,
      duration,
    })
  }
}

export function VolcanoMap({ volcanoes, selected, filtersActive, searchTerm, onSelect }: Props) {
  const { locale, intlLocale, t, plural } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const volcanoesRef = useRef(volcanoes)
  const filtersActiveRef = useRef(filtersActive)
  const onSelectRef = useRef(onSelect)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const localeRef = useRef(locale)
  const tRef = useRef(t)

  volcanoesRef.current = volcanoes
  filtersActiveRef.current = filtersActive
  onSelectRef.current = onSelect
  localeRef.current = locale
  tRef.current = t

  const data = useMemo(
    () => volcanoFeatureCollection(volcanoes, selected?.number ?? null),
    [selected?.number, volcanoes],
  )
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: DEFAULT_ZOOM,
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
      ensureVolcanoLayers(map, dataRef.current)
      updateViewport(map, volcanoesRef.current, filtersActiveRef.current, false)
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
        .setDOMContent(tooltipContent(volcano, localeRef.current, tRef.current))
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
    if (!map) return

    const delay = searchTerm.trim() ? SEARCH_CAMERA_DEBOUNCE_MS : 0
    const timeout = window.setTimeout(() => {
      updateViewport(map, volcanoes, filtersActive)
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [filtersActive, searchTerm, volcanoes])

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
    <div className="map-shell" aria-label={t('map.aria')}>
      <div ref={containerRef} className="map" />
      <div className="map-title">
        <span>{t('map.title')}</span>
        <b>{volcanoes.length.toLocaleString(intlLocale)} {plural('map.visible', volcanoes.length)}</b>
      </div>
      <div className="map-legend" aria-label={t('map.legend')}>
        <span><i className="dot dot--report" /> {t('map.inReport')}</span>
        <span><i className="dot" /> {t('map.remaining')}</span>
      </div>
    </div>
  )
}
