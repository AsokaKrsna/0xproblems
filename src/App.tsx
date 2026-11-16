import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Check, Hexagon, List, Search, SlidersHorizontal, X } from 'lucide-react'
import { loadSearchDescriptions } from './dataAccess'
import type { ProblemItem, ProblemsDataset } from './types'
import { HexMap } from './components/HexMap'
import { ProblemList } from './components/ProblemList'
import { ProblemDrawer } from './components/ProblemDrawer'

export function App({ dataset }: { dataset: ProblemsDataset }) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [descriptionIndex, setDescriptionIndex] = useState<Record<string, string> | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [searchAttempt, setSearchAttempt] = useState(0)
  const searchRequested = Boolean(searchQuery.trim())

  useEffect(() => {
    if (!searchRequested || descriptionIndex) return
    let active = true
    setSearchLoading(true); setSearchError(false)
    loadSearchDescriptions().then(index => {
      if (active) { setDescriptionIndex(index); setSearchLoading(false) }
    }).catch(() => {
      if (active) { setSearchError(true); setSearchLoading(false) }
    })
    return () => { active = false }
  }, [searchRequested, descriptionIndex, searchAttempt])
  const [buildTypeFilter, setBuildTypeFilter] = useState('ALL')
  const [regionFilter, setRegionFilter] = useState('ALL')
  const [minRelevance, setMinRelevance] = useState(0)
  const [crossListedOnly, setCrossListedOnly] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const activeCategory = dataset.categories.find(category => category.name === selectedCategory)
  const buildTypes = useMemo(() => [...new Set(dataset.master.map(item => item.buildType).filter(Boolean))].sort(), [])
  const regions = useMemo(() => [...new Set(dataset.master.map(item => item.region).filter(Boolean))].sort(), [])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
      if ((event.key === '/' || event.key.toLowerCase() === 'f') && !isEditing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        setSearchOpen(true)
        searchInputRef.current?.focus()
      }
      if (event.key === 'Escape') {
        if (selectedProblem) setSelectedProblem(null)
        else if (filtersOpen) { setFiltersOpen(false); filterButtonRef.current?.focus() }
        else if (searchOpen) { setSearchOpen(false); setSearchQuery('') }
        else setSelectedCategory('ALL')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedProblem, filtersOpen, searchOpen])

  const matchesFilters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return (item: ProblemItem) => {
      if (buildTypeFilter !== 'ALL' && item.buildType !== buildTypeFilter) return false
      if (regionFilter !== 'ALL' && item.region !== regionFilter) return false
      if (item.relevance2026 < minRelevance) return false
      if (crossListedOnly && !item.otherCategories.length) return false
      return !query || [item.id, item.title, descriptionIndex?.[item.descriptionKey ?? ''] ?? item.description, item.subDomain, item.domain, item.competition, item.agency]
        .some(value => value.toLowerCase().includes(query))
    }
  }, [searchQuery, buildTypeFilter, regionFilter, minRelevance, crossListedOnly, descriptionIndex])

  const filteredByCategory = useMemo(() => new Map(dataset.categories.map(category => [category.name, category.items.filter(matchesFilters)])), [matchesFilters])
  const matchingMaster = useMemo(() => dataset.master.filter(matchesFilters), [matchesFilters])
  const visibleItems = activeCategory ? filteredByCategory.get(activeCategory.name) ?? [] : matchingMaster
  const filterCount = [buildTypeFilter !== 'ALL', regionFilter !== 'ALL', minRelevance > 0, crossListedOnly].filter(Boolean).length
  const hasActiveFilters = filterCount > 0 || searchQuery.trim() !== ''
  const programCount = new Set(matchingMaster.map(item => item.competition)).size
  const resetFilters = () => {
    setSearchQuery(''); setBuildTypeFilter('ALL'); setRegionFilter('ALL'); setMinRelevance(0); setCrossListedOnly(false)
  }
  const selectCategory = (name: string) => {
    setSelectedCategory(name); setFiltersOpen(false); setSelectedProblem(null)
  }
  const jumpCategory = (name: string, title: string) => {
    const item = dataset.categories.find(category => category.name === name)?.items.find(problem => problem.title === title)
    if (item) { setSelectedCategory(name); setSelectedProblem(item) }
  }

  return (
    <div className="atlas-app">
      <a className="skip-link" href="#workspace">Skip to problems</a>
      <header className="topbar">
        <nav className="view-tabs" aria-label="View">
          <button className={viewMode === 'map' ? 'is-active' : ''} onClick={() => setViewMode('map')} aria-pressed={viewMode === 'map'}><Hexagon size={14} /> Map</button>
          <button className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}><List size={15} /> Explorer</button>
        </nav>
        <button className="wordmark" aria-label="0xProblems home" onClick={() => { selectCategory('ALL'); resetFilters(); setViewMode('map') }}>
          <span className="brand-symbol" aria-hidden="true"><Hexagon size={23} strokeWidth={1.1} /><span /></span>
          <span><span className="brand-prefix">0x</span>PROBLEMS</span>
        </button>
        <div className="header-actions">
          <button aria-label="Find" className={`quiet-button ${searchOpen || searchQuery ? 'is-selected' : ''}`} onClick={() => setSearchOpen(value => !value)} aria-expanded={searchOpen} aria-controls="atlas-search"><Search size={14} /><span>Find</span><kbd>F</kbd></button>
          <button aria-label="Filters" ref={filterButtonRef} className={`quiet-button ${filtersOpen || filterCount ? 'is-selected' : ''}`} onClick={() => setFiltersOpen(value => !value)} aria-expanded={filtersOpen} aria-controls="atlas-filters"><SlidersHorizontal size={14} /><span>Filters</span>{filterCount > 0 && <span className="filter-count">{filterCount}</span>}</button>
        </div>
      </header>

      {searchOpen && <div className="search-strip" id="atlas-search">
        <Search size={17} />
        <input ref={searchInputRef} type="search" aria-label="Search problems" placeholder="Search problems, agencies, domains…" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} />
        <span className="search-result-count" aria-live="polite">{searchLoading ? 'Searching specifications…' : `${matchingMaster.length} results`}</span>
        <button className="icon-button" aria-label="Close search" onClick={() => { setSearchOpen(false); setSearchQuery('') }}><X size={17} /></button>
      </div>}

      {searchOpen && searchError && <p className="search-error" role="alert">Specification search could not load. Title and metadata search still work. <button onClick={() => setSearchAttempt(value => value + 1)}>Retry</button></p>}

      <div className="workspace" id="workspace" tabIndex={-1}>
        {filtersOpen && <button className="filter-scrim" aria-label="Close filters" onClick={() => setFiltersOpen(false)} />}
        {filtersOpen && <aside className="filter-panel" id="atlas-filters" aria-label="Categories and filters">
          <div className="panel-heading"><h2>Refine the atlas</h2><button className="icon-button" aria-label="Close filters" onClick={() => { setFiltersOpen(false); filterButtonRef.current?.focus() }}><X size={17} /></button></div>
          <div className="filter-panel-body">
            <h3>Categories</h3>
            <button className={`category-option ${selectedCategory === 'ALL' ? 'is-selected' : ''}`} onClick={() => selectCategory('ALL')}><span>All problems</span><span>{matchingMaster.length}</span></button>
            {dataset.categories.map(category => <button key={category.name} className={`category-option ${selectedCategory === category.name ? 'is-selected' : ''}`} onClick={() => selectCategory(category.name)}><span>{category.name}</span><span>{filteredByCategory.get(category.name)?.length}</span></button>)}
            <div className="filter-fields">
              <label htmlFor="build-type">Build type</label>
              <select id="build-type" value={buildTypeFilter} onChange={event => setBuildTypeFilter(event.target.value)}><option value="ALL">All build types</option>{buildTypes.map(type => <option key={type}>{type}</option>)}</select>
              <label htmlFor="region">Region</label>
              <select id="region" value={regionFilter} onChange={event => setRegionFilter(event.target.value)}><option value="ALL">All regions</option>{regions.map(region => <option key={region}>{region}</option>)}</select>
              <fieldset><legend>Minimum 2026 relevance</legend><div className="score-options">{[0, 7, 8, 9].map(value => <button key={value} aria-pressed={minRelevance === value} className={minRelevance === value ? 'is-active' : ''} onClick={() => setMinRelevance(value)}>{value === 0 ? 'Any' : `${value}+`}</button>)}</div></fieldset>
              <label className="checkbox-label"><input type="checkbox" checked={crossListedOnly} onChange={event => setCrossListedOnly(event.target.checked)} /><span>Cross-listed problems only</span>{crossListedOnly && <Check size={14} />}</label>
            </div>
          </div>
          <button className="reset-button" onClick={resetFilters} disabled={!hasActiveFilters}>Reset filters {hasActiveFilters && <X size={13} />}</button>
        </aside>}

        <main className={`main-workspace ${viewMode === 'list' ? 'list-mode' : ''}`}>
          <div className="workspace-toolbar">
            <div className="breadcrumb">{activeCategory ? <><button onClick={() => selectCategory('ALL')}><ArrowLeft size={13} /> All categories</button><span>/</span><span className="accent-text">{activeCategory.name}</span></> : <span>Cybersecurity problem atlas</span>}</div>
            <span className="workspace-total">{hasActiveFilters ? `${matchingMaster.length} of ${dataset.totalUnique}` : dataset.totalUnique} unique problems</span>
          </div>
          {viewMode === 'map' ? <HexMap categories={dataset.categories} filteredByCategory={filteredByCategory} selectedCategory={selectedCategory} selectedProblem={selectedProblem} onSelectCategory={selectCategory} onSelectProblem={setSelectedProblem} /> : <ProblemList items={visibleItems} categories={dataset.categories} selectedProblem={selectedProblem} onSelectProblem={setSelectedProblem} />}
        </main>
      </div>

      <footer className="atlas-footer">
        <div className="atlas-intro"><h1>Find a problem worth solving.</h1><p>Real cybersecurity briefs. Explore a category,<br className="desktop-break" /> trace the overlaps, pick your next build.</p><button className="text-link" onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>{viewMode === 'map' ? 'Browse all problems' : 'Return to the map'}<ArrowUpRight size={13} /></button></div>
        <div className="atlas-meta"><dl className="atlas-stats"><div><dt>unique problems</dt><dd>{matchingMaster.length}</dd></div><div><dt>categories</dt><dd>{dataset.categories.length}</dd></div><div><dt>programs</dt><dd>{programCount}</dd></div><div><dt>cross-listed</dt><dd>{matchingMaster.filter(item => item.otherCategories.length > 0).length}</dd></div></dl><p>Each mark is a problem. Lines connect categories with shared briefs.<br />Open a category to explore. No account needed.</p></div>
      </footer>
      <ProblemDrawer problem={selectedProblem} categories={dataset.categories} onClose={() => setSelectedProblem(null)} onJumpCategory={jumpCategory} />
    </div>
  )
}
export default App
