# MahjongMom (multi-file build)

This repo is optimized so you can:
- **Deploy easily on GitHub Pages** (fast load on iPhone)
- **Ask ChatGPT/Claude to edit game logic by uploading only one file**: `app.js`

## Files
- `index.html` – UI markup + links to CSS/JS (small)
- `styles.css` – all styling
- `app.js` – all game logic (upload this for most feature/bug fixes)
- `dragon-bowl.jpg` – art asset used in Slot Shop

## Deployment (GitHub Pages)
Put these files at your repo root and enable GitHub Pages.
If iPhone Safari caches an old version, bump the cache version in `index.html`:
- `styles.css?v=YYYY-MM-DD.x`
- `app.js?v=YYYY-MM-DD.x`

Current build: **2026-02-27.1**

## Editing workflow with ChatGPT
- Gameplay/logic changes: upload **`app.js`**
- UI text / layout changes: upload **`index.html`**
- Visual/theme changes: upload **`styles.css`**
- If you’re not sure: upload a ZIP of the repo.

## Notes
- Payline overlay lines are disabled (symbols glow/pulse instead).
- SG win rule is **minimum 1 tai**.
- Save system includes status indicator + export/import/copy/paste restore for iPhone reliability.
