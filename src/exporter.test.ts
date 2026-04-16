import { describe, it, expect, vi, afterEach } from 'vitest'
import { join } from 'path'
import { existsSync, readFileSync, rmSync } from 'fs'
import { flattenTranslations } from './exporter'

vi.mock('typesafe-i18n/exporter', () => ({
  readTranslationsFromDisk: vi.fn().mockResolvedValue([]),
}))

import { readTranslationsFromDisk } from 'typesafe-i18n/exporter'
import { exportTranslations } from './exporter'

const mockReadTranslations = vi.mocked(readTranslationsFromDisk)

describe('flattenTranslations', () => {
  it('flattens a simple object', () => {
    const result = flattenTranslations({ greeting: 'Hello', welcome: 'Welcome' })
    expect(result).toEqual({ greeting: 'Hello', welcome: 'Welcome' })
  })

  it('flattens nested objects with dot notation', () => {
    const result = flattenTranslations({
      section: {
        title: 'Title',
        description: 'Desc',
      },
    })
    expect(result).toEqual({
      'section.title': 'Title',
      'section.description': 'Desc',
    })
  })

  it('flattens deeply nested objects', () => {
    const result = flattenTranslations({
      a: { b: { c: { d: 'deep' } } },
    })
    expect(result).toEqual({ 'a.b.c.d': 'deep' })
  })

  it('handles empty object', () => {
    const result = flattenTranslations({})
    expect(result).toEqual({})
  })

  it('converts non-string values to strings', () => {
    const result = flattenTranslations({ count: 42 as unknown })
    expect(result).toEqual({ count: '42' })
  })

  it('handles mixed flat and nested keys', () => {
    const result = flattenTranslations({
      title: 'Root Title',
      nested: { key: 'value' },
    })
    expect(result).toEqual({
      title: 'Root Title',
      'nested.key': 'value',
    })
  })
})

describe('exportTranslations', () => {
  const tmpDir = join(process.cwd(), '.test-export-output')

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
    mockReadTranslations.mockReset()
  })

  it('exports translations to flat JSON files', async () => {
    mockReadTranslations.mockResolvedValue([
      {
        locale: 'en',
        translations: {
          greeting: 'Hello {name:string}!',
          welcome: 'Welcome',
        },
        namespaces: [],
      },
      {
        locale: 'de',
        translations: {
          greeting: 'Hallo {name}!',
          welcome: 'Willkommen',
        },
        namespaces: [],
      },
    ])

    await exportTranslations({ outputDir: tmpDir })

    const enBase = JSON.parse(readFileSync(join(tmpDir, 'en', 'base.json'), 'utf-8'))
    expect(enBase).toEqual({
      greeting: 'Hello {name:string}!',
      welcome: 'Welcome',
    })

    const deBase = JSON.parse(readFileSync(join(tmpDir, 'de', 'base.json'), 'utf-8'))
    expect(deBase).toEqual({
      greeting: 'Hallo {name}!',
      welcome: 'Willkommen',
    })
  })

  it('exports namespace translations to separate files', async () => {
    mockReadTranslations.mockResolvedValue([
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

    await exportTranslations({ outputDir: tmpDir })

    const enBase = JSON.parse(readFileSync(join(tmpDir, 'en', 'base.json'), 'utf-8'))
    expect(enBase).toEqual({
      greeting: 'Hello',
      'counter.count': 'Count: {count:number}',
      'counter.increment': 'Increment',
    })

    const enCounter = JSON.parse(readFileSync(join(tmpDir, 'en', 'counter.json'), 'utf-8'))
    expect(enCounter).toEqual({
      count: 'Count: {count:number}',
      increment: 'Increment',
    })
  })

  it('uses custom defaultNamespace for the root file', async () => {
    mockReadTranslations.mockResolvedValue([
      {
        locale: 'en',
        translations: { hello: 'Hello' },
        namespaces: [],
      },
    ])

    await exportTranslations({ outputDir: tmpDir, defaultNamespace: 'common' })

    expect(existsSync(join(tmpDir, 'en', 'common.json'))).toBe(true)
    expect(existsSync(join(tmpDir, 'en', 'base.json'))).toBe(false)
  })

  it('clears the output directory before exporting', async () => {
    mockReadTranslations.mockResolvedValue([
      {
        locale: 'en',
        translations: { hello: 'Hello' },
        namespaces: [],
      },
    ])

    await exportTranslations({ outputDir: tmpDir })
    expect(existsSync(join(tmpDir, 'en', 'base.json'))).toBe(true)

    mockReadTranslations.mockResolvedValue([
      {
        locale: 'fr',
        translations: { hello: 'Bonjour' },
        namespaces: [],
      },
    ])

    await exportTranslations({ outputDir: tmpDir })

    expect(existsSync(join(tmpDir, 'en'))).toBe(false)
    expect(existsSync(join(tmpDir, 'fr', 'base.json'))).toBe(true)
  })
})
