import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown, ChevronUp, LocateFixed, Minus, Plus } from 'lucide-react'
import type { ProblemCategory, ProblemItem } from '../types'

interface HexMapProps {
  categories: ProblemCategory[]
  filteredByCategory: Map<string, ProblemItem[]>
  selectedCategory: string
  selectedProblem: ProblemItem | null
  onSelectCategory: (name: string) => void
  onSelectProblem: (item: ProblemItem) => void
}
const TAU = Math.PI * 2, CX = 600, CY = 365
function point(angle: number, radius: number) { return { x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius } }
function arc(start: number, end: number, radius: number) {
  const a = point(start, radius), b = point(end, radius)
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${end - start > Math.PI ? 1 : 0} 1 ${b.x} ${b.y}`
}
function hex(x: number, y: number, radius: number) {
  return Array.from({ length: 6 }, (_, index) => `${x + Math.cos(index * TAU / 6 - Math.PI / 2) * radius},${y + Math.sin(index * TAU / 6 - Math.PI / 2) * radius}`).join(' ')
}
function labelLines(text: string) {
  if (text.length < 25) return [text]
  const split = text.lastIndexOf(' ', 24)
  return [text.slice(0, split), text.slice(split + 1)]
}

export function HexMap({ categories, filteredByCategory, selectedCategory, selectedProblem, onSelectCategory, onSelectProblem }: HexMapProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [hoveredProblem, setHoveredProblem] = useState<ProblemItem | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [cameraOffset, setCameraOffset] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const svgRef = useRef<SVGSVGElement>(null)
  const cursorRef = useRef<SVGGElement>(null)
  const horizontalAxisRef = useRef<SVGLineElement>(null)
  const verticalAxisRef = useRef<SVGLineElement>(null)
  const cursorLabelRef = useRef<SVGTextElement>(null)
  const cursorFrame = useRef<number | null>(null)
  const lastSelection = useRef('ALL')
  const wheelGesture = useRef({ delta: 0, lastEvent: 0, lastStep: -Infinity })
  const drag = useRef({ x: 0, y: 0, panX: 0, panY: 0, moved: false })
  const activeCategory = categories.find(category => category.name === selectedCategory)
  const activeItems = activeCategory ? filteredByCategory.get(activeCategory.name) ?? [] : []
  const layout = useMemo(() => categories.map((category, index) => {
    const angle = -Math.PI / 2 + index * TAU / categories.length
    const items = filteredByCategory.get(category.name) ?? []
    const columns = Math.min(9, Math.max(3, Math.ceil(Math.sqrt(items.length * 1.25))))
    const rows = Math.ceil(items.length / columns)
    return { category, angle, anchor: point(angle, 151), label: point(angle, 326), items,
      marks: items.map((item, index) => {
        const a = angle + ((index % columns) - (columns - 1) / 2) * 0.035
        const radius = 222 + Math.floor(index / columns) * Math.min(10, 67 / Math.max(1, rows - 1))
        return { item, angle: a, position: point(a, radius), bend: point(a, 210) }
      }),
    }
  }), [categories, filteredByCategory])
  const reset = () => { setZoom(1); setRotation(0); setCameraOffset(0); setPan({ x: 0, y: 0 }) }
  useEffect(() => {
    const alreadyExpanded = lastSelection.current !== 'ALL'
    lastSelection.current = selectedCategory
    setHoveredProblem(null); setHoveredCategory(null)
    const index = categories.findIndex(category => category.name === selectedCategory)
    if (index < 0) { reset(); return }
    const angle = -Math.PI / 2 + index * TAU / categories.length
    setCameraOffset(224)
    if (!alreadyExpanded) { setZoom(3); setPan({ x: 0, y: 0 }) }
    setRotation(previous => {
      const target = 180 - angle * 180 / Math.PI
      return previous + ((target - previous + 180) % 360 + 360) % 360 - 180
    })
  }, [selectedCategory, categories])
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const update = () => setCompact(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const element = svgRef.current
    if (!element) return
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      if (selectedCategory !== 'ALL' && !event.ctrlKey && !event.metaKey) {
        const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1)
        const now = performance.now(), gesture = wheelGesture.current
        if (now - gesture.lastEvent > 160) gesture.delta = 0
        gesture.lastEvent = now
        if (now - gesture.lastStep < 650) return
        gesture.delta += pixels
        if (Math.abs(gesture.delta) < 45) return
        const index = categories.findIndex(category => category.name === selectedCategory)
        const direction = gesture.delta > 0 ? 1 : -1
        gesture.delta = 0; gesture.lastStep = now
        const next = categories[(index + direction + categories.length) % categories.length]
        if (next) onSelectCategory(next.name)
      }
      else setZoom(value => Math.max(0.4, Math.min(7, value * (event.deltaY < 0 ? 1.08 : 0.92))))
    }
    element.addEventListener('wheel', wheel, { passive: false })
    return () => element.removeEventListener('wheel', wheel)
  }, [selectedCategory, categories, onSelectCategory])
  const stepCategory = (direction: number) => {
    const index = categories.findIndex(category => category.name === selectedCategory)
    if (index < 0 || !categories.length) return
    onSelectCategory(categories[(index + direction + categories.length) % categories.length].name)
  }
  useEffect(() => () => { if (cursorFrame.current !== null) cancelAnimationFrame(cursorFrame.current) }, [])
  const hideCursor = () => {
    if (cursorFrame.current !== null) cancelAnimationFrame(cursorFrame.current)
    cursorFrame.current = null
    cursorRef.current?.setAttribute('visibility', 'hidden')
  }
  const moveCursor = (event: { clientX: number; clientY: number; pointerType: string }) => {
    if (event.pointerType === 'touch') { hideCursor(); return }
    if (cursorFrame.current !== null) cancelAnimationFrame(cursorFrame.current)
    const { clientX, clientY } = event
    cursorFrame.current = requestAnimationFrame(() => {
      cursorFrame.current = null
      const svg = svgRef.current, matrix = svg?.getScreenCTM()
      if (!svg || !matrix || !cursorRef.current) return
      const inverse = matrix.inverse()
      const position = new DOMPoint(clientX, clientY).matrixTransform(inverse)
      const bounds = svg.getBoundingClientRect()
      // The rendered SVG can be wider than its letterboxed viewBox.
      const start = new DOMPoint(bounds.left, bounds.top).matrixTransform(inverse)
      const end = new DOMPoint(bounds.right, bounds.bottom).matrixTransform(inverse)
      horizontalAxisRef.current?.setAttribute('x1', String(start.x))
      horizontalAxisRef.current?.setAttribute('x2', String(end.x))
      horizontalAxisRef.current?.setAttribute('y1', String(position.y))
      horizontalAxisRef.current?.setAttribute('y2', String(position.y))
      verticalAxisRef.current?.setAttribute('x1', String(position.x))
      verticalAxisRef.current?.setAttribute('x2', String(position.x))
      verticalAxisRef.current?.setAttribute('y1', String(start.y))
      verticalAxisRef.current?.setAttribute('y2', String(end.y))
      const label = cursorLabelRef.current
      if (label) {
        const nearRight = clientX > bounds.right - 130
        label.setAttribute('text-anchor', nearRight ? 'end' : 'start')
        label.setAttribute('x', String(position.x + (nearRight ? -12 : 12)))
        label.setAttribute('y', String(position.y < start.y + 25 ? position.y + 20 : position.y - 12))
        label.textContent = `x ${Math.round(clientX - bounds.left)} · y ${Math.round(clientY - bounds.top)}`
      }
      cursorRef.current.setAttribute('visibility', 'visible')
    })
  }
  const bridges = useMemo(() => {
    const result: { a: typeof layout[number], b: typeof layout[number], count: number }[] = []
    for (let a = 0; a < layout.length; a++) for (let b = a + 1; b < layout.length; b++) {
      const titles = new Set(layout[a].items.map(item => item.title))
      const count = layout[b].items.filter(item => titles.has(item.title)).length
      if (count) result.push({ a: layout[a], b: layout[b], count })
    }
    return result
  }, [layout])
  const emphasized = hoveredCategory ?? activeCategory?.name ?? null
  const relatedNames = new Set(bridges.filter(bridge => bridge.a.category.name === emphasized || bridge.b.category.name === emphasized).flatMap(bridge => [bridge.a.category.name, bridge.b.category.name]))
  const preview = hoveredProblem ?? selectedProblem
  const groups = new Set(activeItems.map(item => item.subDomain || item.domain))
  const total = layout.reduce((count, node) => count + node.items.length, 0)

  return <div className={`map-surface ${activeCategory ? 'category-focused' : ''}`}>
    <div className="map-canvas">
      <svg ref={svgRef} className={`atlas-svg ${dragging ? 'is-dragging' : ''}`} viewBox={compact ? '250 15 700 700' : '0 0 1200 740'} role="group" aria-label={activeCategory ? `${activeCategory.name} in the connected problem map` : 'Interactive cybersecurity category map'}
        onPointerDown={event => {
          if (event.button !== 0) return
          drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y, moved: false }; setDragging(true)
        }}
        onPointerMove={event => {
          moveCursor(event)
          if (!dragging) return
          const bounds = svgRef.current?.getBoundingClientRect()
          const scale = bounds ? Math.max((compact ? 700 : 1200) / bounds.width, (compact ? 700 : 740) / bounds.height) : 1
          const x = (event.clientX - drag.current.x) * scale, y = (event.clientY - drag.current.y) * scale
          if (Math.abs(x) + Math.abs(y) > 5) drag.current.moved = true
          setPan({ x: drag.current.panX + x, y: drag.current.panY + y })
        }}
        onPointerUp={() => setDragging(false)} onPointerCancel={() => { setDragging(false); hideCursor() }} onPointerLeave={() => { setDragging(false); setHoveredProblem(null); setHoveredCategory(null); hideCursor() }}>
        <g className="map-world" transform={`translate(${CX + pan.x} ${CY + pan.y}) scale(${zoom}) translate(${cameraOffset} 0) rotate(${rotation}) translate(${-CX} ${-CY})`}>
          <circle cx={CX} cy={CY} r={312} className="map-orbit" />
          <circle cx={CX} cy={CY} r={204} className="map-inner-orbit" />
          {bridges.map(({ a, b, count }) => {
            const lit = emphasized === a.category.name || emphasized === b.category.name
            return <path key={`${a.category.code}-${b.category.code}`} data-connection={`${a.category.code}-${b.category.code}`} d={`M ${a.anchor.x} ${a.anchor.y} C ${CX} ${CY}, ${CX} ${CY}, ${b.anchor.x} ${b.anchor.y}`} className={`map-bridge ${lit ? 'is-lit' : ''}`} strokeWidth={lit ? 1.1 + Math.min(count / 12, 1) : 0.5 + Math.min(count / 20, 1)} opacity={emphasized ? lit ? 0.95 : 0.15 : 0.26}><title>{a.category.name} ↔ {b.category.name}: {count} shared problems</title></path>
          })}
          {layout.map(({ category, angle, anchor, label, items, marks }) => {
            const isFocused = category.name === activeCategory?.name
            const lit = emphasized === category.name
            const dim = emphasized !== null && !lit && !relatedNames.has(category.name)
            const lines = labelLines(category.name)
            const textAnchor = Math.abs(Math.cos(angle)) < 0.15 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end'
            const select = () => { if (!drag.current.moved) onSelectCategory(category.name) }
            return <g key={category.name} data-category={category.name} className={`category-sector ${lit ? 'is-lit' : ''} ${isFocused ? 'is-focused' : ''}`} opacity={dim ? 0.3 : items.length ? 1 : 0.25}
              onMouseEnter={() => setHoveredCategory(category.name)} onMouseLeave={() => setHoveredCategory(null)}>
              <path d={arc(angle - 0.235, angle + 0.235, 305)} className="sector-arc" />
              <path d={`M ${anchor.x} ${anchor.y} L ${point(angle, 210).x} ${point(angle, 210).y}`} className="sector-stem" />
              {marks.map(({ item, position: p, bend, angle: a }) => {
                const highlighted = isFocused && preview?.id === item.id && preview.category === item.category
                return <g key={item.id} className={`problem-node ${highlighted ? 'is-lit' : ''}`} role="button" tabIndex={isFocused ? 0 : -1} aria-label={`Open ${item.id}: ${item.title}`}
                  onMouseEnter={() => { if (isFocused) setHoveredProblem(item) }} onMouseLeave={() => setHoveredProblem(null)} onFocus={() => setHoveredProblem(item)} onBlur={() => setHoveredProblem(null)}
                  onClick={event => { event.stopPropagation(); if (drag.current.moved) return; if (isFocused) onSelectProblem(item); else onSelectCategory(category.name) }}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectProblem(item) } }}>
                  <path d={`M ${anchor.x} ${anchor.y} Q ${bend.x} ${bend.y} ${p.x} ${p.y}`} className="problem-thread" />
                  <rect x={p.x - 2.1} y={p.y - 2.1} width={4.2} height={4.2} transform={`rotate(${a * 180 / Math.PI} ${p.x} ${p.y})`} className="problem-mark"><title>{item.id}: {item.title}</title></rect>
                  {isFocused && <circle cx={p.x} cy={p.y} r={4.2} fill="transparent" />}
                  {highlighted && <text x={p.x} y={p.y - 7} transform={`rotate(${-rotation} ${p.x} ${p.y})`} textAnchor="middle" className="world-problem-label">{item.id}</text>}
                </g>
              })}
              <g role="button" tabIndex={0} aria-label={`Explore ${category.name}, ${items.length} problems`} className="category-target" onClick={select} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectCategory(category.name) } }} onFocus={() => setHoveredCategory(category.name)} onBlur={() => setHoveredCategory(null)}>
                <circle cx={anchor.x} cy={anchor.y} r={12} fill="transparent" />
                <polygon points={hex(anchor.x, anchor.y, isFocused ? 10 : 7)} className="category-anchor" />
                <circle cx={anchor.x} cy={anchor.y} r={2} className="category-anchor-dot" />
                {isFocused && <text x={anchor.x} y={anchor.y + 18} textAnchor="middle" transform={`rotate(${-rotation} ${anchor.x} ${anchor.y})`} className="focused-category-code">{category.code}</text>}
                <g className="world-caption" transform={`rotate(${-rotation} ${label.x} ${label.y})`}>
                  <text x={label.x} y={label.y - (lines.length > 1 ? 6 : 0)} textAnchor={textAnchor} className="category-label">{lines.map((line, index) => <tspan key={line} x={label.x} dy={index ? 17 : 0}>{line}</tspan>)}</text>
                  <text x={label.x} y={label.y + (lines.length > 1 ? 29 : 19)} textAnchor={textAnchor} className="category-count">{items.length} problems</text>
                </g>
                {!activeCategory && <path d={arc(angle - 0.245, angle + 0.245, 260)} stroke="transparent" strokeWidth={120} fill="none" />}
              </g>
            </g>
          })}
        </g>
        <g ref={cursorRef} className="cursor-crosshair" visibility="hidden" aria-hidden="true"><line ref={horizontalAxisRef} /><line ref={verticalAxisRef} /><text ref={cursorLabelRef} /></g>
      </svg>
      {!total && <div className="map-empty"><h2>No matching problems</h2><p>Try a different search or clear your filters.</p></div>}
      <div className="map-bottom-bar"><span className="map-hint">{activeCategory ? 'Scroll for next / previous category' : 'Select a category to explore'}<span> · Ctrl + scroll to zoom</span></span><div className="zoom-controls">{activeCategory && <><button aria-label="Previous category" onClick={() => stepCategory(-1)}><ChevronUp size={14} /></button><button aria-label="Next category" onClick={() => stepCategory(1)}><ChevronDown size={14} /></button></>}<button aria-label="Zoom out" onClick={() => setZoom(value => Math.max(0.4, value / 1.2))} disabled={zoom <= 0.4}><Minus size={14} /></button><output aria-label="Zoom level">{Math.round(zoom * 100)}%</output><button aria-label="Zoom in" onClick={() => setZoom(value => Math.min(7, value * 1.2))} disabled={zoom >= 7}><Plus size={14} /></button><button aria-label="Reset map view" onClick={reset}><LocateFixed size={14} /></button></div></div>
      {preview && activeCategory && <div className="map-preview"><span>{preview.id} · Relevance {preview.relevance2026}/10</span><p>{preview.title}</p></div>}
    </div>
    {!activeCategory && <nav className="mobile-category-directory" aria-label="Explore categories">{layout.map(({ category, items }) => <button key={category.name} onClick={() => onSelectCategory(category.name)}><span>{category.name}</span><span>{items.length}</span></button>)}</nav>}
    {activeCategory && <section className="category-inspector" aria-label={`${activeCategory.name} problems`}>
      <h2>{activeCategory.name}</h2><p className="inspector-summary">{activeItems.length} problems <span>·</span> {groups.size} subdomains</p>
      <p className="inspector-help">Scroll up or down over the map for the previous or next category. Ctrl + scroll zooms; drag pans.</p>
      <h3>Problems in this category</h3>
      <div className="category-problem-list">{activeItems.map(item => <button key={item.id} className={preview?.id === item.id ? 'is-selected' : ''} onMouseEnter={() => setHoveredProblem(item)} onMouseLeave={() => setHoveredProblem(null)} onFocus={() => setHoveredProblem(item)} onBlur={() => setHoveredProblem(null)} onClick={() => onSelectProblem(item)}><span className="inspector-item-meta"><span>{item.id}</span><span>{item.relevance2026}/10</span></span><span className="inspector-item-title">{item.title}<ArrowUpRight size={13} /></span></button>)}</div>
      {!activeItems.length && <p className="inspector-help">No problems match. Try clearing your filters.</p>}
    </section>}
  </div>
}
