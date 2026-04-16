# @simplelocalize/typesafe-i18n-connector

Import and export [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) translations to/from flat JSON files compatible with [SimpleLocalize](https://simplelocalize.io).

## Installation

```bash
npm install @simplelocalize/typesafe-i18n-connector
```

> `typesafe-i18n` (>=5.0.0) is a peer dependency and must be installed in your project.

## Usage

### Export translations

Reads typesafe-i18n translation files from disk, flattens them into flat key-value JSON files, and writes them to the output directory.

```ts
import { exportTranslations } from '@simplelocalize/typesafe-i18n-connector'

// Use defaults (outputs to ./locales-json/)
await exportTranslations()

// Or customize
await exportTranslations({
  outputDir: './my-translations',
  defaultNamespace: 'common',
})
```

### Import translations

Reads flat JSON files from the input directory, unflattens them, and stores them as typesafe-i18n translation files on disk.

```ts
import { importTranslations } from '@simplelocalize/typesafe-i18n-connector'

// Use defaults (reads from ./locales-json/)
await importTranslations()

// Or customize
await importTranslations({
  inputDir: './my-translations',
  defaultNamespace: 'common',
})
```

## Options

### `ExportOptions`

| Option             | Type     | Default              | Description                                          |
|--------------------|----------|----------------------|------------------------------------------------------|
| `outputDir`        | `string` | `./locales-json`     | Directory to write exported JSON files to             |
| `defaultNamespace` | `string` | `base`               | Filename (without `.json`) for root-level translations |

### `ImportOptions`

| Option             | Type     | Default              | Description                                          |
|--------------------|----------|----------------------|------------------------------------------------------|
| `inputDir`         | `string` | `./locales-json`     | Directory to read JSON files from                     |
| `defaultNamespace` | `string` | `base`               | Filename (without `.json`) for root-level translations |

## File structure

The connector reads and writes flat JSON files organized by locale and namespace:

```
locales-json/
├── en/
│   ├── base.json        # root translations
│   ├── counter.json     # "counter" namespace
│   └── features.json    # "features" namespace
├── de/
│   ├── base.json
│   ├── counter.json
│   └── features.json
└── ...
```

Each JSON file contains flat key-value pairs:

```json
{
  "greeting": "Hello {name}!",
  "welcome": "Welcome to the app."
}
```

Nested typesafe-i18n keys are flattened with dots:

```json
{
  "section.title": "My Section",
  "section.description": "A description"
}
```

## SimpleLocalize integration

After exporting translations, use the [SimpleLocalize CLI](https://simplelocalize.io/docs/cli/get-started/) to upload and download translations.

Example `simplelocalize.yml`:

```yaml
uploadLanguageKey: en
uploadFormat: single-language-json
uploadPath: ./locales-json/en/{ns}.json
uploadOptions:
  - REPLACE_TRANSLATION_IF_FOUND
  - ACTIVATE_PRESENT_KEYS
  - DEPRECATE_NOT_PRESENT_KEYS
  - MARK_AS_ACCEPTED

downloadFormat: single-language-json
downloadPath: ./locales-json/{lang}/{ns}.json
downloadOptions:
  - EXCLUDE_DEPRECATED_KEYS
```

Workflow:

```bash
# 1. Export typesafe-i18n translations to JSON
npx tsx scripts/export.ts

# 2. Upload to SimpleLocalize
simplelocalize upload

# 3. Download translations from SimpleLocalize
simplelocalize download

# 4. Import JSON back into typesafe-i18n
npx tsx scripts/import.ts
```

## Example

The `example/` directory contains a full React + Vite app demonstrating the connector with:

- Multiple locales (en, de, fr, es, pt, pl, it)
- Namespace support (`counter`, `features`) with on-demand loading
- Language switcher

To run the example:

```bash
cd example
npm install
npm run dev
```

## License

MIT
