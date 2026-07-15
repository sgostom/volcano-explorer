import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export function determineBump(title, body = '') {
  const conventional = /^([a-z]+)(?:\([^)]+\))?(!)?:/i.exec(title.trim())
  const breaking = conventional?.[2] === '!' || /(^|\n)BREAKING[ -]CHANGE:/i.test(body)

  if (breaking) return 'major'
  if (conventional?.[1]?.toLowerCase() === 'feat') return 'minor'
  if (conventional?.[1]?.toLowerCase() === 'fix') return 'patch'
  return null
}

export function incrementVersion(version, bump) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) throw new Error(`Invalid semantic version: ${version}`)

  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3])

  if (bump === 'major') return `${major + 1}.0.0`
  if (bump === 'minor') return `${major}.${minor + 1}.0`
  if (bump === 'patch') return `${major}.${minor}.${patch + 1}`
  throw new Error(`Unsupported version bump: ${bump}`)
}

export async function bumpPackageVersion({
  packagePath = 'package.json',
  title = decodeMetadata('PR_TITLE'),
  body = decodeMetadata('PR_BODY'),
} = {}) {
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
  const bump = determineBump(title, body)
  if (bump === null) return null
  const version = incrementVersion(packageJson.version, bump)
  packageJson.version = version
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
  return version
}

function decodeMetadata(name) {
  const encoded = process.env[`${name}_BASE64`]
  return encoded ? Buffer.from(encoded, 'base64').toString('utf8') : process.env[name] ?? ''
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(await bumpPackageVersion() ?? '')
}
