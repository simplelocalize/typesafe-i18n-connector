import { readTranslationsFromDisk, type ExportLocaleMapping } from 'typesafe-i18n/exporter'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'

const flattenTranslations = (
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> => {
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

export interface ExportOptions {
  outputDir?: string
  defaultNamespace?: string
}

export const exportTranslations = async (options?: ExportOptions) => {
  const outputDir = options?.outputDir ?? join(process.cwd(), 'locales-json')
  const defaultNamespace = options?.defaultNamespace ?? 'base'
  const mappings: ExportLocaleMapping[] = await readTranslationsFromDisk()

  rmSync(outputDir, { recursive: true, force: true })

  for (const mapping of mappings) {
    const localeDir = join(outputDir, mapping.locale)
    mkdirSync(localeDir, { recursive: true })

    // Export base translations
    const flat = flattenTranslations(mapping.translations as Record<string, unknown>)
    const filePath = join(localeDir, `${defaultNamespace}.json`)
    writeFileSync(filePath, JSON.stringify(flat, null, 2) + '\n')
    console.log(`exported locale '${mapping.locale}' to ${filePath}`)

    // Export namespace translations
    for (const ns of mapping.namespaces) {
      const nsTranslations = (mapping.translations as Record<string, unknown>)[ns]
      if (nsTranslations && typeof nsTranslations === 'object') {
        const nsFlat = flattenTranslations(nsTranslations as Record<string, unknown>)
        const nsFilePath = join(localeDir, `${ns}.json`)
        writeFileSync(nsFilePath, JSON.stringify(nsFlat, null, 2) + '\n')
        console.log(`exported namespace '${ns}' for locale '${mapping.locale}' to ${nsFilePath}`)
      }
    }
  }

  console.log('export completed')
}
