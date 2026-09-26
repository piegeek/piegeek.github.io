---
title: Matching problems, archetype 3
dek: When the answer is a set of pairs, the swap test has nothing to hold on to. A different proof takes over, and it has a precondition.
summary: When the swap test has nothing to hold on to, and when two pointers are enough.
byline: ~9 min read
---

<figure>
  <svg viewBox="0 0 680 190" role="img" aria-label="A sorted row of weights with two pointers, lo and hi, and arcs pairing items from the two ends">
    <g>
      <rect class="f-soft" x="40" y="80" width="600" height="46" rx="3"/>
      <g class="svgt f-ink" text-anchor="middle" font-size="15">
        <text x="80" y="108">1</text><text x="160" y="108">2</text><text x="240" y="108">2</text><text x="320" y="108">3</text><text x="400" y="108">4</text><text x="480" y="108">5</text><text x="560" y="108">6</text>
      </g>
    </g>
    <g fill="none" stroke-width="2.5">
      <path class="s-acc" d="M80 78 C 80 20, 560 20, 560 78"/>
      <path class="s-acc" d="M160 78 C 160 40, 480 40, 480 78"/>
      <path class="s-mut" stroke-dasharray="5 4" d="M240 78 C 240 58, 400 58, 400 78"/>
    </g>
    <text class="svgt f-acc" x="80" y="150" text-anchor="middle" font-weight="600">lo →</text>
    <text class="svgt f-acc" x="560" y="150" text-anchor="middle" font-weight="600">← hi</text>
    <text class="svgt f-mut" x="340" y="175" text-anchor="middle">pair the extremes if they fit; otherwise the heavy one goes alone</text>
  </svg>
</figure>

The first problem that didn't fit anywhere was about boats. Each boat holds at most two people with a combined weight under a limit; find the fewest boats. I framed it as an ordering problem: line everyone up, and consecutive people who fit share a boat. Then I ran the swap test.

::: q The question
When I swap two people, the lighter-first order costs less but leaves less freedom for whoever comes next. Cost and freedom point in opposite directions, so the swap test doesn't give me a clear answer. Honestly, if I hadn't seen this problem before, I'd have gone to DP. What went wrong?
:::

Nothing went wrong with the test. It was reporting, correctly, that the problem has a different shape. The number of boats doesn't depend on the order you list them in. The output is a set of pairs, and "swap two neighbours" has nothing to hold on to.

Cost and freedom pulling apart is the same signature that showed up for multi-budget problems in part 4: two things to trade off with no fixed exchange rate. It's the swap test telling you that you're in the wrong category.

## The proof that does work

Look at the extremes instead of neighbours. Let $H$ be the heaviest person and $L$ the lightest. Everything rests on one small lemma:

> Replacing someone in a valid arrangement with a lighter person never makes it invalid.

That's true because a lighter person only lowers a sum that has to stay under a limit. Now two cases:

- **$H + L$ is over the limit.** $H$ can't even share with the lightest person, so $H$ can't share with anyone. $H$ rides alone in every solution. Remove $H$ and solve the rest.
- **$H + L$ fits.** Take any best solution. If $H$ shares with someone else, call them $p$, swap $p$ and $L$. $L$ is at least as light as $p$, so $H$'s boat is still fine, and by the lemma $p$ fits wherever $L$ used to be. Nothing got worse, so some best solution pairs $H$ with $L$. Remove both and solve the rest.

Peel off the extremes, repeat. Sort once and walk two pointers inward, and you have the familiar two-pointer algorithm, derived rather than remembered. A brute-force check across thousands of small inputs agreed with it every time.

## Don't rename things to make them fit

::: q The question
My version of the rule was "take the next person and pair them with the heaviest remaining person who still fits." That needs to look ahead over everyone left, so it isn't a function of T and the current item. Should separability be widened to allow that?
:::

The tempting answer is to call the state $(lo, hi)$, the two pointer positions, and say the rule is separable in that. But that's taking an algorithm you already know and inventing a state so the vocabulary still applies. It explains nothing, because the state was chosen to make the claim true.

The honest version: separability and block invariance don't generate the two-pointer strategy. This is a different proof shape, extremes plus a substitution lemma, and it's fine for it to be different. The "look ahead for the best partner" worry also goes away on its own: after sorting, repeatedly comparing just the two ends finds that partner automatically. It looks like lookahead, but it's a simple rule repeated.

## When "sort, then two pointers" is enough

::: q The question
So every matching problem is just: sort by the key, then two pointers?
:::

Only when one condition holds, and it has to be checked: **compatibility has to be a threshold on the sorted key**. If a person fits with some partner, they fit with every lighter partner too. That's what makes the valid partners for anyone a contiguous run of the sorted list, so two pointers moving inward can't miss anything. Two different ways this breaks:

- **Items carry different values.** Two gems both weigh 5; one is worth 1, the other 100; there's one bag that holds 5. Matching by fit alone takes whichever gem it meets first and might score 1. Two pointers can check whether a pair fits, but they have no way to compare payoffs. That problem needs the subset machinery from part 4: sort by value and check whether each item can still be matched.
- **Compatibility is arbitrary.** Person A can only do job 1, person B only job 2, person C any of jobs 1–3. There's no number you can assign to people and jobs that turns this into "fits if above a line." That's general matching, which is solved by augmenting paths, a separate family that is neither greedy nor DP.

A problem "feeling greedy" is a good reason to *try* two pointers first. It isn't evidence they'll work. The check is whether compatibility can be written as one number on each side compared against the other.

::: note A small bug worth remembering
The two-pointer loop should run `while lo <= hi`, not `lo < hi`. Each step places one person, so the loop has to run when exactly one is left. A strict `<` is for loops that consume two elements per step, like reversing an array in place.
:::

::: note Carried forward
For pairings: peel off extremes and use a substitution lemma. It reduces to sort plus two pointers only when compatibility is a threshold on the key. If items have values, go back to subset methods; if compatibility is arbitrary, it's outside greedy altogether.
:::
