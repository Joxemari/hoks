TITLE: One lattice, read twice
LEAD: DTKRT begins with one lattice and asks it to carry two kinds of information: presence and belonging. Every figure below is rendered from the working algorithm; together they expose how a system becomes an image without pretending the image is the whole work.

DTKRT is one lattice read twice. The same grid answers two questions — *is there a circle here?* and *is this cell part of a region?* — and the second answer changes the ground under the first. The circle never changes; what changes is what it sits on. The work returns to DTK, the first hoks system from 2023, and subjects its original circle grid to a second reading.

That distinction is the work's central operation. DTKRT does not transform the circle; it transforms the conditions under which the circle is read. Geometry acts less as a drawing language than as an agreement shared by figure and ground. Context becomes executable.

> The same circle means one thing on the field and another inside the region.

## The lattice, read twice
A single grid carries two layers. **Presence** decides which cells hold a circle. **Belonging** decides which cells form a region — a block of ground painted behind the circles. Figure and ground share the same lattice, so the block does not decorate; it reframes. A circle on the open field and the same circle inside the region are two different images of one shape.

![presence (dots) + belonging (block), one lattice](sketches/dtkrt/makingof/anatomy.png)

## Presence — the circles
Every cell draws a number; a circle appears if that number falls within the threshold (0.8 by default). The circle keeps one constant colour throughout — it must not compete with the region. Presence is a mask, and absence is the same mask read backwards.

![coverage — the mask lets more or fewer circles through](sketches/dtkrt/makingof/coverage.png)

## Belonging — the region
> A seed cell, then spread to its neighbours. There is no catalogue of shapes.

The region is a polyomino grown by orthogonal spread: pick a seed cell, reach to a neighbour, again, until it is large enough. Bars, ells, staircases and fields are consequences of the rule, not drawings. One in five compositions grows a second, twin region; sometimes a single loose accent cell is left on its own.

![region shapes — bar, ell, field, cluster — grown, not drawn](sketches/dtkrt/makingof/regions.png)

## Three roles of colour
The palette is sorted by luma and split into three fixed roles: **ground**, **block**, **dot**. The system first looks for a real pigment with enough distance from the other two. If the palette cannot provide one — especially when it contains only two colours — it derives an intermediate tone. This exception matters: fidelity to the palette yields to the legibility of the relation. One in four compositions inverts the pair, producing a light ground and a dark dot. If every circle took its own colour, the region would cease to operate; the discipline of three roles is what allows the second reading to exist.

![three roles — dark ground vs. light ground (inverted)](sketches/dtkrt/makingof/roles.png)

## The grid
`n` cells sit on the short side (3 to 7); the long side takes as many square cells as fit. So the format does not add air, it adds lattice — a vertical sheet is the work standing up, not stretched. The margin is equal on all four sides, which fixes the pitch: `pitch = (L − S) / k`. With DIN proportions this gives 4×6, 5×8, 7×11. Below three cells there is no region to read, so DTKRT never goes smaller.

![grid — n cells on the short side](sketches/dtkrt/makingof/grids.png)

## Format
The same seed on the three sheets is the same thought re-latticed, not one image resized.

![same seed — square / vertical / horizontal](sketches/dtkrt/makingof/format.png)

## Ground and grain
The ground is flat in 70% of outputs, giving figure and ground a stable plane. In the remaining 30%, a mesh gradient introduces atmosphere. It runs from an independent random stream, so changing the ground cannot move a circle or regrow a region. Film grain is baked over the whole image at the end.

This separation is conceptual as much as technical: atmosphere can alter the conditions of viewing without rewriting the geometry. The weather changes; the proposition does not.

![flat ground · film grain · gradient (lab option)](sketches/dtkrt/makingof/ground_grain.png)

## What the rule refuses
- The block prefers a real pigment; only insufficient contrast permits a derived tone.
- The dot never changes colour — one shape, read against two grounds.
- No catalogue of shapes — the region is grown, never chosen from a list.
- Figure and ground share one lattice — the block reframes, it does not decorate.

## Rarity
Each output reports its palette, its grid, its region (shape, twin, cells), its coverage, its ground (dark or light) and its contrast. A combined score maps to a rarity from **common to legendary**. A twin region and a lone Solo region are the rare shapes; an inverted, light ground is uncommon.

## Scarcity
The odds are published, not hidden. They describe the shape of the possibility space before selection begins:

- Presence threshold — 0.8 (a circle appears in ~80% of cells).
- Grid — n from 3 to 7.
- Twin region — 18% · loose accent — 40%.
- Inverted (light) ground — 25%.

A twin region on an inverted ground and a rare palette is an outlier the rule can make and almost never does. But probability is not yet an edition. The system determines what can occur; selection determines what is carried forward.

## The passage
Seen together, the seeds reveal the system; a single one is only where it happened to land. I generate possibilities, compare them and keep one. The rest are discarded. That decision converts abundance into commitment.

The chosen lattice then moves into matter. Geometry preserves the relation between circle, cell and region; fabrication introduces scale, surface and time. The physical piece is neither a screenshot nor a neutral copy. It is the place where an exact system meets conditions it cannot fully command.

![contact sheet — fifteen seeds](sketches/dtkrt/makingof/contact.png)

> code proposes. geometry translates. matter negotiates.
