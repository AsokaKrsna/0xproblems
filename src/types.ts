export interface ProblemItem {
  id: string
  title: string
  description: string
  descriptionKey?: string
  buildType: string
  domain: string
  subDomain: string
  otherCategories: string[]
  demandImpact: number
  competition: string
  editionYear: string
  region: string
  agency: string
  sourceUrl: string
  relevance2026: number
  category: string
}

export interface ProblemCategory {
  name: string
  code: string
  color: string
  count: number
  subDomains: string[]
  items: ProblemItem[]
}

export interface ProblemsDataset {
  sourceFile: string
  totalUnique: number
  categories: ProblemCategory[]
  master: ProblemItem[]
}
