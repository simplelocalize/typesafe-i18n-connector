import { useState, useEffect } from 'react'
import TypesafeI18n from './i18n/i18n-react'
import { useI18nContext } from './i18n/i18n-react'
import { loadLocaleAsync, loadNamespaceAsync } from './i18n/i18n-util.async'
import type { Locales, Namespaces } from './i18n/i18n-types'
import { locales } from './i18n/i18n-util'

const allNamespaces: Namespaces[] = ['features', 'counter']

const localeLabels: Record<Locales, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  pl: 'Polski',
}

function FeaturesSection() {
  const { LL } = useI18nContext()

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
      <h2>{LL.features.title()}</h2>
      <ul>
        <li>{LL.features.typeSafety()}</li>
        <li>{LL.features.autoCompletion()}</li>
        <li>{LL.features.smallBundle()}</li>
        <li>{LL.features.namespaces()}</li>
      </ul>
    </div>
  )
}

function CounterSection() {
  const { LL } = useI18nContext()
  const [count, setCount] = useState(0)

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
      <h2>{LL.counter.title()}</h2>
      <p>{LL.counter.count({ count })}</p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setCount((c) => c - 1)}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          {LL.counter.decrement()}
        </button>
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          {LL.counter.increment()}
        </button>
      </div>
    </div>
  )
}

function AppContent() {
  const { LL, locale, setLocale } = useI18nContext()
  const [loadedNamespaces, setLoadedNamespaces] = useState<Namespaces[]>([])

  const switchLocale = async () => {
    const currentIndex = locales.indexOf(locale)
    const nextLocale: Locales = locales[(currentIndex + 1) % locales.length]
    await loadLocaleAsync(nextLocale)
    // reload all previously loaded namespaces for the new locale
    for (const ns of loadedNamespaces) {
      await loadNamespaceAsync(nextLocale, ns)
    }
    setLocale(nextLocale)
  }

  const toggleNamespace = async (ns: Namespaces) => {
    if (loadedNamespaces.includes(ns)) {
      setLoadedNamespaces((prev) => prev.filter((n) => n !== ns))
    } else {
      await loadNamespaceAsync(locale, ns)
      setLoadedNamespaces((prev) => [...prev, ns])
      // re-trigger reactivity
      setLocale(locale)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>{LL.greeting({ name: 'World' })}</h1>
      <p>{LL.welcome()}</p>
      <p>{LL.currentLanguage({ locale })}</p>
      <p>{LL.namespacesLoaded({ namespaces: loadedNamespaces.length > 0 ? loadedNamespaces.join(', ') : '(none)' })}</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={switchLocale}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          {LL.switchLanguage()}
        </button>
        {allNamespaces.map((ns) => (
          <button
            key={ns}
            onClick={() => toggleNamespace(ns)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              background: loadedNamespaces.includes(ns) ? '#e0ffe0' : undefined,
            }}
          >
            {loadedNamespaces.includes(ns) ? `✓ ${ns}` : LL.loadNamespace({ namespace: ns })}
          </button>
        ))}
      </div>

      {loadedNamespaces.includes('features') && <FeaturesSection />}
      {loadedNamespaces.includes('counter') && <CounterSection />}
    </div>
  )
}

export default function App() {
  const [localeLoaded, setLocaleLoaded] = useState(false)

  useEffect(() => {
    loadLocaleAsync('en').then(() => setLocaleLoaded(true))
  }, [])

  if (!localeLoaded) return null

  return (
    <TypesafeI18n locale="en">
      <AppContent />
    </TypesafeI18n>
  )
}
