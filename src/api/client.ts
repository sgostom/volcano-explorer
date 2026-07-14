import { ExplorerError } from '../models/errors'

const DEFAULT_TIMEOUT_MS = 30_000

async function request(url: string): Promise<Response> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json, application/rss+xml, application/xml, text/xml' },
    })
    if (!response.ok) {
      throw new ExplorerError('http', { status: response.status })
    }
    return response
  } catch (error) {
    if (error instanceof ExplorerError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ExplorerError('timeout')
    }
    throw new ExplorerError('network')
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function getJson<T>(url: string): Promise<T> {
  const response = await request(url)
  try {
    return (await response.json()) as T
  } catch {
    throw new ExplorerError('invalidGeoJson')
  }
}

export async function getXml(url: string): Promise<string> {
  const response = await request(url)
  const bytes = await response.arrayBuffer()
  try {
    return new TextDecoder('windows-1252').decode(bytes)
  } catch {
    return new TextDecoder().decode(bytes)
  }
}
