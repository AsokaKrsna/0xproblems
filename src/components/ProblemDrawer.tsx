import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Check, Copy, X } from 'lucide-react'
import { loadDescription } from '../dataAccess'
import type { ProblemCategory, ProblemItem } from '../types'

interface ProblemDrawerProps {
  problem: ProblemItem | null
  categories: ProblemCategory[]
  onClose: () => void
  onJumpCategory: (category: string, title: string) => void
}
function descriptionSections(raw: string) {
  return raw.replace(/\s*\|\|\s*BUILD SPEC/gi, '\n\nBUILD SPEC')
    .replace(/\s*•\s*(Background|Detailed Description|Expected Solutions?|Deliverables?|Current Scope|Problem Statement)/gi, '\n\n$1')
    .replace(/\s+(PROBLEM OVERVIEW|ISSUES AND THREATS|BUSINESS CONTEXT|POSSIBLE TARGETS|INDUSTRY USE CASES|Expected Outcome:)/g, '\n\n$1')
    .split(/\n{2,}/).map(section => section.trim()).filter(Boolean)
}
export function ProblemDrawer({ problem, categories, onClose, onJumpCategory }: ProblemDrawerProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [description, setDescription] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState(false)
  const [descriptionAttempt, setDescriptionAttempt] = useState(0)
  useEffect(() => {
    if (!problem) return
    let active = true
    setDescription(null); setDescriptionError(false)
    loadDescription(problem).then(text => {
      if (active) setDescription(text)
    }).catch(() => {
      if (active) setDescriptionError(true)
    })
    return () => { active = false }
  }, [problem, descriptionAttempt])
  const paragraphs = useMemo(() => descriptionSections(description ?? ''), [description])
  useEffect(() => {
    if (!problem) return
    const previousFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    setCopyState('idle')
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const elements = panelRef.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]')
      if (!elements?.length) return
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trapFocus)
    return () => { document.removeEventListener('keydown', trapFocus); previousFocus?.focus(); clearTimeout(copyTimer.current) }
  }, [problem])
  if (!problem) return null
  const category = categories.find(item => item.name === problem.category)
  const copyBrief = async () => {
    if (description === null) return
    try {
      await navigator.clipboard.writeText([
        `# ${problem.id} — ${problem.title}`, `- **Category:** ${problem.category}`,
        `- **Build Type:** ${problem.buildType}`, `- **Domain / Sub-Domain:** ${problem.domain} / ${problem.subDomain}`,
        `- **2026 Relevance:** ${problem.relevance2026}/10 | **Demand/Impact:** ${problem.demandImpact}/10`,
        `- **Program:** ${problem.competition} (${problem.editionYear}, ${problem.region})`,
        `- **Agency:** ${problem.agency}`, problem.sourceUrl ? `- **Source:** ${problem.sourceUrl}` : '', '', description,
      ].filter(Boolean).join('\n'))
      setCopyState('copied')
    } catch { setCopyState('failed') }
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopyState('idle'), 2500)
  }
  return <div className="detail-overlay">
    <div className="detail-scrim" onClick={onClose} aria-hidden="true" />
    <aside ref={panelRef} className="problem-drawer" role="dialog" aria-modal="true" aria-labelledby="brief-title">
      <header className="drawer-header"><div className="drawer-breadcrumb"><span>{problem.id}</span><span>/</span><span>{category?.code ?? problem.category}</span></div><button ref={closeRef} className="quiet-button" aria-label="Close problem details" onClick={onClose}>Close<kbd>Esc</kbd><X size={15} /></button></header>
      <div className="drawer-body">
        <h2 id="brief-title">{problem.title}</h2>
        <div className="brief-tags"><span>{problem.category}</span><span>{problem.buildType}</span></div>
        <dl className="brief-scores"><div><dt>2026 relevance</dt><dd>{problem.relevance2026}<small> / 10</small></dd></div><div><dt>Demand / impact <span>(approx.)</span></dt><dd>{problem.demandImpact}<small> / 10</small></dd></div></dl>
        <section className="brief-specification"><h3>Problem specification</h3>{descriptionError ? <p role="alert">The specification could not load. <button className="text-link" onClick={() => setDescriptionAttempt(value => value + 1)}>Try again</button></p> : description === null ? <p role="status">Loading specification…</p> : null}{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
        {problem.otherCategories.length > 0 && <section className="brief-cross-links"><h3>Also appears in</h3>{problem.otherCategories.map(other => <button key={other} onClick={() => onJumpCategory(other, problem.title)}>{other}<ArrowUpRight size={14} /></button>)}</section>}
        <section className="brief-provenance"><h3>Provenance & taxonomy</h3><dl>{[
          ['Domain', problem.domain], ['Subdomain', problem.subDomain], ['Program', problem.competition],
          ['Edition / year', problem.editionYear], ['Region', problem.region], ['Agency', problem.agency],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl></section>
      </div>
      <footer className="drawer-footer"><button className="quiet-button" aria-label="Copy brief" onClick={copyBrief} disabled={description === null}>{copyState === 'copied' ? <Check size={15} /> : <Copy size={15} />}<span role="status">{copyState === 'copied' ? 'Brief copied' : copyState === 'failed' ? 'Copy failed · retry' : 'Copy brief'}</span></button>{problem.sourceUrl && <a className="primary-button" href={problem.sourceUrl} target="_blank" rel="noreferrer">Original source<ArrowUpRight size={15} /></a>}</footer>
    </aside>
  </div>
}
