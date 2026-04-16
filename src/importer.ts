import type { BaseTranslation } from 'typesafe-i18n'
import { storeTranslationsToDisk, type ImportLocaleMapping } from 'typesafe-i18n/importer'
import { readFileSync, readdirSync } from 'fs'
import { join, basename } from 'path'

export interface ImportOptions {
  inputDir?: string // default: './locales-json'
  defaultNamespace?: string // 'base'
}

export const importTranslations = async (options?: ImportOptions) => {
  const inputDir = options?.inputDir ?? join(process.cwd(), 'locales-json')
  const defaultNamespace = options?.defaultNamespace ?? 'base'

  const locales = readdirSync(inputDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const mappings: ImportLocaleMapping[] = locales.map((locale) =>
    readLocale(join(inputDir, locale), locale, defaultNamespace),
  )

  const result = await storeTranslationsToDisk(mappings)
  console.log(`imported locales: ${result.join(', ')}`)
}

function readLocale(
  localeDir: string,
  locale: string,
  defaultNamespace: string,
): ImportLocaleMapping {
  const jsonFiles = readdirSync(localeDir).filter((f) => f.endsWith('.json'))
  const translations: Record<string, unknown> = {}
  const namespaces: string[] = []

  for (const file of jsonFiles) {
    const content = readJsonFile(join(localeDir, file))
    const name = basename(file, '.json')

    if (name === defaultNamespace) {
      Object.assign(translations, unflattenTranslations(content))
      console.log(`read '${locale}/${file}'`)
    } else {
      translations[name] = unflattenTranslations(content)
      namespaces.push(name)
      console.log(`read '${locale}/${file}' (namespace: ${name})`)
    }
  }

  return { locale, translations: translations as BaseTranslation, namespaces }
}

function readJsonFile(filePath: string): Record<string, string> {
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

export function unflattenTranslations(flat: Record<string, string>): BaseTranslation {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let current: Record<string, unknown> = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {}
      }
      current = current[parts[i]] as Record<string, unknown>
    }
    current[parts[parts.length - 1]] = value
  }
  return result as BaseTranslation
}
