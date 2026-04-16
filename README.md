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
```

### Import translations

Reads flat JSON files from the input directory, unflattens them, and stores them as typesafe-i18n translation files on disk.

```ts
import { importTranslations } from '@simplelocalize/typesafe-i18n-connector'

// Use defaults (reads from ./locales-json/)
await importTranslations()
```

### Add to `package.json`

You can paste both codes into `scripts/exporter.ts` and `scripts/importer.ts` and and add import + export scripts:

```json
    "scripts": {
        ...
        "i18n:export": "tsx scripts/exporter.ts",
        "i18n:import": "tsx scripts/importer.ts"
    },
```

To automate the process by simply running `npm run i18n:export` or `npm run i18n:import`


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

Exported files are compatible with the [Single Language JSON](https://simplelocalize.io/docs/file-formats/single-language-json/) file format used by SimpleLocalize.

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

See [`example/simplelocalize.yml`](example/simplelocalize.yml) for a working configuration. Example `simplelocalize.yml`:

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
npm run i18n:export

# 2. Upload to SimpleLocalize
simplelocalize upload --apiKey YOUR_API_KEY

# 3. Download translations from SimpleLocalize
simplelocalize download --apiKey YOUR_API_KEY

# 4. Import JSON back into typesafe-i18n
npm run i18n:import
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


## Customization

### Export options

You can customize export function like this:

```ts
await exportTranslations({
  outputDir: './my-translations',
  defaultNamespace: 'common',
  cleanOutputDir: false,
})
```

| Option             | Type      | Default          | Description                                            |
| ------------------ | --------- | ---------------- | ------------------------------------------------------ |
| `outputDir`        | `string`  | `./locales-json` | Directory to write exported JSON files to              |
| `cleanOutputDir`   | `boolean` | `true`           | Remove output directory before exporting               |
| `defaultNamespace` | `string`  | `base`           | Filename (without `.json`) for root-level translations |

### Import options

You can customize import function like this:

```ts
await importTranslations({
  inputDir: './my-translations',
  defaultNamespace: 'common',
})
```

| Option             | Type     | Default          | Description                                            |
| ------------------ | -------- | ---------------- | ------------------------------------------------------ |
| `inputDir`         | `string` | `./locales-json` | Directory to read JSON files from                      |
| `defaultNamespace` | `string` | `base`           | Filename (without `.json`) for root-level translations |


## License

MIT
