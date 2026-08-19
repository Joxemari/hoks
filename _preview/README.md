# _preview — the unified site prototype

A single, self-contained prototype of the whole hoks site, assembled from the
approved pieces (landing + contact-sheet hall + family rooms + making-of). It is
a **work in progress**, kept here so it survives between sessions and can be
iterated on.

## What's here

- **`site.html`** — the built, self-contained page (engine, algos, font, logo,
  making-of figures and the AEREA loop are all inlined). This is what you open /
  publish. ~7.5 MB.
- **`build-site.js`** — the builder. Reads the ingredients below and writes
  `site.html`. Node, no dependencies.
- **`assets/`** — the ingredients the builder inlines:
  - `engine.js`, `plls.js`, `dtkrt.js`, `krrtk.js` — render engine + graduated algos
  - `spartan.b64` — League Spartan woff2 (base64)
  - `favicon.b64` — crossed-O favicon (base64 PNG)
  - `monogram.b64` — crossed-O monogram, used for the header + nav mark
  - `logo_tall.b64` — the tall hand-painted "hoks" logo, used on the landing splash
  - `hall-loop.b64` — one bar of AEREA · 10.000 Flores (≈147 BPM), the hall groove (WAV)
- **`mofigs/`** — the PLLS making-of figures (rendered from the real code).

## Rebuild

```
cd _preview
node build-site.js      # → writes site.html
```

## The flow it assembles

1. **Landing** — the work *paints itself* (the algorithm's own draw calls,
   recorded and replayed: ground first, then each object), the logo tunes in
   with a signal glitch + black TV-static, and one click dissolves straight
   into the hall. Sound powers on with the click.
2. **Hall** — the Wall Studies *contact sheet*: a heartbeat grid that always
   holds a common thread (one palette / one family). The AEREA groove plays and
   palpitates on each pulse. Blue drawer nav opens from the burger.
3. **Family room** — horizontal by default, a *This one* specimen card + a
   *The rule* code terminal, a gallery of 1/1 seeds (lightbox with cartela and
   view-in-a-room), a prominent making-of band and a *Next family →* flow.
   Sound continues here as a gentle bed.
4. **Making-of / About** — the right-weighted illustrated essay. Sound fades
   out to silence in the reading pages.

## Notes / still open

- Sound: browsers block audio before the first click; it starts on the landing
  click (static → groove) by design.
- Rarity taxonomy (COMMON · UNCOMMON · RARE · SIGNAL · GOOSE) — not wired yet.
- Feed-fábrica (iteration grids + assembling-piece videos for IG/X) — planned.
- The engine/algos here are the graduated sources; keep them in sync with
  `sketches/` when those change.
