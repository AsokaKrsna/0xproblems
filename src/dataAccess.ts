import datasetUrl from './data/problems.web.json?url'
import manifest from './data/manifest.json'
import type { ProblemItem, ProblemsDataset } from './types'

async function getJSON(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Problem data request failed: ${response.status}`)
  return response.json()
}
const assetURL = (path: string) => `${import.meta.env.BASE_URL}${path}`

export async function loadDataset(): Promise<ProblemsDataset> {
  const source = await getJSON(datasetUrl) as ProblemsDataset
  if (!Array.isArray(source.categories) || !Array.isArray(source.master)) throw new Error('Invalid problem index')
  // Sheet membership is authoritative; category names themselves contain commas.
  const membership = new Map<string, string[]>()
  for (const category of source.categories) for (const item of category.items) {
    const names = membership.get(item.title) ?? []
    if (!names.includes(category.name)) names.push(category.name)
    membership.set(item.title, names)
  }
  const normalize = (item: ProblemItem): ProblemItem => {
    const names = membership.get(item.title) ?? []
    const category = names.includes(item.category) ? item.category : names[0] ?? item.category
    return { ...item, category, otherCategories: names.filter(name => name !== category) }
  }
  return { ...source, categories: source.categories.map(category => ({ ...category, items: category.items.map(normalize) })), master: source.master.map(normalize) }
}

const briefRequests = new Map<string, Promise<string>>()
export function loadDescription(item: ProblemItem): Promise<string> {
  if (item.description) return Promise.resolve(item.description)
  const key = item.descriptionKey
  if (!key || !/^[a-f0-9]{20}$/.test(key)) return Promise.reject(new Error('Missing specification reference'))
  const cached = briefRequests.get(key)
  if (cached) return cached
  const request = getJSON(assetURL(`data/briefs/${key}.json`)).then(data => {
    if (typeof data.description !== 'string') throw new Error('Invalid specification')
    return data.description as string
  }).catch(error => { briefRequests.delete(key); throw error })
  briefRequests.set(key, request)
  return request
}

let searchRequest: Promise<Record<string, string>> | undefined
export function loadSearchDescriptions(): Promise<Record<string, string>> {
  if (!searchRequest) searchRequest = getJSON(assetURL(manifest.searchIndexUrl)).then(data => {
    if (!data || Array.isArray(data) || typeof data !== 'object' || !Object.values(data).every(value => typeof value === 'string')) throw new Error('Invalid specification search index')
    return data as Record<string, string>
  }).catch(error => { searchRequest = undefined; throw error })
  return searchRequest
}
