import { describe, expect, it } from 'vitest'
import type { Volcano, WeeklyReport } from '../models/smithsonian'
import { joinSmithsonianData } from './join'

const volcano = (number: number, name: string): Volcano => ({
  id: String(number), number, name, latitude: 0, longitude: 0, elevation: null, country: null,
  region: null, subregion: null, primaryType: null, landform: null, lastEruptionYear: null,
  geologicalSummary: null, tectonicSetting: null, evidenceCategory: null, rockType: null,
  photoUrl: null, photoCaption: null, photoCredit: null, eruptions: [], isInWeeklyReport: false,
})

const report = (gvpNumber: number | null, name: string): WeeklyReport => ({
  id: name, gvpNumber, volcanoName: name, country: null, reportRange: null, activityLabel: null,
  descriptionHtml: '', descriptionText: '', sourceText: null, link: '', publishedAt: null,
  latitude: null, longitude: null, matchedVolcanoNumber: null, matchMethod: null,
})

describe('joining Smithsonian records', () => {
  it('prefers the GVP number over the name', () => {
    const result = joinSmithsonianData([volcano(211060, 'Etna')], [], [report(211060, 'Inna nazwa')])
    expect(result.reports[0]).toMatchObject({ matchedVolcanoNumber: 211060, matchMethod: 'gvp-number' })
  })

  it('carefully matches an unambiguous normalized name', () => {
    const result = joinSmithsonianData([volcano(1, 'Mount Café')], [], [report(null, 'Cafe volcano')])
    expect(result.reports[0]).toMatchObject({ matchedVolcanoNumber: 1, matchMethod: 'normalized-name' })
  })

  it('does not match an ambiguous name', () => {
    const result = joinSmithsonianData([volcano(1, 'Alpha'), volcano(2, 'Alpha volcano')], [], [report(null, 'Alpha')])
    expect(result.reports[0].matchedVolcanoNumber).toBeNull()
  })
})
