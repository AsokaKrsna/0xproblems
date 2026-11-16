import fs from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const EXCEL_PATH = path.join(ROOT, 'Classified_Cybersecurity_Problem_statement_collection.xlsx')
const OUT_DIR = path.join(ROOT, 'src', 'data')
const OUT_PATH = path.join(OUT_DIR, 'problems.json')

if (!fs.existsSync(EXCEL_PATH)) {
  console.error(`Missing Excel file at ${EXCEL_PATH}`)
  process.exit(1)
}

const CATEGORY_META = {
  Malware: { code: 'MAL', color: '#f43f5e' },
  LLM: { code: 'LLM', color: '#a855f7' },
  'Network, SIEM & SOC': { code: 'NET', color: '#38bdf8' },
  'Darknet & OSINT': { code: 'DRK', color: '#94a3b8' },
  'Digital Forensics': { code: 'DFR', color: '#2dd4bf' },
  'Phishing & Online Safety': { code: 'PHS', color: '#fb923c' },
  'FinTech & Crypto Fraud': { code: 'FIN', color: '#22c55e' },
  'OT, IoT & Hardware': { code: 'IOT', color: '#eab308' },
  'Defense, Counter-UAS & EW': { code: 'DEF', color: '#60a5fa' },
  'Privacy, Identity & Biometrics': { code: 'PRV', color: '#818cf8' },
  'PQC & Blockchain': { code: 'PQC', color: '#ec4899' },
}

const FALLBACK_COLORS = [
  '#38bdf8', '#a855f7', '#f43f5e', '#22c55e', '#eab308', '#fb923c', '#2dd4bf',
]

const wb = XLSX.readFile(EXCEL_PATH)

function parseOtherCategories(raw) {
  if (!raw) return []
  const str = String(raw).trim()
  if (!str || str === '—' || str === '-') return []
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function normalizeRow(row, categoryName) {
  const num = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return {
    id: String(row['ID'] ?? '').trim(),
    title: String(row['Title'] ?? '').trim(),
    description: String(row['Description'] ?? '').trim(),
    buildType: String(row['Build Type'] ?? '').trim(),
    domain: String(row['Domain'] ?? '').trim(),
    subDomain: String(row['Sub-Domain'] ?? '').trim(),
    otherCategories: parseOtherCategories(row['Other categories']),
    demandImpact: num(row['Demand/Impact (Approx)']),
    competition: String(row['Competition/Program'] ?? '').trim(),
    editionYear: String(row['Edition/Year'] ?? '').trim(),
    region: String(row['Region'] ?? '').trim(),
    agency: String(row['Agency/Organization'] ?? '').trim(),
    sourceUrl: String(row['Source URL'] ?? '').trim(),
    relevance2026: num(row['2026 Relevance']),
    category: categoryName,
  }
}

const SKIP_SHEETS = new Set(['All Curated (Master)', 'Dashboard & Summary'])

const categories = []
let colorIdx = 0

for (const sheetName of wb.SheetNames) {
  if (SKIP_SHEETS.has(sheetName)) continue
  const ws = wb.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' })
  const items = rawRows
    .map((r) => normalizeRow(r, sheetName))
    .filter((item) => item.id && item.title)

  const meta = CATEGORY_META[sheetName] ?? {
    code: sheetName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'CAT',
    color: FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length],
  }

  const subDomains = Array.from(new Set(items.map((i) => i.subDomain).filter(Boolean)))

  categories.push({
    name: sheetName,
    code: meta.code,
    color: meta.color,
    count: items.length,
    subDomains,
    items,
  })
}

let masterItems = []
if (wb.Sheets['All Curated (Master)']) {
  const rawMaster = XLSX.utils.sheet_to_json(wb.Sheets['All Curated (Master)'], { defval: '' })
  masterItems = rawMaster
    .map((r) => normalizeRow(r, 'All Curated (Master)'))
    .filter((item) => item.id && item.title)
}

const payload = {
  sourceFile: 'Classified_Cybersecurity_Problem_statement_collection.xlsx',
  totalUnique: masterItems.length || categories.reduce((acc, c) => acc + c.count, 0),
  categories,
  master: masterItems,
}

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8')
console.log(
  `Synced ${categories.length} categories (${payload.totalUnique} unique problems) -> src/data/problems.json`
)

// Keep long specifications out of application JavaScript and the initial map index.
const DATA_DIR = path.join(ROOT, 'public', 'data')
const BRIEF_DIR = path.join(DATA_DIR, 'briefs')
fs.mkdirSync(BRIEF_DIR, { recursive: true })
const descriptions = {}
const compactItem = (item) => {
  const descriptionKey = createHash('sha256').update(item.description).digest('hex').slice(0, 20)
  descriptions[descriptionKey] = item.description
  return { ...item, description: '', descriptionKey }
}
const webPayload = {
  ...payload,
  categories: payload.categories.map(category => ({ ...category, items: category.items.map(compactItem) })),
  master: payload.master.map(compactItem),
}
for (const [key, description] of Object.entries(descriptions)) {
  fs.writeFileSync(path.join(BRIEF_DIR, `${key}.json`), JSON.stringify({ description }), 'utf8')
}
const searchJSON = JSON.stringify(descriptions)
const searchHash = createHash('sha256').update(searchJSON).digest('hex').slice(0, 20)
const searchFilename = `search-${searchHash}.json`
fs.writeFileSync(path.join(DATA_DIR, searchFilename), searchJSON, 'utf8')
fs.writeFileSync(path.join(OUT_DIR, 'problems.web.json'), JSON.stringify(webPayload), 'utf8')
fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify({ searchIndexUrl: `data/${searchFilename}` }), 'utf8')
// Only obsolete generated JSON assets are pruned; workbook and source files are untouched.
for (const filename of fs.readdirSync(BRIEF_DIR)) {
  if (/^[a-f0-9]{20}\.json$/.test(filename) && !descriptions[filename.slice(0, -5)]) {
    fs.unlinkSync(path.join(BRIEF_DIR, filename))
  }
}
for (const filename of fs.readdirSync(DATA_DIR)) {
  if (/^search-[a-f0-9]{20}\.json$/.test(filename) && filename !== searchFilename) {
    fs.unlinkSync(path.join(DATA_DIR, filename))
  }
}
console.log(`Web index: ${Buffer.byteLength(JSON.stringify(webPayload))} bytes; ${Object.keys(descriptions).length} on-demand briefs`)
