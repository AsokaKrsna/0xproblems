# 0xProblems

<!-- impeccable:product-schema 1 -->

## Platform
web

## Product purpose
An open, zero-login cybersecurity problem atlas. Users explore categories, search and filter briefs, compare scores, and open complete specifications and original source links.

## Capabilities and constraints
- Existing React 19, TypeScript, Vite application. Preserve the existing workbook and Excel-to-JSON build workflow.
- The current workbook contains 229 unique problems and 11 category sheets. Category membership includes duplicates across sheets.
- Preserve map and explorer views, category navigation, all filters, sorting, full specifications, relevance and impact scores, source links, Markdown copy, and category cross-links.
- Source membership is defined by category sheets. A comma is not a safe separator for category names, since names contain commas.
- A visual redesign of the entire interface was explicitly confirmed by the user on 2026-11-16. No deployment, commit, or push was requested.

## Brand commitments
Keep the 0xProblems name. The user requested a cooler, more interesting interface with less generic AI styling, referencing https://hexbrainai.com/ and supplying four screenshots. The reference commits the direction to warm dark surfaces, parchment type, orange interaction states, and a radial data map.

## Evidence on hand
`Classified_Cybersecurity_Problem_statement_collection.xlsx`, generated `src/data/problems.json`, existing application behavior, supplied screenshots, and retrieved reference CSS. No testimonials, commercial claims, or usage metrics may be invented.

## Open decisions
Primary audience was not explicitly specified. The implementation assumes users are choosing cybersecurity engineering problems to investigate or build.

## Data growth
The user expects to add more problem statements over time. Keep workbook regeneration automatic. Initial map metadata, on-demand specifications, and optional description-search data are separate assets. Preserve full-text description search and original specification text. The static map and search index still have finite scale; backend search and graph aggregation remain future work when measured growth warrants them.
