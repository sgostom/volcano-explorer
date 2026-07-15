import { describe, expect, it } from 'vitest'
import { determineBump, incrementVersion } from './bump-version.mjs'

describe('determineBump', () => {
  it('uses minor releases for features', () => {
    expect(determineBump('feat: add filters')).toBe('minor')
    expect(determineBump('feat(map): add terrain')).toBe('minor')
  })

  it('uses major releases for breaking changes', () => {
    expect(determineBump('feat!: replace data model')).toBe('major')
    expect(determineBump('fix: migrate API', 'BREAKING CHANGE: new response format')).toBe('major')
  })

  it('uses patch releases for fixes', () => {
    expect(determineBump('fix: load mobile images')).toBe('patch')
  })

  it('skips releases for non-product changes', () => {
    expect(determineBump('ci: update workflow')).toBeNull()
    expect(determineBump('docs: explain versioning')).toBeNull()
    expect(determineBump('test: cover filters')).toBeNull()
    expect(determineBump('chore: update metadata')).toBeNull()
    expect(determineBump('build: update tooling')).toBeNull()
  })
})

describe('incrementVersion', () => {
  it('increments semantic versions', () => {
    expect(incrementVersion('1.2.3', 'patch')).toBe('1.2.4')
    expect(incrementVersion('1.2.3', 'minor')).toBe('1.3.0')
    expect(incrementVersion('1.2.3', 'major')).toBe('2.0.0')
  })
})
