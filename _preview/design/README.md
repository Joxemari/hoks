# _preview/design — design-canvas source

The screen designs for the whole hoks site in one visual system, authored as
Design-Component artboards (`*.dc.html`) laid out by `canvas.json`. These are
the SOURCE; the published, navigable canvas is assembled from them with the
`/design` helper (which also supplies the runtime). The built canvas
(`hoks-el-sistema.html`, ~2 MB) is regenerable and gitignored.

## Artboards
- `Main.dc.html` — the system tile (tokens, type, blue drawer nav, cartela,
  rule/code terminal, rarity ladder, buttons, toast).
- Reader: `Landing`, `Hall`, `Family`, `Making`, `Palettes`, `About`.
- Operativa: `Admin` (7 tabs), `Lab` (harness), `Wall` (scale view).

## Tokens
paper #fbfbfa · ink #0a0a0a · blue #000ef7 · acid #dcff32 · line #e7e5df ·
muted #8a8983 · League Spartan (display) + monospace (captions).

## Purpose
Lock the visual system across every screen before wiring it into production
(`nav.js` chrome + `work-page.js` family shells reskin most pages; the rest
carry their own `<style>`). Operativa logic (auth, GitHub token, Contents API,
batch publish) is NOT changed by the redesign — only the look.
