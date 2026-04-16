import { describe, it, expect, vi, afterEach } from 'vitest'
import { join } from 'path'
import { mkdirSync, writeFileSync, rmSync } from 'fs'
import { unflattenTranslations } from './importer'

vi.mock('typesafe-i18n/importer', () => ({
  storeTranslationsToDisk: vi.fn().mockResolvedValue([]),
}))

import { storeTranslationsToDisk } from 'typesafe-i18n/importer'
import { importTranslations } from './importer'

const mockStore = vi.mocked(storeTranslationsToDisk)

describe('unflattenTranslations', () => {
  it('returns flat keys as-is', () => {
    const result = unflattenTranslations({ greeting: 'Hello', welcome: 'Welcome' })
    expect(result).toEqual({ greeting: 'Hello', welcome: 'Welcome' })
  })

  it('unflattens dot-separated keys into nested objects', () => {
    const result = unflattenTranslations({
      'section.title': 'Title',
      'section.description': 'Desc',
    })
    expect(result).toEqual({
      section: { title: 'Title', description: 'Desc' },
    })
  })

  it('unflattens deeply nested keys', () => {
    const result = unflattenTranslations({ 'a.b.c.d': 'deep' })
    expect(result).toEqual({ a: { b: { c: { d: 'deep' } } } })
  })

  it('handles empty object', () => {
    const result = unflattenTranslations({})
    expect(result).toEqual({})
  })

  it('handles mixed flat and nested keys', () => {
    const result = unflattenTranslations({
      title: 'Root',
      'nested.key': 'value',
    })
    expect(result).toEqual({
      title: 'Root',
      nested: { key: 'value' },
    })
  })

  it('overwrites intermediate non-object values', () => {
    const result = unflattenTranslations({
      a: 'flat',
      'a.b': 'nested',
    })
    expect(result).toEqual({ a: { b: 'nested' } })
  })
})

describe('importTranslations', () => {
  const tmpDir = join(process.cwd(), '.test-import-input')

  function writeLocale(locale: string, fileName: string, data: Record<string, string>) {
    const localeDir = join(tmpDir, locale)
    mkdirSync(localeDir, { recursive: true })
    writeFileSync(join(localeDir, fileName), JSON.stringify(data, null, 2))
  }

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
    mockStore.mockReset()
    mockStore.mockResolvedValue([])
  })

  it('reads flat JSON files and calls storeTranslationsToDisk', async () => {
    mockStore.mockResolvedValue(['en'])

    writeLocale('en', 'base.json', {
      greeting: 'Hello {name:string}!',
      welcome: 'Welcome',
    })

    await importTranslations({ inputDir: tmpDir })

    expect(mockStore).toHaveBeenCalledWith([
      {
        locale: 'en',
        translations: {
          greeting: 'Hello {name:string}!',
          welcome: 'Welcome',
        },
        namespaces: [],
      },
    ])
  })

  it('reads namespace files separately from the root file', async () => {
    mockStore.mockResolvedValue(['en'])

    writeLocale('en', 'base.json', { greeting: 'Hello' })
    writeLocale('en', 'counter.json', { count: 'Count: {count:number}', increment: 'Increment' })

    await importTranslations({ inputDir: tmpDir })

    expect(mockStore).toHaveBeenCalledWith([
      {
        locale: 'en',
        translations: {
          greeting: 'Hello',
          counter: {
            count: 'Count: {count:number}',
            increment: 'Increment',
          },
        },
        namespaces: ['counter'],
      },
    ])
  })

  it('imports multiple locales', async () => {
    mockStore.mockResolvedValue(['en', 'de'])

    writeLocale('en', 'base.json', { hello: 'Hello' })
    writeLocale('de', 'base.json', { hello: 'Hallo' })

    await importTranslations({ inputDir: tmpDir })

    const mappings = mockStore.mock.calls[0][0] as Array<{ locale: string }>
    expect(mappings).toHaveLength(2)

    const locales = mappings.map((m) => m.locale).sort()
    expect(locales).toEqual(['de', 'en'])
  })

  it('uses custom defaultNamespace', async () => {
    mockStore.mockResolvedValue(['en'])

    writeLocale('en', 'common.json', { hello: 'Hello' })

    await importTranslations({ inputDir: tmpDir, defaultNamespace: 'common' })

    expect(mockStore).toHaveBeenCalledWith([
      {
        locale: 'en',
        translations: { hello: 'Hello' },
        namespaces: [],
      },
    ])
  })

  it('unflattens dot-separated keys from JSON', async () => {
    mockStore.mockResolvedValue(['en'])

    writeLocale('en', 'base.json', {
      'section.title': 'Title',
      'section.description': 'Desc',
    })

    await importTranslations({ inputDir: tmpDir })

    expect(mockStore).toHaveBeenCalledWith([
      {
        locale: 'en',
        translations: {
          section: { title: 'Title', description: 'Desc' },
        },
        namespaces: [],
      },
    ])
  })

  it('handles locale with no root file, only namespaces', async () => {
    mockStore.mockResolvedValue(['en'])

    writeLocale('en', 'features.json', { title: 'Features' })

    await importTranslations({ inputDir: tmpDir })

    expect(mockStore).toHaveBeenCalledWith([
      {
        locale: 'en',
        translations: {
          features: { title: 'Features' },
        },
        namespaces: ['features'],
      },
    ])
  })
})
