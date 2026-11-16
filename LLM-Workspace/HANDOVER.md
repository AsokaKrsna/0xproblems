# 0xProblems current state

2026-11-16, Codex: Full visual redesign authorized, preserving data and features. Implemented warm parchment/orange radial atlas based on user-supplied Hexbrain screenshots.

- Project: `C:/Users/Durjoy Majumdar/Desktop/0xProblems` (neighbor of the chat's original PS_Collection workspace).
- Changed: `src/App.tsx`, `src/index.css`, all three `src/components/` files, `index.html`, local Recursive font and favicon.
- Original files preserved under `LLM-Workspace/before-redesign/`.
- Product facts: `PRODUCT.md`. Surface contract: `.impeccable/surfaces/atlas.md`.
- Final production build passed. Large dataset chunk warning removed: JS 256.12 kB (80.42 kB gzip), metadata index 305.7 kB (39.73 kB gzip). Full specifications fetch individually; description-search data loads only on first search. Desktop (1440x960 and 1366x768) and mobile (390x844) browser checks passed, including real clipboard, combined filters, search, sorting, category selection, direct map-node selection, camera rotation/reset, and no horizontal document overflow. No browser errors or failed resources.
- User rejected isolated category subgraphs. Current map keeps all 11 categories, 286 marks, and all connection paths permanently rendered. Category selection only moves/zooms/rotates the camera. Exact geometry and retained DOM identity are verified.
- Initial QA found inaccessible names on Copy brief and mobile icon controls, corrected. A later duplicate-label selector was scoped to its filter panel; no app defect was hidden.
- Mechanical detector returned no findings. Independent finish reviewer returned `ship`; evidence in `LLM-Workspace/finish-review.md` and `.impeccable/review/`. Design documentation complete: DESIGN.md and .impeccable/design.json record the actual palette, typography, controls, responsive behavior, and persistent graph navigation.
- Real membership is derived from sheets at runtime to avoid comma-split category errors. Dataset and workbook are unchanged.
- Local dev server: http://127.0.0.1:5173/. User authorized commit and push to https://github.com/AsokaKrsna/0xproblems.git on 2026-11-16.
- Follow-up 2026-11-16: fixed cursor XY axes now span the full rendered map including letterboxed sides; no fixed plus ornaments remain. Selected-category scrolling now steps next/previous category with fixed wheel center and focus slot, 45px threshold, 650ms step lock, and wraparound; Ctrl+scroll zooms; native inspector scrolling stays independent.
- Data pipeline now generates src/data/problems.web.json, src/data/manifest.json, public/data/briefs/<content-hash>.json, and a content-hashed search index. Source full JSON remains available locally. Generated assets are ignored and rebuilt from the workbook.
- New files: src/dataAccess.ts and src/vite-env.d.ts. main.tsx loads the index with retry; ProblemDrawer fetches full specifications with retry.
- Verified exact reconstruction of all 515 original records. Isolated workbook-growth fixture adds one brief and automatically generates all its assets; real workbook untouched.
- Production QA: .impeccable/review/wheel/qa-results.json; regression captures/checks under wheel/regression. All cursor-edge, wheel, on-demand fetch, full-text search, clipboard, and recovery checks passed. Independent follow-up reviewer: ship, no material fixes. Detector reported advisory palette/type-documentation exceptions only; no unrelated restyling was performed.
- Scale limits: metadata, map DOM, and first-search description index still grow. Future work, when warranted: graph level of detail, paginated results, server full-text search.
- Backups of pre-follow-up source: LLM-Workspace/before-wheel-scaling/.
- Next: user review in local preview. Independent motion-correction reviewer returned ship, no material fixes. Production tests and all existing regression checks pass; no pending implementation.
