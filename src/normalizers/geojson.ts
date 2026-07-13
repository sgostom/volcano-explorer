import type {
  Eruption,
  EruptionDateParts,
  RawEruptionProperties,
  RawVolcanoProperties,
  Volcano,
  WfsFeature,
  WfsFeatureCollection,
} from '../models/smithsonian'
import { asFiniteNumber, asInteger, asString } from './primitives'

function emptyDate(): EruptionDateParts {
  return { year: null, month: null, day: null, yearModifier: null, dayModifier: null, yearUncertainty: null, dayUncertainty: null }
}

function normalizeDate(properties: RawEruptionProperties, prefix: 'Start' | 'End'): EruptionDateParts {
  return {
    year: asInteger(properties[`${prefix}DateYear`]),
    month: normalizeMonthDay(properties[`${prefix}DateMonth`], 1, 12),
    day: normalizeMonthDay(properties[`${prefix}DateDay`], 1, 31),
    yearModifier: asString(properties[`${prefix}DateYearModifier`]),
    dayModifier: asString(properties[`${prefix}DateDayModifier`]),
    yearUncertainty: asInteger(properties[`${prefix}DateYearUncertainty`]),
    dayUncertainty: asInteger(properties[`${prefix}DateDayUncertainty`]),
  }
}

function normalizeMonthDay(value: unknown, min: number, max: number): number | null {
  const parsed = asInteger(value)
  return parsed !== null && parsed >= min && parsed <= max ? parsed : null
}

export function normalizeEruptionFeature(feature: WfsFeature<RawEruptionProperties>): Eruption | null {
  const properties = feature.properties
  if (!properties) return null
  const volcanoNumber = asInteger(properties.Volcano_Number)
  const volcanoName = asString(properties.Volcano_Name)
  if (volcanoNumber === null || volcanoName === null) return null
  const eruptionNumber = asInteger(properties.Eruption_Number)

  return {
    id: eruptionNumber !== null ? String(eruptionNumber) : feature.id ?? `${volcanoNumber}-${asInteger(properties.StartDateYear) ?? 'unknown'}`,
    volcanoNumber,
    volcanoName,
    eruptionNumber,
    activityType: asString(properties.Activity_Type),
    vei: asFiniteNumber(properties.ExplosivityIndexMax),
    veiModifier: asString(properties.ExplosivityIndexModifier),
    activityArea: asString(properties.ActivityArea),
    activityUnit: asString(properties.ActivityUnit),
    startEvidenceMethod: asString(properties.StartEvidenceMethod),
    start: normalizeDate(properties, 'Start'),
    end: normalizeDate(properties, 'End'),
  }
}

export function normalizeEruptions(collection: WfsFeatureCollection<RawEruptionProperties>): Eruption[] {
  if (!collection || !Array.isArray(collection.features)) return []
  return collection.features
    .map(normalizeEruptionFeature)
    .filter((eruption): eruption is Eruption => eruption !== null)
    .sort(compareEruptionsNewestFirst)
}

export function compareEruptionsNewestFirst(a: Eruption, b: Eruption): number {
  const value = (date: EruptionDateParts) => date.year === null
    ? Number.NEGATIVE_INFINITY
    : date.year * 400 + (date.month ?? 0) * 32 + (date.day ?? 0)
  return value(b.start) - value(a.start)
}

export function normalizeVolcanoFeature(feature: WfsFeature<RawVolcanoProperties>): Volcano | null {
  const properties = feature.properties
  if (!properties) return null
  const number = asInteger(properties.Volcano_Number)
  const name = asString(properties.Volcano_Name)
  const geometryCoordinates = feature.geometry?.type === 'Point' ? feature.geometry.coordinates : null
  const longitude = asFiniteNumber(properties.Longitude) ?? asFiniteNumber(geometryCoordinates?.[0])
  const latitude = asFiniteNumber(properties.Latitude) ?? asFiniteNumber(geometryCoordinates?.[1])

  if (number === null || name === null || latitude === null || longitude === null || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null

  return {
    id: feature.id ?? String(number),
    number,
    name,
    latitude,
    longitude,
    elevation: asFiniteNumber(properties.Elevation),
    country: asString(properties.Country),
    region: asString(properties.Region),
    subregion: asString(properties.Subregion),
    primaryType: asString(properties.Primary_Volcano_Type),
    landform: asString(properties.Volcanic_Landform),
    lastEruptionYear: asInteger(properties.Last_Eruption_Year),
    geologicalSummary: asString(properties.Geological_Summary),
    tectonicSetting: asString(properties.Tectonic_Setting),
    evidenceCategory: asString(properties.Evidence_Category),
    rockType: asString(properties.Major_Rock_Type),
    photoUrl: asString(properties.Primary_Photo_Link),
    photoCaption: asString(properties.Primary_Photo_Caption),
    photoCredit: asString(properties.Primary_Photo_Credit),
    eruptions: [],
    isInWeeklyReport: false,
  }
}

export function normalizeVolcanoes(collection: WfsFeatureCollection<RawVolcanoProperties>): Volcano[] {
  if (!collection || !Array.isArray(collection.features)) return []
  return collection.features.map(normalizeVolcanoFeature).filter((volcano): volcano is Volcano => volcano !== null)
}

export function blankEruptionDate(): EruptionDateParts {
  return emptyDate()
}
