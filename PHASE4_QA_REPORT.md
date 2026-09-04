# PHASE 4 QA REPORT — Layout Safety / Overlap Verification

## Scope
Phase 4 verifies layout-level safety after the Phase 3 reference tuning. No CMS, Supabase, authentication, project data, or window behavior was intentionally changed.

## Layout safety change
- Added a deliberate desktop `margin-right: 176px` reservation to `.bottom-widgets` so the lower content row ends before the fixed companion area.
- The reservation is removed at <=1200px and <=900px so tablet/mobile layouts remain full-width stacked layouts.

## Static verification
- `node --check app.js`: PASS
- `node --check` on all `content/*.js`: PASS
- CSS brace balance: PASS (262 opening / 262 closing)
- Required internal asset references inspected: PASS

## Automated browser collision harness
Added `qa/overlap-check.js` for actual-browser DOM `getBoundingClientRect()` checks covering:
- dock vs cards
- dock vs page/text area
- dock vs hero buttons
- dock vs companion
- companion vs lower cards
- companion vs hero buttons
- status vs portrait
- status vs hero
- left rail vs hero
- app-window rectangles for system-bar/dock review

## Browser execution
BLOCKED in this environment. Chromium headless navigation does not complete even against the local HTTP server, so actual DOM rectangles, screenshot diff, browser console, and network captures cannot be truthfully marked PASS here.

## Result
- Layout safety code change: PASS
- Static regression: PASS
- Actual browser collision test: BLOCKED
- Pixel-level visual comparison: BLOCKED

## Next verification
Run the page in a normal browser at 1536×1024, execute `qa/overlap-check.js` in DevTools, and capture the result. Then continue the required functional regression suite.
