export type Nullable<T> = T | null

export interface PointGeometry {
  type: 'Point'
  coordinates: [number, number]
}

export interface WfsFeature<TProperties> {
  type: 'Feature'
  id?: string
  geometry?: PointGeometry | null
  geometry_name?: string
  properties?: TProperties | null
}

export interface WfsFeatureCollection<TProperties> {
  type: 'FeatureCollection'
  features: Array<WfsFeature<TProperties>>
}

// Field names match the current Smithsonian WFS response.
export interface RawVolcanoProperties {
  Volcano_Number: unknown
  Volcano_Name: unknown
  Volcanic_Landform: unknown
  Primary_Volcano_Type: unknown
  Last_Eruption_Year: unknown
  Country: unknown
  Region: unknown
  Subregion: unknown
  Geological_Summary: unknown
  Latitude: unknown
  Longitude: unknown
  Elevation: unknown
  Tectonic_Setting: unknown
  Geologic_Epoch: unknown
  Evidence_Category: unknown
  Primary_Photo_Link: unknown
  Primary_Photo_Caption: unknown
  Primary_Photo_Credit: unknown
  Major_Rock_Type: unknown
}

export interface RawEruptionProperties {
  Volcano_Number: unknown
  Volcano_Name: unknown
  Eruption_Number: unknown
  Activity_Type: unknown
  ExplosivityIndexMax: unknown
  ExplosivityIndexModifier: unknown
  ActivityArea: unknown
  ActivityUnit: unknown
  StartEvidenceMethod: unknown
  StartDateYearModifier: unknown
  StartDateYear: unknown
  StartDateYearUncertainty: unknown
  StartDateDayModifier: unknown
  StartDateMonth: unknown
  StartDateDay: unknown
  StartDateDayUncertainty: unknown
  EndDateYearModifier: unknown
  EndDateYear: unknown
  EndDateYearUncertainty: unknown
  EndDateDayModifier: unknown
  EndDateMonth: unknown
  EndDateDay: unknown
  EndDateDayUncertainty: unknown
}

export interface EruptionDateParts {
  year: number | null
  month: number | null
  day: number | null
  yearModifier: string | null
  dayModifier: string | null
  yearUncertainty: number | null
  dayUncertainty: number | null
}

export interface Eruption {
  id: string
  volcanoNumber: number
  volcanoName: string
  eruptionNumber: number | null
  activityType: string | null
  vei: number | null
  veiModifier: string | null
  activityArea: string | null
  activityUnit: string | null
  startEvidenceMethod: string | null
  start: EruptionDateParts
  end: EruptionDateParts
}

export interface Volcano {
  id: string
  number: number
  name: string
  latitude: number
  longitude: number
  elevation: number | null
  country: string | null
  region: string | null
  subregion: string | null
  primaryType: string | null
  landform: string | null
  lastEruptionYear: number | null
  geologicalSummary: string | null
  tectonicSetting: string | null
  evidenceCategory: string | null
  rockType: string | null
  photoUrl: string | null
  photoCaption: string | null
  photoCredit: string | null
  eruptions: Eruption[]
  isInWeeklyReport: boolean
}

export interface WeeklyReport {
  id: string
  gvpNumber: number | null
  volcanoName: string
  country: string | null
  reportRange: string | null
  activityLabel: string | null
  descriptionHtml: string
  descriptionText: string
  sourceText: string | null
  link: string
  publishedAt: string | null
  latitude: number | null
  longitude: number | null
  matchedVolcanoNumber: number | null
  matchMethod: 'gvp-number' | 'normalized-name' | null
}

export interface WeeklyFeed {
  title: string
  description: string
  publishedAt: string | null
  reports: WeeklyReport[]
}

export interface ExplorerData {
  volcanoes: Volcano[]
  reports: WeeklyReport[]
  feedTitle: string
  feedDescription: string
  feedPublishedAt: string | null
  snapshotFetchedAt: string | null
}
