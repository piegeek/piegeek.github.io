---
title: The fourth archetype and its honest limits
dek: Some "greedy" problems have no sequence of choices at all. They're a bound, a construction, and a check that the two meet.
summary: Problems that are really a bound plus a construction, and why that makes them math, not greedy.
byline: ~9 min read
---

<figure>
  <svg viewBox="0 0 680 210" role="img" aria-label="Bars of varying height under a dashed lower-bound line; one construction bar touches the line exactly">
    <line class="s-mut" x1="50" y1="185" x2="640" y2="185" stroke-width="1.5"/>
    <line class="s-acc" x1="50" y1="70" x2="640" y2="70" stroke-width="2.5" stroke-dasharray="8 5"/>
    <text class="svgt f-acc" x="55" y="60">lower bound every solution must respect</text>
    <rect class="f-mut" x="90" y="40" width="50" height="145"/>
    <rect class="f-mut" x="190" y="55" width="50" height="130"/>
    <rect class="f-mut" x="290" y="30" width="50" height="155"/>
    <rect class="f-acc" x="410" y="70" width="50" height="115"/>
    <rect class="f-mut" x="530" y="48" width="50" height="137"/>
    <text class="svgt f-ink" x="435" y="203" text-anchor="middle">construction</text>
    <text class="svgt f-mut" x="215" y="203" text-anchor="middle">other solutions</text>
  </svg>
</figure>

Two problems kept refusing to fit the first three categories. In one, each business card can be rotated, and you want the smallest rectangular wallet that holds every card. In the other, tasks labelled with letters must be scheduled so the same letter is always at least $n$ steps apart, idling if needed, and you want the shortest schedule. Nothing is excluded, nothing is paired, and the order doesn't come from a swap argument.

::: q The question
Every item is used, and the objective is a product of maxes, or a length forced by spacing rules. There's no clear key and the matroid and Lagrangian methods don't apply. How do these fit?
:::

## A bound and a construction

The technique here is different in kind: derive an inequality that *every* valid solution must satisfy, however clever, and then show one specific solution that meets it exactly. Nothing can beat the bound, and your construction reaches it, so it's optimal. There's no swap and no exchange.

**The wallet.** Call each card's longer side $a_i$ and shorter side $b_i$. A card fits in a wallet, in some orientation, exactly when the wallet's longer side is at least $a_i$ and its shorter side is at least $b_i$. That has to hold for every card, so:

$$ area ≥ max_i(a_i) · max_i(b_i) $$

Rotate every card so its long side is horizontal, and the wallet with exactly those two maxes holds everything. Bound met; done. A comparison against trying all $2^n$ orientations agreed on every test.

**The task spacing.** Let $F$ be the highest count of any single letter, and let the number of letters that tie for it be the "tied" count. The most frequent letter needs $F − 1$ gaps of $n + 1$ slots between its copies, and every tied letter needs a slot in the final row too. So the schedule is at least $(F − 1)(n + 1)$ plus the tied count, and never shorter than the number of tasks. Fill rows in that frame and it's always reachable. An exact search agreed on every case.

## Is there a systematic way to find bounds?

::: q The question
If this is really about finding a lower or upper bound, is there a systematic way to find those, like a set of inequalities to try, instead of memorizing each solution and working backwards?
:::

Four tools suggest themselves, each matched to what had just worked:

- **Take the max of each item's own requirement.** (The wallet.)
- **Pigeonhole:** more things need slots than there are slots. (The task spacing.)
- **Averaging:** a total split across $m$ places puts at least total ÷ $m$ in one of them.
- **Linear-programming relaxation:** solve the fractional version for a bound, the same machinery as the Lagrangian.

To test averaging, we took jobs split across identical machines, where the busiest machine can't finish before the biggest job or the average load. A simple greedy met that bound in only 879 of 2,000 random cases, and was up to 1.41 times it in the rest. Some of that gap is the greedy falling short and some is the bound being loose; with those two numbers alone you can't tell which. The rule that came out of it:

> When the construction meets the bound exactly, you have a proof. When it only comes close, you have an approximation guarantee. Label them differently.

But is this list general, or just fitted to the examples in front of me? Being honest, it was fitted. There are plenty of other bound techniques (double counting, adversary arguments, counting outcomes, the rearrangement inequality, convexity), and unlike matroids there's no theorem that tells you which one a new problem needs. The four tools are worth trying. They aren't a procedure.

## So it's a math problem with an extra step

::: q The question
So for this category, I'm solving a math problem first and then building a solution from it? It's just a math problem with one extra step?
:::

Yes. But my first explanation of what makes it different was wrong. I said this category is special because each item's decision depends only on the item itself. That's true of every category: in every example from parts 2–5, the sort key was a function of the item alone.

The real difference is in the *strategy*, not the key. The first three categories walk through sorted items while carrying a running state, and each decision depends on what earlier items did: elapsed time grows, capacity shrinks, pointers move inward. Here there is no walk. The answer is an aggregate over all items, computed the same way in any order. Shuffling the cards and recomputing the wallet gives the same area every time. Feed a wrong order to the interval-points algorithm from part 2 and it gives a wrong answer.

That also connects back to part 2's "unconditional aggregation": a sum or max that ignores order. In an ordering problem, that aggregate is a running state that gates the next decision. Here it isn't gating anything. It *is* the answer.

::: note Carried forward
Rows 1–3 share one family: a sorted walk with a running state, proven by a swap, an exchange, or a substitution. Row 4 is different in kind: a bound plus a construction, with no walk. Once you're there, you're doing general math, and the discipline is checking that the construction meets the bound exactly.
:::
