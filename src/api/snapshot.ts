import { getJson } from './client'

interface RawDataManifest {
  fetchedAt?: unknown
}

export async function fetchSnapshotTimestamp(): Promise<string | null> {
  if (import.meta.env.DEV) return null

  const manifest = await getJson<RawDataManifest>(`${import.meta.env.BASE_URL}data/manifest.json`)
  if (typeof manifest.fetchedAt !== 'string' || Number.isNaN(Date.parse(manifest.fetchedAt))) return null
  return manifest.fetchedAt
}
