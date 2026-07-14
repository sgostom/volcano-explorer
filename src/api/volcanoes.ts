import { getJson } from './client'
import type { RawVolcanoProperties, WfsFeatureCollection } from '../models/smithsonian'

export const VOLCANO_SOURCE_URL = 'https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes&outputFormat=application/json'

export function fetchVolcanoes() {
  const url = import.meta.env.DEV
    ? '/smithsonian/volcanoes'
    : `${import.meta.env.BASE_URL}data/volcanoes.geojson`
  return getJson<WfsFeatureCollection<RawVolcanoProperties>>(url)
}
