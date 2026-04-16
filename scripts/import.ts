import type { BaseTranslation } from 'typesafe-i18n'
import { storeTranslationsToDisk, type ImportLocaleMapping } from 'typesafe-i18n/importer'
import { readFileSync, readdirSync } from 'fs'
import { join, basename } from 'path'

const unflattenTranslations = (
  flat: Record<string, string>,
): BaseTranslation => {
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

const importTranslations = async () => {
  const baseDir = join(process.cwd(), 'locales-json')
  const localeDirs = readdirSync(baseDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const mappings: ImportLocaleMapping[] = localeDirs.map((locale) => {
    const localeDir = join(baseDir, locale)
    const files = readdirSync(localeDir).filter((f) => f.endsWith('.json'))

    // Read root translations
    const rootFile = files.find((f) => f === 'root.json')
    let translations: BaseTranslation = {} as BaseTranslation
    if (rootFile) {
      const content = readFileSync(join(localeDir, rootFile), 'utf-8')
      const flat: Record<string, string> = JSON.parse(content)
      translations = unflattenTranslations(flat)
      console.log(`read locale '${locale}' from ${locale}/root.json`)
    }

    // Read namespace translations
    const namespaces: string[] = []
    for (const file of files) {
      if (file === 'root.json') continue
      const namespace = basename(file, '.json')
      const content = readFileSync(join(localeDir, file), 'utf-8')
      const flat: Record<string, string> = JSON.parse(content)
      ;(translations as Record<string, unknown>)[namespace] = unflattenTranslations(flat)
      namespaces.push(namespace)
      console.log(`read namespace '${namespace}' for locale '${locale}' from ${locale}/${file}`)
    }

    console.log(`locale '${locale}' ready (namespaces: ${namespaces.length > 0 ? namespaces.join(', ') : 'none'})`)
    return { locale, translations, namespaces }
  })

  const result = await storeTranslationsToDisk(mappings)
  console.log(`imported locales: ${result.join(', ')}`)
}

importTranslations()
