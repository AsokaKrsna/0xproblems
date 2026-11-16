---
name: 0xProblems
description: A warm, precise cybersecurity problem atlas.
colors:
  bg: "#14130f"
  surface: "#1f1e18"
  surface-hover: "#29271f"
  line: "#38352b"
  ink: "#e9e2cf"
  muted: "#a39b85"
  faint: "#746e5e"
  accent: "#ff784c"
typography:
  headline:
    fontFamily: "Recursive, ui-monospace, monospace"
    fontSize: "27px"
    fontWeight: 500
    lineHeight: 1.35
  title:
    fontFamily: "Recursive, ui-monospace, monospace"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: "Recursive, ui-monospace, monospace"
    fontSize: "13px"
    lineHeight: 1.95
  label:
    fontFamily: "Recursive, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
  control:
    fontFamily: "Recursive, ui-monospace, monospace"
    fontSize: "12px"
rounded:
  badge: "2px"
  compact: "3px"
  control: "4px"
  group: "6px"
spacing:
  control-gap: "9px"
  panel: "20px"
  mobile-gutter: "22px"
  reading-panel: "30px"
  desktop-gutter: "36px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
  button-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  button-quiet-hover:
    backgroundColor: "{colors.surface-hover}"
  view-tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.control}"
    padding: "7px 13px"
  category-option:
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "10px 8px"
  map-preview:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "15px"
  filter-select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 10px"
---

# Design System: 0xProblems

## Overview

**Creative North Star: "The Warm Instrument Atlas"**

A warm, precise instrument for exploring cybersecurity briefs. Parchment text, fine olive-brown rules, and small Recursive controls keep dense information readable against a warm black field. Orange identifies interactions, selected objects, and important scores.

The interface feels like a working atlas: radial geometry, hexagonal anchors, and quiet numeric metadata provide orientation. Panels belong to the same flat material as the workspace; their boundaries come from tone and rules.

**Key Characteristics:**

- Warm dark surfaces with parchment text.
- One self-hosted variable family, Recursive.
- Compact controls and tabular numeric metadata.
- Fine geometric drawing with flat, ruled panels.

## Colors

The palette is warm black, parchment, and muted olive-brown, with one orange accent. The frontmatter records the reusable CSS custom properties; graph-specific stroke shades remain local drawing details.

### Primary

- **Signal Orange** (`accent`): active filters, selected graph anchors, focus indicators, interactive IDs, and score emphasis. Primary source links acquire this fill on hover.

### Neutral

- **Warm Black** (`bg`): application field, drawer, filter panel, and graph-anchor interiors.
- **Instrument Surface** (`surface`): quiet buttons, segmented navigation, fields, and previews.
- **Raised Tone** (`surface-hover`): hovered controls.
- **Olive Rule** (`line`): row dividers, input borders, and panel edges.
- **Parchment** (`ink`): primary text and inverted selected controls.
- **Muted Olive** (`muted`): supporting text, labels, and counts.
- **Faint Olive** (`faint`): low-emphasis separators; it is not the body-text color.

**The Interaction Orange Rule.** Use orange for interactive identifiers, selection, focus, and score emphasis. Keep passive structure in the parchment and olive-brown family.

## Typography

**Display Font:** Recursive, with ui-monospace and monospace fallbacks.
**Body Font:** The same family. The variable font is self-hosted at `/fonts/recursive-latin.woff2`, loaded with swap, and licensed in the adjacent font directory.

The typography is technical and compact without introducing a second voice. Weight changes are restrained; numbers use tabular figures wherever comparison matters.

### Hierarchy

- **Headline:** brief title; the frontmatter records its desktop size and line-height. It reduces to 23px on mobile.
- **Title:** category-inspector headings; the explorer heading uses 24px, reducing to 22px on mobile.
- **Body:** long specification paragraphs use the body token. List titles also use 13px with a tighter 1.6 line-height.
- **Label:** category filters, provenance, and supporting metadata; secondary counts also use 10px.
- **Control:** buttons, tabs, and compact actions.
- **Identity:** the desktop wordmark uses 22px, weight 550, and .19em tracking. This tracking belongs to the wordmark, not normal labels.

SVG label sizes are drawing coordinates and change with the camera; they do not define a reusable type ramp for HTML content.

**The Shared Instrument Rule.** Use Recursive for headings, controls, prose, and map labels; distinguish roles with size, weight, and spacing.

## Layout

Desktop uses a full-height flex workspace with a three-column header: navigation, centered identity, and tools. The desktop gutter is reused across the header, toolbar, footer, and explorer. The map fills available space; the category inspector is 340px wide, increasing to 380px above 1500px and reducing to 300px below 1100px. The reading drawer is 610px wide with a 100% maximum.

Below 1100px, gutters narrow to 25px and the explorer omits its impact column. At 760px and below, the page becomes vertically scrollable, the header becomes two columns, map labels yield to a two-column category directory, and the inspector follows the map. The mobile map is about 320px tall. The explorer retains ID, title, and relevance, while its table scroll region is capped at 65dvh. Mobile gutters use the frontmatter token. Compact-height desktop rules also reduce header and footer density.

Spacing is component-specific rather than a universal arithmetic scale. Reuse the recorded gutters and panel padding; preserve fine internal spacing from the relevant component.

## Elevation & Depth

Depth comes from tonal surfaces, one-pixel borders, and dark transparent scrims. Filter and detail panels overlay the workspace without shadows. The detail scrim is denser than the filter scrim, reflecting its modal role.

**The Ruled Surface Rule.** Separate panels and rows with tone and fine borders. The implementation uses no box shadows.

## Shapes

Controls have small radii; grouped navigation is slightly softer. Content panels, ruled lists, and table rows keep straight edges. Hexagonal anchors, small square problem marks, and circular orbit guides form the atlas vocabulary. Strokes do not scale with map zoom.

## Components

### Buttons

Quiet actions are compact, surface-filled controls; hover raises their tone. Primary source actions invert parchment and warm black, then become orange on hover. Icon actions use the same small radius and a hovered surface. Global focus-visible uses an orange outline (2px) offset by 4px. Disabled buttons have .35 opacity and the default cursor.

### Navigation

View navigation sits inside a soft grouped surface. The active segment inverts to parchment and warm black; inactive segments are muted and brighten on hover. Keep SVG icons adjacent to their text labels. On mobile, the view switch occupies a second header row.

### Inputs / Fields

Search is a borderless field in a ruled horizontal surface with an orange caret and muted placeholder. Filter selects use a one-pixel olive rule, surface fill, and control radius. Checkboxes use orange as the native accent. Minimum-score choices use surface segments with inverted selection.

### Tags

Brief metadata uses plain muted text separated by a slash; it is not a rounded chip system. The small orange filter-count badge is an action-state indicator.

### Cards / Containers

The map preview is a small surface-filled container with the control radius. Filter panels, category inspectors, drawers, and explorer rows use rules rather than detached card shells. The detail drawer traps focus and returns it on close; its footer keeps copy and source actions available while the body scrolls. Specifications load on demand. The specification area shows loading or an actionable retry message; copy stays disabled until the complete specification is available. Metadata-load failures provide a centered retry state in the same palette.

### Persistent Radial Atlas

Each category occupies a radial sector with a hexagonal anchor, problem marks, and actual cross-category connections. Hover emphasizes related structure. Category focus zooms, pans, and rotates the same graph into view: all categories and connections remain rendered, including paths continuing off-screen. Reset changes the camera only.

Cursor axes follow mouse or pen movement across the entire rendered map viewport, including SVG letterboxing. They stay screen-aligned while the graph rotates, show viewport pixel coordinates, and hide on pointer exit or touch. Fixed center and corner crosses are absent. Crosshair strokes use the local olive drawing shade #756c55.

After category selection, ordinary wheel input steps to the next or previous category. The expanded wheel center and focused slot stay anchored while the original connected graph rotates to that slot over 650ms. Scroll deltas accumulate to a 45px threshold with a 650ms step lock; navigation wraps, retains user zoom and pan, and updates the inspector. Previous/next buttons offer the same navigation. Ctrl+wheel and zoom controls change scale; wheel input over the inspector keeps native panel scrolling.

Camera transitions use 650ms with cubic-bezier(.16,1,.3,1); direct dragging disables that interpolation. Relationship emphasis uses 180ms ease-out. The drawer enters over 220ms. Reduced-motion preferences shorten animations and transitions to .01ms. Mobile permits ordinary vertical touch scrolling and provides a readable category directory.

## Do's and Don'ts

### Do:

- **Do** reuse the eight CSS custom properties for common interface colors.
- **Do** keep numeric scores and counts aligned with tabular numerals.
- **Do** retain visible focus indicators and respect reduced-motion preferences.
- **Do** keep map geometry and connections mounted when moving the camera into a category.

### Don't:

- **Don't** introduce additional accent hues into this established palette.
- **Don't** replace the persistent map with an isolated category diagram.
- **Don't** treat tiny SVG coordinate-space text as an interface text-size token.
- **Don't** add decorative shadows or large rounded cards to the flat atlas material.
