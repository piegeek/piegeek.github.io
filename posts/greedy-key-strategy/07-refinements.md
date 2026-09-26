---
title: Refinements that made the framework usable
dek: Four questions that turned a pile of insights into a checklist, and the checklist itself.
summary: Degrees of freedom, the limits of quick tests, and the final checklist.
byline: ~10 min read
---

<figure>
  <svg viewBox="0 0 680 220" role="img" aria-label="A funnel narrowing through four stages labelled freedom, shape, test and prove">
    <path class="f-soft" d="M60 20 H620 L520 80 H160 Z"/>
    <path class="f-soft" d="M160 86 H520 L460 136 H220 Z"/>
    <path class="f-soft" d="M220 142 H460 L420 180 H260 Z"/>
    <rect class="f-acc" x="280" y="186" width="120" height="28" rx="3"/>
    <g class="svgt f-ink" text-anchor="middle">
      <text x="340" y="55">is there anything to optimize?</text>
      <text x="340" y="116">what shape is the output?</text>
      <text x="340" y="166">run that shape's test</text>
    </g>
    <text class="svgt f-bg" x="340" y="205" text-anchor="middle" font-weight="600">key or proof</text>
  </svg>
</figure>

By part 6, the pieces were there, but they were scattered across corrections. I wrote them into a step-by-step procedure, and the last stretch of the work was about finding what was still wrong with it.

## The key is a function of the item alone

::: q The question
My draft says the key is "usually a function of (T, k), but in most cases a function of k." Is that right?
:::

It was too cautious. Going back through every example (weight over time, due date, right end point, edge weight, value over weight, a person's weight, a card's two sides, a gem's value), the key is a function of the item alone in every single case. There's a reason: a sort key that depended on a running state couldn't be computed before you start sorting.

$T$ still matters, but in two other places: in the *proof* that the key is right, and in the *strategy* that walks the sorted items. If $T$ shows up inside a key formula, the derivation has probably gone wrong.

## Degrees of freedom

One problem forced a new first step. A row of light bulbs, each switch flipping its bulb and its neighbours: find the fewest presses to reach a target pattern. It looked like it might be a row-4 bound problem.

::: q The question
You said to check "degrees of freedom" before reaching for row 4. What does that mean?
:::

Count how many genuinely independent choices a solution has. Fix an early choice and see whether everything after it becomes forced. For the switches, once you decide whether to press the first switch, the first bulb can only be fixed by the second switch, which forces it, which forces the third, and so on. However many bulbs there are, there are exactly two possible solutions. There's nothing to optimize, just two cases to compute.

Compare the wallet, where every card's rotation is a free choice: $2^n$ real candidates, which the bound narrows to one. Every genuine greedy problem starts with a space that grows with the input, and the proof collapses it. If the space stays constant, it's a simulation, not greedy. But a large space isn't enough on its own either: it might still turn out to need DP, or be one of the hard problems with no efficient exact answer.

## The quick matroid test, and its blind spot

::: q The question
Building two maximal sets and comparing their sizes sounds like more work than just trying the greedy. Can I simply sort ascending once and descending once and compare?
:::

First, the effort question. Checking a greedy on the one example in the problem statement is quick but tells you almost nothing; several formulas I tried passed a hand check and then failed a stress test. A real stress test (write the greedy, write a brute force, compare over thousands of random inputs) is more work than the two-pass check, which is a few lines of arithmetic.

Second, the two passes. The check is lopsided. If the two maximal sets have different sizes, it's definitely not a matroid. If they have the *same* size, that proves nothing, because two passes only sample the possibilities. We built a case that fools it: a path of four points a–b–c–d with edges ab, bc, cd, where the rule is that chosen edges can't share an endpoint. Both passes find {ab, cd}, size 2. But {bc} on its own is also maximal, with size 1. Not a matroid, and the quick check missed it.

I found "identify the exact class of matroid" impractical for contest-style problems, and asked for a firmer recommendation. Where we landed:

- **Different sizes:** trust it, and go to the Lagrangian.
- **Same size:** proceed as a matroid, treat it as a hypothesis, and let the brute-force stress test you'd run anyway confirm it. For easy and medium problems, that confirmation can usually be skipped.
- **Except:** when the items are pairs and the rule is "no shared endpoint," the exact shape that fooled the test, don't skip it.

## Do people really do all this?

::: q The question
This is a lot. Do competitive programmers actually derive greedy solutions like this, or do they memorize patterns?
:::

Mostly they recognize patterns, and they check them by stress-testing against a brute force, not by proving them under time pressure. What separates reliable recognition from superstition is having derived each pattern once, so you know *why* it works and can tell when a variation breaks it.

Greedy really doesn't have DP's single template, and that isn't a gap in the framework. DP is organized brute force, so correctness comes free once the state is right. Greedy's shortcut always needs its own proof, and which proof depends on the shape of the output. The four archetypes are a compact record of those derivations. If you keep one habit, keep this question: *is the output an order, a subset, a set of pairs, or an assignment of everything?*

## The framework

Three checks apply everywhere:

- **Separability:** each decision depends only on a compact state $T$ and the current item, with no scanning ahead.
- **The key is a function of the item alone.** $T$ belongs to the proof and the strategy.
- **Verify** anything non-trivial against a brute force before trusting it.

And the procedure, in order:

::: checklist
- [0] Count degrees of freedom. If free choices grow with input size, there's a real optimization (it may still be DP or hard). If they stay constant, it's a simulation, not greedy.
- [1] The greedy key is a function of the item alone.
- [2] Classify by output shape: an order (row 1), a subset (row 2), pairs (row 3), or an assignment of everything (row 4).
- [2.1] A non-linear objective with no numeric per-item key suggests row 4.
- [2.2] If it looks like an order but the strategy needs a data structure rather than one number, suspect row 2. Confirm by checking whether different valid orders of the same subset give the same objective.
- [2.3] If it looks like pairing but two pointers don't have enough information to decide (for example, items carry values), suspect another row.
- [3.1] Row 1: sort by the key and build the order while carrying a scalar $T$. The key comes from the swap test: cancellation for sums, domination for bottlenecks.
- [3.2] Row 2: build maximal subsets with an ascending pass and a descending pass. Different sizes: not a matroid, go to 3.3. Same size: sort by raw value and add each item that keeps the set allowed, using one number or a data structure as the constraint requires. Treat it as a hypothesis; confirm by stress test when items are pairs under a no-shared-endpoint rule.
- [3.3] Lagrangian, one budget: sort by value over cost. With fractions, fill whole items, take one fraction, stop (exact). Without, skip what doesn't fit and keep going. That's an approximation, exact only when all costs are equal.
- [4] Row 3: when compatibility is a threshold on the key, sort and use two pointers with `while lo <= hi`. Otherwise it's general matching, outside greedy.
- [5] Row 4: derive a bound every solution must satisfy, construct a solution that meets it, and check that it meets it exactly. If it only comes close, you have an approximation, not an exact answer.
:::

Outside the framework entirely: matching with arbitrary compatibility (augmenting paths), problems with no efficient exact algorithm at all (greedy may still give a guaranteed approximation), and problems with only a constant number of real choices (just compute them).

It isn't the single formula I asked for at the start. Part 1 showed why that formula can't exist. What I have instead is a procedure that, for each kind of problem, either gives me the key with a reason or tells me plainly that greedy isn't the tool.
