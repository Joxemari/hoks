TITLE: The pile became a system
LEAD: PLLS begins with an accidental composition on a kitchen table and becomes a production line for possibilities. Every figure below is rendered from the system itself: one decision at a time, with nothing staged for the explanation.

For a while my father was ill, and every morning his medicine came out onto the table in a little pile. Capsules and tablets, and the completely absurd, random colours that medicines come in — a sunset orange next to a municipal grey next to a pink no fruit has ever been. Nobody chose those colours to go together. Somebody chose each one, once, for reasons that had nothing to do with the pile it would land in beside my father's coffee.

He recovered. But by then I had spent a lot of mornings looking at that pile, and I had started to see compositions in it. Six objects, thrown down without intention, and my eye insisting on arranging them anyway — reading the spacing, the overlaps, the one that had rolled off to the side. PLLS is that pile. It is the only work of mine whose palette I can point to a source for: it is the medicine cabinet. That is the whole reason the colours are so bright and so arbitrary. A capsule in PLLS is a pill, and it is allowed to be any ridiculous colour a pill is allowed to be.

The source was not really the capsule. It was the conflict between accident and composition: objects designed separately, landing together without a plan, and the eye producing order after the fact. PLLS does not reproduce the original pile. It builds the conditions under which that tension can happen again. The code formalizes accident without trying to make it look accidental.

> A capsule is not a shape. It is a distance between two points, given a thickness.

## The capsule
PLLS has exactly one object, and it is barely an object. A capsule is a segment with round caps: two points, and a thickness. That is the entire vocabulary. Because it is a *distance* and not a picture, there is no such thing as a wrong capsule — only a longer one or a fatter one. It can be placed, measured, and rotated without ever deforming.

The proportion is constant. This matters more than it sounds. The capsule is a length plus a thickness, and those two numbers move together — the frame never stretches it. A pill in a tall sheet and a pill in a wide sheet are the same pill; the sheet does not squash it or draw it out. Whatever else changes across a PLLS piece, the object keeps its body.

![one capsule — two points and a thickness](sketches/plls/makingof/capsule.png)

## Density — the archetype
Before a single capsule is drawn, the system decides on a density: how many pills there are, and how tightly they are allowed to sit. Four archetypes define the operating conditions:

- **Monumental** — a single capsule holding the whole sheet.
- **Solo** — 2–3, spare.
- **Scattered** — 5–8, loose.
- **Dense** — 11–22, crowded.

The numbers below are *probabilities* — the odds that the system enters each condition, not a judgment applied afterward. Scattered is chosen far more often than Monumental; the lone capsule is rare before it is ever seen.

- **Scattered** — 52% · **Dense** — 25% · **Solo** — 20% · **Monumental** — 3%

![the four archetypes — Monumental, Solo, Scattered, Dense](sketches/plls/makingof/archetypes.png)

## Size, and why the format cannot touch it
Here is a problem I did not see coming until the pieces told me. If you size the capsules against the short side of the sheet — the obvious thing — then a wide sheet reads as emptier and a tall sheet as more crowded, at the *same* archetype. I measured it: the horizontal came out 41% barer. The frame had quietly stolen the density from the archetype, which is the archetype's one job.

The fix is to measure size against the geometric mean of the sheet rather than a single edge. Then Dense remains Dense whether the sheet is square, tall or wide — same seed, same crowd, three formats.

`maxSize = √(FW · FH) · SPREAD / √num` · `SPREAD ≈ 0.715` · `thickness = maxSize · rand(0.62–0.78)`

I call this **tri-format** — the same seed rendered as square, vertical or horizontal at identical density — and it is a hoks-wide feature. One work, three sheets, no favouritism.

![tri-format — same seed as three sheets, one density](sketches/plls/makingof/format.png)

## The field
The capsules can occupy the whole sheet, or only a square centred inside it. That is the field. It exists so that one rule can produce two genuinely different images: a composition that runs to the edges and reads as a fragment of something larger, or a composition held in a square with air around it, reading as an object on a page. The ground and the grain always cover the full sheet regardless — only the pills know about the field. Two readings, one rule.

![field — whole sheet vs. centred square, same seed](sketches/plls/makingof/field.png)

## Placement
> Placement is not arrangement. The rule decides how much the pills are allowed to collide.

The problem is overcrowding. In a Dense field of twenty-two capsules on a small sheet, "just place them randomly" produces a mess — pills stacked into an unreadable knot. So each capsule looks for room before it commits: it tries up to 24 positions, testing whether it can sit without pushing into its neighbours beyond the archetype's tolerance. A Solo keeps its pills well apart; Dense is permitted to touch.

`keepApart = (thick + halfLength · 1.5) · (1 − tol)` · `tol = OL_TOL · min(1, num/8)`

And if after 24 tries it still finds no room, it is placed anyway. This is the most revealing line in the system. The rule begins by imposing distance, then encounters the finite capacity of the field and yields. Negotiation with matter appears here before ink or paper: an abstract geometry discovers that space is not infinite. The resulting overlap is not corrected. It is evidence of the encounter.

![overlap by archetype — Solo keeps apart, Dense may collide](sketches/plls/makingof/placement.png)

## Colour against the ground
Two problems, one rule. First, a capsule the same tone as its ground simply dissolves — you lose the pill. Second, and worse for a system built on counting pills, the visible count stops matching the real count: the piece says "eight capsules" and the eye sees five, because three vanished into the field.

So a capsule refuses any colour within `0.12` luma of the ground it sits on. Nothing disappears, and what the rule places is what you see.

`| luma(capsule) − luma(ground) | > 0.12`

## The skin
The problem here is affection: how do I make each capsule feel like it was worth drawing? The answer is seven finishes — the only place PLLS permits texture at all.

solid · **blend** (multiply or screen, chosen by the palette's luma) · translucent · outline · **checker** (tiles clipped to the capsule) · gradient · **ribbed** (overlapping spheres, giving a tubular volume).

`solid .34 · blend .34 · translucent .15 · outline .05 · checker .03 · gradient .05 · ribbed .04`

The two workhorses, solid and blend, carry most of the sheets. The rare skins — checker, gradient, ribbed — are the ones that make you lean in.

![the same capsule in all seven finishes](sketches/plls/makingof/finishes.png)

## Ground and grain
A flat colour behind the pills is honest, but it is also a little dull. So the ground is laid first — flat, or a diagonal gradient 30% of the time — and then film grain is baked over the entire image at the very end.

The grain is not decoration. It gives the piece a body: the residue and texture of something printed, a touch of the physical, the faint tooth of paper under ink. It is what keeps a PLLS from looking like a screen and makes it look like the pile actually sat somewhere, in the light, on a table.

![flat ground · gradient ground · + film grain](sketches/plls/makingof/ground_grain.png)

## What the rule refuses
- A capsule is a *distance*, never a form — so the frame can never cut it, and its proportion never changes.
- Density belongs to the archetype, not the format.
- A colour too close to the ground is refused; nothing dissolves.
- When the sheet is full, the piece yields rather than go silent — and the overlap is kept, not corrected.

## Rarity
Every output declares itself: its palette, its archetype and count, its dominant finish, its texture. A combined score maps to a rarity from **common to legendary**. Monumental and Solo are the scarce densities; chess, ribbed and gradient the scarce skins. The rarest pieces are simply the ones where several unlikely choices landed at once.

`score = palette.prob · archetypeFactor · finishFactor`

## From possibility to piece
A single PLLS is where the system happened to land once. The system can continue indefinitely; the work cannot. I generate possibilities, keep one and discard the rest. Selection is not an administrative step after the image exists — it is the point where an infinite process accepts a finite form.

That selected form is then carried into matter. Scale, ink, surface and fabrication do not merely reproduce the computation; they answer it. The algorithm proposes a geometry. The material decides how that geometry arrives.

![contact sheet — fifteen seeds](sketches/plls/makingof/contact.png)

## Scarcity
Scarcity in PLLS is two different things, and I only get to control one of them.

**Within the system — the odds.** Every trait has a fixed probability, so some outputs are structurally rarer than others. I publish these numbers rather than hide them; I learned that from Dmitri Cherniak's *Ringers* — publish the odds, and let the collector reason about what they are holding.

- Archetype — Scattered 52% · Dense 25% · Solo 20% · **Monumental 3%**
- Finish — solid 34% · blend 34% · translucent 15% · outline 5% · gradient 5% · **checker 3% · ribbed 4%**
- Ground — flat 70% · gradient 30%
- Palette — weighted by age; the rarer the palette, the lower the score.

A Monumental capsule, ribbed, on a rare palette is an outlier the system is capable of and almost never produces.

**Of the edition — the selection.** The generative space is effectively inexhaustible. Scarcity begins when I stop generating and decide what deserves to cross into matter. The odds describe what the system can produce; selection determines what the practice allows to exist as a piece.

> code proposes. geometry translates. matter negotiates.
