import { describe, expect, it } from 'vitest'
import { translate } from './index'

describe('interface translations', () => {
  it('returns Polish and English variants for the same key', () => {
    expect(translate('pl', 'filters.searchPlaceholder')).toBe('Szukaj po nazwie…')
    expect(translate('en', 'filters.searchPlaceholder')).toBe('Search by name…')
  })

  it('interpolates values without changing the source dictionary', () => {
    expect(translate('pl', 'error.http', { status: 503 })).toContain('503')
    expect(translate('en', 'reports.openAria', { name: 'Etna' })).toBe('Open the Etna report at Smithsonian')
  })
})
