# 0xProblems

An open, zero-login cybersecurity problem atlas built directly from `Classified_Cybersecurity_Problem_statement_collection.xlsx`.

## Updating the Dataset

1. Replace `Classified_Cybersecurity_Problem_statement_collection.xlsx` in the repository root.
2. Commit and push to GitHub.
3. Vercel automatically runs `npm run build`, which invokes `scripts/sync-excel.mjs` to regenerate the data assets from all sheets in the Excel workbook and deploys the updated static site.

## Local Development

```bash
npm install
npm run dev
```

To test only the Excel-to-JSON sync:

```bash
npm run sync
```

## Data loading and growth

The Excel workbook remains the source of truth. Add each brief to the master sheet and its relevant category sheets, keeping their IDs and membership consistent.

`npm run sync` produces the full local JSON, a lightweight browser index, content-addressed individual specifications, and a separate description-search index. Generated files are ignored by Git and recreated during development and production builds.

The map initially downloads metadata only. Opening a brief fetches its specification; the first text search fetches the description-search index. Identical descriptions share one specification file. Downloads are reused during the session, and failed downloads have retry controls. The workbook update workflow stays the same as the collection grows.

This reduces initial loading and JavaScript parsing. Metadata, graph geometry, and the optional full-text index still grow with the collection. Larger collections will eventually need graph aggregation or level-of-detail rendering, paginated results, and server-side full-text search. The current static implementation does not claim unbounded scale.

## Map controls

- Overview: scroll to zoom. After selecting a category: scroll down for the next category or up for the previous one. The wheel center and focused position stay anchored; motion snaps one category at a time and wraps around.
- Ctrl+scroll or the zoom controls change scale; dragging pans. The problem index scrolls independently.
- Mouse crosshairs follow the cursor across the full visible map, including the space beside the circle. Their coordinates are map-viewport pixels. They hide outside the map and during touch input.
