TITLE: One lattice, read twice
LEAD: Illustrated essay over an open, commented algorithm; the contact sheet reads the series as one system. Every figure is rendered from the real algo.js.

DTKRT is one lattice read twice. The same n×n grid answers two questions — *is there a circle here?* and *is this cell part of a region?* — and the second answer changes the ground under the first. The circle never changes; what changes is what it sits on. *(It is also where the practice began — the first hoks system, 2023.)*

> The same circle means one thing on the field and another inside the region.

## The lattice, read twice
A single grid carries two layers. **Presence** decides which cells hold a circle. **Belonging** decides which cells form a region — a block of ground painted behind the circles. Figure and ground share the same lattice, so the block does not decorate; it reframes. A circle on the open field and the same circle inside the region are two different images of one shape.

![presence (dots) + belonging (block), one lattice](sketches/dtkrt/makingof/anatomy.png)

## Presence — the circles
Every cell draws a number; a circle appears if it clears the threshold (0.8 by default). The circle keeps one constant colour throughout — it must not compete with the region. Presence is a mask, and absence is the same mask read backwards.

![coverage — the mask lets more or fewer circles through](sketches/dtkrt/makingof/coverage.png)

## Belonging — the region
> A seed cell, then spread to its neighbours. There is no catalogue of shapes.

The region is a polyomino grown by orthogonal spread: pick a seed cell, reach to a neighbour, again, until it is large enough. Bars, ells, staircases and fields are consequences of the rule, not drawings. One in five compositions grows a second, twin region; sometimes a single loose accent cell is left on its own.

![region shapes — bar, ell, field, cluster — grown, not drawn](sketches/dtkrt/makingof/regions.png)

## Three roles of colour
The palette is sorted by luma and split into three fixed roles: **ground**, **block**, **dot**. The block is a real pigment from the palette — an intermediate tone with enough air from the other two — never a mix, because a mix reads as a dirty glaze. One in four inverts the pair: a light ground, a dark dot. If each circle took its own colour, the region layer would not read; the discipline of three roles is what lets the second reading exist.

![three roles — dark ground vs. light ground (inverted)](sketches/dtkrt/makingof/roles.png)

## The grid
`n` cells sit on the short side (3 to 7); the long side takes as many square cells as fit. So the format does not add air, it adds lattice — a vertical sheet is the work standing up, not stretched. The margin is equal on all four sides, which fixes the pitch: `pitch = (L − S) / k`. With DIN proportions this gives 4×6, 5×8, 7×11. Below three cells there is no region to read, so DTKRT never goes smaller.

![grid — n cells on the short side](sketches/dtkrt/makingof/grids.png)

## Format
The same seed on the three sheets is the same thought re-latticed, not one image resized.

![same seed — square / vertical / horizontal](sketches/dtkrt/makingof/format.png)

## Ground and grain
The ground is flat by design: figure and ground need a stable plane, so DTKRT drops the mesh gradient its ancestor DTK used. Film grain is baked over the whole image at the end. A gradient ground stays available as a lab option, but the default is a plane.

![flat ground · film grain · gradient (lab option)](sketches/dtkrt/makingof/ground_grain.png)

## What the rule refuses
- The block is a real pigment, not a mix — the region must read as a plane, not a glaze.
- The dot never changes colour — one shape, read against two grounds.
- No catalogue of shapes — the region is grown, never chosen from a list.
- Figure and ground share one lattice — the block reframes, it does not decorate.

## Rarity
Each output reports its palette, its grid, its region (shape, twin, cells), its coverage, its ground (dark or light) and its contrast. A combined score maps to a rarity from **common to legendary**. A twin region and a lone Solo region are the rare shapes; an inverted, light ground is uncommon.

## Scarcity
Like Cherniak's *Ringers*, the odds are published, not hidden:

- Presence threshold — 0.8 (a circle appears in ~80% of cells).
- Grid — n from 3 to 7.
- Twin region — 18% · loose accent — 40%.
- Inverted (light) ground — 25%.

A twin region on an inverted ground and a rare palette is the DTKRT *Goose*: the outlier the rule can make and almost never does. How many will exist, and how they are released, is the edition decision.

## The series
Seen together, the seeds are the work; a single one is only where the system happened to land.

![contact sheet — fifteen seeds](sketches/dtkrt/makingof/contact.png)

> The rule is the work.
