/* eslint-disable */
import type { BaseTranslation } from '../i18n-types'

const en = {
	greeting: 'Hello {name:string}!',
	welcome: 'Welcome to the typesafe-i18n React sample app.',
	currentLanguage: 'Current language: {locale:string}',
	switchLanguage: 'Switch language',
	namespacesLoaded: 'Loaded namespaces: {namespaces:string}',
	loadNamespace: 'Load "{namespace:string}" namespace',
} satisfies BaseTranslation

export default en
