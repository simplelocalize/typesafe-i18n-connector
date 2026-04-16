/* eslint-disable */
import type { Translation } from '../i18n-types'

const de = {
	currentLanguage: 'Aktuelle Sprache: {locale}',
	greeting: 'Hallo {name}!',
	loadNamespace: 'Namespace "{namespace}" laden',
	namespacesLoaded: 'Geladene Namensräume: {namespaces}',
	switchLanguage: 'Sprache wechseln',
	welcome: 'Willkommen zur typesafe-i18n React-Beispiel-App.',
	counter: {
		title: 'Zähler',
		count: 'Zählerstand: {count}',
		increment: 'Erhöhen',
		decrement: 'Verringern',
	},
	features: {
		title: 'Funktionen',
		typeSafety: 'Volle Typsicherheit für Übersetzungen',
		autoCompletion: 'Auto-Vervollständigung in deiner IDE',
		smallBundle: 'Kleine Bundle-Größe',
		namespaces: 'Namespace-Unterstützung für bedarfsgerechtes Laden',
	},
} satisfies Translation

export default de
