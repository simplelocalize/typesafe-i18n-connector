/* eslint-disable */
import type { Translation } from '../i18n-types'

const de = {
	greeting: 'Hallo {name}!',
	welcome: 'Willkommen bei der typesafe-i18n React-Beispielanwendung.',
	currentLanguage: 'Aktuelle Sprache: {locale}',
	switchLanguage: 'Sprache wechseln',
	namespacesLoaded: 'Geladene Namespaces: {namespaces}',
	loadNamespace: 'Namespace "{namespace}" laden',
} satisfies Translation

export default de
