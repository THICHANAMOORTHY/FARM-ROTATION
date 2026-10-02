// Checks that en.json and ta.json have exactly the same keys, so no screen shows a missing text.
// Run: npm run check:i18n
import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../src/i18n/${name}.json`, import.meta.url)))

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    if (key.startsWith('_')) return [] // notes such as "_review"
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'object' ? keys(value, path) : [path]
  })
}

const en = new Set(keys(load('en')))
const ta = new Set(keys(load('ta')))
const missingInTa = [...en].filter((k) => !ta.has(k))
const missingInEn = [...ta].filter((k) => !en.has(k))

if (missingInTa.length || missingInEn.length) {
  if (missingInTa.length) console.error('Missing in ta.json:', missingInTa.join(', '))
  if (missingInEn.length) console.error('Missing in en.json:', missingInEn.join(', '))
  process.exit(1)
}
console.log(`i18n OK: ${en.size} keys in both en.json and ta.json`)
