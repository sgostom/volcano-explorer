import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const sources = {
  volcanoes: 'https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes&outputFormat=application/json',
  eruptions: 'https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Eruptions&outputFormat=application/json',
  reports: 'https://volcano.si.edu/news/WeeklyVolcanoRSS.xml',
}

const outputDirectory = resolve('public/data')
const timeoutMs = 120_000

async function download(url, accept) {
  const response = await fetch(url, {
    headers: { Accept: accept },
    signal: AbortSignal.timeout(timeoutMs),
  })

  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

function validateFeatureCollection(buffer, sourceName) {
  const document = JSON.parse(buffer.toString('utf8'))
  if (document?.type !== 'FeatureCollection' || !Array.isArray(document.features)) {
    throw new Error(`${sourceName} is not a GeoJSON FeatureCollection`)
  }
}

function validateRss(buffer) {
  const document = buffer.toString('latin1')
  if (!/<rss[\s>]/i.test(document) || !/<channel[\s>]/i.test(document)) {
    throw new Error('Weekly report source is not an RSS document')
  }
}

const [volcanoes, eruptions, reports] = await Promise.all([
  download(sources.volcanoes, 'application/geo+json, application/json'),
  download(sources.eruptions, 'application/geo+json, application/json'),
  download(sources.reports, 'application/rss+xml, application/xml, text/xml'),
])

validateFeatureCollection(volcanoes, 'Volcano source')
validateFeatureCollection(eruptions, 'Eruption source')
validateRss(reports)

await mkdir(outputDirectory, { recursive: true })
await Promise.all([
  writeFile(resolve(outputDirectory, 'volcanoes.geojson'), volcanoes),
  writeFile(resolve(outputDirectory, 'eruptions.geojson'), eruptions),
  writeFile(resolve(outputDirectory, 'weekly-volcano-rss.xml'), reports),
  writeFile(resolve(outputDirectory, 'manifest.json'), `${JSON.stringify({
    fetchedAt: new Date().toISOString(),
    sources,
  }, null, 2)}\n`),
])

console.log(`Downloaded Smithsonian snapshot to ${outputDirectory}`)
