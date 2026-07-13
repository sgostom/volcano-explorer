import type { Eruption, Volcano, WeeklyReport } from '../models/smithsonian'
import { compareEruptionsNewestFirst } from './geojson'
import { normalizeName } from './primitives'

export function joinSmithsonianData(volcanoes: Volcano[], eruptions: Eruption[], reports: WeeklyReport[]): { volcanoes: Volcano[]; reports: WeeklyReport[] } {
  const eruptionsByVolcano = new Map<number, Eruption[]>()
  for (const eruption of eruptions) {
    const group = eruptionsByVolcano.get(eruption.volcanoNumber) ?? []
    group.push(eruption)
    eruptionsByVolcano.set(eruption.volcanoNumber, group)
  }

  const volcanoByNumber = new Map(volcanoes.map((volcano) => [volcano.number, volcano]))
  const volcanoesByName = new Map<string, Volcano[]>()
  for (const volcano of volcanoes) {
    const key = normalizeName(volcano.name)
    if (!key) continue
    volcanoesByName.set(key, [...(volcanoesByName.get(key) ?? []), volcano])
  }

  const matchedReports = reports.map((report) => {
    if (report.gvpNumber !== null && volcanoByNumber.has(report.gvpNumber)) {
      return { ...report, matchedVolcanoNumber: report.gvpNumber, matchMethod: 'gvp-number' as const }
    }
    const candidates = volcanoesByName.get(normalizeName(report.volcanoName)) ?? []
    if (candidates.length === 1) {
      return { ...report, matchedVolcanoNumber: candidates[0].number, matchMethod: 'normalized-name' as const }
    }
    return report
  })

  const reportedNumbers = new Set(matchedReports.flatMap((report) => report.matchedVolcanoNumber === null ? [] : [report.matchedVolcanoNumber]))

  return {
    volcanoes: volcanoes.map((volcano) => ({
      ...volcano,
      eruptions: (eruptionsByVolcano.get(volcano.number) ?? []).sort(compareEruptionsNewestFirst),
      isInWeeklyReport: reportedNumbers.has(volcano.number),
    })),
    reports: matchedReports,
  }
}
