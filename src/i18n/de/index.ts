/* eslint-disable */
import type { Translation } from '../i18n-types'

const de = {
	greeting: 'Hallo {name}!',
	welcome: 'Willkommen bei der typesafe-i18n React-Beispielanwendung.',
	currentLanguage: 'Aktuelle Sprache: {locale}',
	switchLanguage: 'Sprache wechseln',
	namespacesLoaded: 'Geladene Namespaces: {namespaces}',
	loadNamespace: 'Namespace "{namespace}" laden',
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
