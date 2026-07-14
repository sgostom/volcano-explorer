import { useCallback, useEffect, useState } from 'react'
import { fetchEruptions } from '../api/eruptions'
import { fetchWeeklyReports } from '../api/reports'
import { fetchVolcanoes } from '../api/volcanoes'
import type { ExplorerData } from '../models/smithsonian'
import { ExplorerError, type ExplorerErrorCode } from '../models/errors'
import { normalizeEruptions, normalizeVolcanoes } from '../normalizers/geojson'
import { joinSmithsonianData } from '../normalizers/join'
import { normalizeRss } from '../normalizers/rss'

type State =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: ExplorerData; error: null }
  | { status: 'error'; data: null; error: { code: ExplorerErrorCode; values: Record<string, string | number> } }

export function useExplorerData() {
  const [state, setState] = useState<State>({ status: 'loading', data: null, error: null })

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null })
    try {
      const [volcanoCollection, eruptionCollection, reportXml] = await Promise.all([
        fetchVolcanoes(),
        fetchEruptions(),
        fetchWeeklyReports(),
      ])
      const feed = normalizeRss(reportXml)
      const joined = joinSmithsonianData(
        normalizeVolcanoes(volcanoCollection),
        normalizeEruptions(eruptionCollection),
        feed.reports,
      )
      setState({
        status: 'success',
        error: null,
        data: {
          volcanoes: joined.volcanoes,
          reports: joined.reports,
          feedTitle: feed.title,
          feedDescription: feed.description,
          feedPublishedAt: feed.publishedAt,
        },
      })
    } catch (error) {
      setState({
        status: 'error',
        data: null,
        error: error instanceof ExplorerError ? { code: error.code, values: error.values } : { code: 'generic', values: {} },
      })
    }
  }, [])

  useEffect(() => { void load() }, [load])
  return { ...state, retry: load }
}
