import { describe, expect, it } from 'vitest'
import type { RawEruptionProperties, RawVolcanoProperties, WfsFeature } from '../models/smithsonian'
import { compareEruptionsNewestFirst, normalizeEruptionFeature, normalizeVolcanoFeature } from './geojson'

describe('Smithsonian WFS normalization', () => {
  it('safely rejects a volcano record without a GVP number', () => {
    const feature = { type: 'Feature', properties: { Volcano_Name: 'Test' } } as unknown as WfsFeature<RawVolcanoProperties>
    expect(normalizeVolcanoFeature(feature)).toBeNull()
  })

  it('uses geometry coordinates when property fields are incomplete', () => {
    const feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [14.999, 37.748] },
      properties: { Volcano_Number: 211060, Volcano_Name: 'Etna' },
    } as unknown as WfsFeature<RawVolcanoProperties>
    expect(normalizeVolcanoFeature(feature)).toMatchObject({ number: 211060, latitude: 37.748, longitude: 14.999 })
  })

  it('preserves the actual VEI fields and date uncertainty', () => {
    const feature = {
      type: 'Feature',
      properties: {
        Volcano_Number: 211060,
        Volcano_Name: 'Etna',
        Eruption_Number: 123,
        ExplosivityIndexMax: 3,
        ExplosivityIndexModifier: '>=',
        StartDateYear: 1669,
        StartDateYearUncertainty: 1,
        StartDateMonth: 3,
        StartDateDay: 11,
      },
    } as unknown as WfsFeature<RawEruptionProperties>
    expect(normalizeEruptionFeature(feature)).toMatchObject({ vei: 3, veiModifier: '>=', start: { year: 1669, month: 3, day: 11, yearUncertainty: 1 } })
  })

  it('also sorts eruptions by month and day within the same year', () => {
    const base = {
      id: '1', volcanoNumber: 1, volcanoName: 'A', eruptionNumber: 1, activityType: null,
      vei: null, veiModifier: null, activityArea: null, activityUnit: null, startEvidenceMethod: null,
      end: { year: null, month: null, day: null, yearModifier: null, dayModifier: null, yearUncertainty: null, dayUncertainty: null },
    }
    const april = { ...base, start: { ...base.end, year: 2010, month: 4, day: 8 } }
    const august = { ...base, id: '2', start: { ...base.end, year: 2010, month: 8, day: 25 } }
    expect([april, august].sort(compareEruptionsNewestFirst).map((item) => item.id)).toEqual(['2', '1'])
  })
})
