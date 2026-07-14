import { getJson } from './client'
import type { RawEruptionProperties, WfsFeatureCollection } from '../models/smithsonian'

export const ERUPTION_SOURCE_URL = 'https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Eruptions&outputFormat=application/json'

export function fetchEruptions() {
  const url = import.meta.env.DEV
    ? '/smithsonian/eruptions'
    : `${import.meta.env.BASE_URL}data/eruptions.geojson`
  return getJson<WfsFeatureCollection<RawEruptionProperties>>(url)
}
