const DEFAULT_TIMEOUT_MS = 30_000

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

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
      throw new ApiError(`Źródło Smithsonian zwróciło błąd HTTP ${response.status}.`, response.status)
    }
    return response
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Przekroczono czas oczekiwania na dane Smithsonian.')
    }
    throw new ApiError('Nie udało się połączyć ze źródłem Smithsonian.')
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function getJson<T>(url: string): Promise<T> {
  const response = await request(url)
  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('Smithsonian zwrócił nieprawidłowy dokument GeoJSON.')
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
