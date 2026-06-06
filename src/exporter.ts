import { readTranslationsFromDisk } from 'typesafe-i18n/exporter'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'

export interface ExportOptions {
  outputDir?: string // default: './locales-json'
  cleanOutputDir?: boolean // default: true
  defaultNamespace?: string // 'base'
  flatten?: boolean // default: true — set false to write nested JSON mirroring the source structure
}

export const exportTranslations = async (options?: ExportOptions) => {
  const outputDir = options?.outputDir ?? join(process.cwd(), 'locales-json')
  const defaultNamespace = options?.defaultNamespace ?? 'base'
  const cleanOutputDir = options?.cleanOutputDir ?? true
  const flatten = options?.flatten ?? true
  const mappings = await readTranslationsFromDisk()

  if (cleanOutputDir) {
    rmSync(outputDir, { recursive: true, force: true })
  }

  for (const { locale, translations, namespaces } of mappings) {
    const localeDir = join(outputDir, locale)
    mkdirSync(localeDir, { recursive: true })

    writeJsonFile(join(localeDir, `${defaultNamespace}.json`), translations, flatten)
    console.log(`exported '${locale}/${defaultNamespace}.json'`)

    for (const ns of namespaces) {
      const nsTranslations = (translations as Record<string, unknown>)[ns]
      if (nsTranslations && typeof nsTranslations === 'object') {
        writeJsonFile(join(localeDir, `${ns}.json`), nsTranslations, flatten)
        console.log(`exported '${locale}/${ns}.json'`)
      }
    }
  }

  console.log('export completed')
}

function writeJsonFile(filePath: string, obj: unknown, flatten = true) {
  const data = flatten ? flattenTranslations(obj as Record<string, unknown>) : obj
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

export function flattenTranslations(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value as Record<string, unknown>, fullKey))
    } else {
      result[fullKey] = String(value)
    }
  }
  return result
}
