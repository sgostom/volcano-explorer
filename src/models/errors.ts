export type ExplorerErrorCode = 'http' | 'timeout' | 'network' | 'invalidGeoJson' | 'invalidRss' | 'missingRssChannel' | 'generic'

export class ExplorerError extends Error {
  constructor(public readonly code: ExplorerErrorCode, public readonly values: Record<string, string | number> = {}) {
    super(code)
    this.name = 'ExplorerError'
  }
}
