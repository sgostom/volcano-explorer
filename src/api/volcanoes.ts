import { getJson } from './client'
import type { RawVolcanoProperties, WfsFeatureCollection } from '../models/smithsonian'

export const VOLCANO_SOURCE_URL = 'https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes&outputFormat=application/json'

export function fetchVolcanoes() {
  return getJson<WfsFeatureCollection<RawVolcanoProperties>>('/smithsonian/volcanoes')
}
