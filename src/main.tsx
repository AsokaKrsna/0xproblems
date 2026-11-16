import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { loadDataset } from './dataAccess'
import type { ProblemsDataset } from './types'

let indexRequest: Promise<ProblemsDataset> | undefined
function getDataset() {
  if (!indexRequest) indexRequest = loadDataset().catch(error => { indexRequest = undefined; throw error })
  return indexRequest
}
function DatasetApp() {
  const [dataset, setDataset] = useState<ProblemsDataset | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setFailed(false)
    getDataset().then(data => { if (active) setDataset(data) }).catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [attempt])
  if (dataset) return <App dataset={dataset} />
  return <main className="dataset-state"><h1><span>0x</span>PROBLEMS</h1>{failed ? <><p role="alert">The problem atlas could not load. Check your connection and try again.</p><button className="primary-button" onClick={() => setAttempt(value => value + 1)}>Try again</button></> : <p role="status">Loading the problem atlas…</p>}</main>
}
createRoot(document.getElementById('root')!).render(<StrictMode><DatasetApp /></StrictMode>)
