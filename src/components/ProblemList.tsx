import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ArrowUpRight } from 'lucide-react'
import type { ProblemCategory, ProblemItem } from '../types'

interface ProblemListProps {
  items: ProblemItem[]
  categories: ProblemCategory[]
  selectedProblem: ProblemItem | null
  onSelectProblem: (item: ProblemItem) => void
}
type SortKey = 'id' | 'title' | 'relevance2026' | 'demandImpact'
export function ProblemList({ items, categories, selectedProblem, onSelectProblem }: ProblemListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const sorted = useMemo(() => [...items].sort((a, b) => {
    const result = sortKey === 'id' || sortKey === 'title' ? a[sortKey].localeCompare(b[sortKey], undefined, { numeric: true }) : a[sortKey] - b[sortKey]
    return sortDirection === 'asc' ? result : -result
  }), [items, sortKey, sortDirection])
  const sort = (key: SortKey) => {
    if (sortKey === key) setSortDirection(value => value === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDirection(key === 'id' || key === 'title' ? 'asc' : 'desc') }
  }
  const sortHeading = (key: SortKey, label: string) => <button onClick={() => sort(key)}>{label}{sortKey !== key ? <ArrowUpDown size={12} /> : sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}</button>
  const ariaSort = (key: SortKey) => sortKey === key ? sortDirection === 'asc' ? 'ascending' as const : 'descending' as const : 'none' as const
  return <section className="explorer" aria-label="Problem explorer">
    <div className="explorer-heading"><h2>Problem explorer<span>{items.length}</span></h2><p>Select a brief to see what needs building.</p></div>
    <div className="table-scroll"><table className="problem-table">
      <thead><tr><th aria-sort={ariaSort('id')}>{sortHeading('id', 'ID')}</th><th aria-sort={ariaSort('title')}>{sortHeading('title', 'Problem / subdomain')}</th><th className="build-column">Build type</th><th aria-sort={ariaSort('relevance2026')}>{sortHeading('relevance2026', 'Relevance')}</th><th className="impact-column" aria-sort={ariaSort('demandImpact')}>{sortHeading('demandImpact', 'Impact')}</th><th className="source-column">Program / region</th></tr></thead>
      <tbody>{sorted.map(item => <tr key={`${item.category}-${item.id}`} className={selectedProblem?.id === item.id ? 'is-selected' : ''}>
        <td className="id-cell"><button onClick={() => onSelectProblem(item)} aria-label={`Open ${item.id}`}>{item.id}</button><span>{categories.find(category => category.name === item.category)?.code}</span></td>
        <td className="title-cell"><button onClick={() => onSelectProblem(item)}>{item.title}<ArrowUpRight size={14} /></button><span>{item.subDomain || item.domain}</span>{item.otherCategories.length > 0 && <span className="cross-list-note">Also in {item.otherCategories.join(' · ')}</span>}</td>
        <td className="build-column">{item.buildType}</td><td><span className={`score ${item.relevance2026 >= 9 ? 'score-high' : ''}`}>{item.relevance2026}<small>/10</small></span></td><td className="impact-column"><span className="score">{item.demandImpact}<small>/10</small></span></td>
        <td className="source-column"><span>{item.competition}</span><small>{item.region} · {item.editionYear}</small></td>
      </tr>)}</tbody>
    </table>{!sorted.length && <div className="empty-state"><h3>No matching problems.</h3><p>Try a broader search or reset your filters.</p></div>}</div>
  </section>
}
