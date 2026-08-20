TITLE: A square that keeps asking
LEAD: Every image here was rendered from the KRRTK algorithm itself — the same code that runs in the studio, not mockups. Where two panels sit side by side they share a seed; only the one thing under discussion changes.

I wanted one shape and one question, repeated until the repetition became the subject. The shape is a square. The question is whether it should divide. KRRTK — *karratuak*, squares in Basque — is that question asked out loud, again and again, on a single sheet.

![One square, asked thirteen times whether to appear.](sketches/krrtk/makingof/hero.png)

I didn't want ornament. I wanted the structure to be the only ornament, so I gave the square nothing to decorate itself with: no outline, no line weight, no gesture. It can split, or it can stay whole. Everything you see is the record of those two moves and nothing else.

## The grammar
A field begins as one square. If it is bigger than a quarter of the field, it splits into four and I throw the fourth quarter away — the bottom-right corner, gone, every time. The three survivors each face the same test, split again, and lose their own fourth corner. Then the pieces are too small to divide and the recursion stops. Two levels deep, always. Thirteen squares to a field — one whole, three halves, nine quarters — stacked on top of each other with the parents still showing through.

![Left: the full lattice with every square inked. Right: the threshold keeps only some.](sketches/krrtk/makingof/grammar.png)

That discarded quarter is not a bug I never got around to fixing. It's the sentence the series says. A clean quadtree tiles the plane and leaves nothing to notice — you read the grid and move on. Throw one corner away at every level and the square stops being a container and becomes a decision that went a particular way. The missing corner is where the eye catches.

> The rule is deliberately shallow: two levels, never three. I gave up depth on purpose. A square that could divide forever would be about its own cleverness, and I wanted it to be about the choice.

The squares are painted at 61% opacity — `rectAlpha = 0.61` — so wherever a parent and its children both survive, the colour deepens. You can read the lattice in the overlaps: which square sits under which.

## The threshold
Subdivision lays down the lattice. It does not decide what you see. That's a second, separate move: over each of the thirteen squares I flip a weighted coin, and only the winners get painted. The coin is `rng.next() > threshold`, with the threshold at `0.6`, so any given square shows up about 40% of the time.

![Same seed, three thresholds: sparse, balanced, dense. The lattice underneath is identical.](sketches/krrtk/makingof/coverage.png)

This is where the real variation lives. The lattice is fixed; the coin is not. A high threshold strands a few squares in the ground. A low one fills the field until the overlaps stack into a solid block. Same geometry under all three — only the coin changed. And because parents and children overlap, whether the small squares win is also what makes a region *read* as divided or whole.

## The atmosphere is a setting, not the work
This is the part I care about most, and the part most easily mistaken. Under the squares there's a ground — flat about two-thirds of the time, a soft four-corner gradient the rest. Over everything sits film grain. People see the warmth and the analog surface and assume that's the piece. It isn't. It's a setting, and it goes to zero without touching a single square.

![Same seed. The rule alone; then grain; then the gradient ground. Not one square moves.](sketches/krrtk/makingof/atmosphere.png)

Same seed across all three panels. On the left, the rule alone: flat ground, no grain, the squares exactly where the coin left them. Then I turn the grain up. Then I let the ground become a gradient. Nothing in the composition moves. I built it this way on purpose — the gradient and the grain even draw from their own random streams, seeded apart from the composition, so that choosing the mood can never nudge a square.

> Structure is the constant. Atmosphere is weather. You can have the building on a clear day or a foggy one; it's the same building.

## Saying it more than once
The unit is a square, so to fill a sheet I don't stretch it — I repeat it. One field with a lot of air around it, or the sheet divided into a grid of smaller fields, each subdividing on its own, none aware of its neighbours.

![One field, two, three: the same system said more times.](sketches/krrtk/makingof/fields.png)

The margin isn't mine to set — it belongs to the system: one number, shared with KRRTK's sister series, so they all pull back from the paper by the same amount and read as one family. With a square unit that margin stops being free. Once you decide how many fields, the margin is fixed by arithmetic, not taste: one field is a 29% margin, two is under 9%. So choosing the count of fields *is* choosing how much air.

![The same seed across square and the two DIN sheets.](sketches/krrtk/makingof/format.png)

## What the rule refuses
- **No third level.** Two divisions, then it stops. Depth never varies.
- **No fourth quarter.** Every split loses its bottom-right corner. Non-negotiable.
- **No outline, no line, no gesture.** A square is a filled region or it's absent — nothing in between.
- **No neighbour awareness.** Each field subdivides blind. Fields never coordinate, which is why no two ever rhyme.

## Scarcity
I learned this from Dmitri Cherniak's *Ringers* — publish the odds. A series should be able to tell you what's rare in it without a marketplace doing the telling. KRRTK's value doesn't come from quantity. What varies — and therefore what's scarce — is **coverage**: how the coin fell across the field. Measured over 20,000 seeds, one square field, default threshold:

| Coverage | Reading | How often |
| over 65% of squares inked | uncommon | ~1 in 30 |
| between 20% and 65% | common | the large majority |
| under 20% inked | rare | ~1 in 17 |
| under 12% inked | rarer | ~1 in 84 |
| a single surviving square | the Goose | ~1 in 93 |
| the empty field | the Goose, emptied | ~1 in 950 |

![A common field beside the Goose: one square left standing in the ground.](sketches/krrtk/makingof/scarcity.png)

The Goose — the one output that makes you stop — is the near-empty field: a single square that survived every chance to disappear, about one in ninety. Rarer still, roughly once in nine hundred and fifty, the coin clears the field completely — no squares at all, just ground and grain, the question asked thirteen times and answered *no* every time.

## Close
I don't publish the source. You've seen how it thinks, which is the part worth explaining; the rest it keeps.

![Fifteen seeds.](sketches/krrtk/makingof/contact.png)

> The rule is the work.
