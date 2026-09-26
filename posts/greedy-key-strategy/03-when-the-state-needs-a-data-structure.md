---
title: If the sufficient statistic T needs a data structure, it's subset greedy, not an ordering
index_title: When the state needs a data structure, it's subset greedy
short: When the state needs a data structure
dek: "Built one piece at a time" and "building an order" sound the same. They aren't, and confusing them cost me the most time.
summary: Why "built one piece at a time" is not the same as "building an order."
byline: ~8 min read
---

<figure>
  <svg viewBox="0 0 680 210" role="img" aria-label="On the left a single number box labelled T; on the right a heap tree labelled T with a hidden second element highlighted">
    <rect class="f-soft" x="0" y="0" width="680" height="210" rx="4"/>
    <rect class="f-surf s-ink" stroke-width="2" x="90" y="70" width="120" height="60" rx="4"/>
    <text class="svgm f-ink" x="150" y="108" text-anchor="middle" font-size="24">T = 10</text>
    <text class="svgt f-ink" x="150" y="160" text-anchor="middle">a single number carries itself</text>
    <g stroke-width="1.8" class="s-mut" fill="none"><path d="M480 55 L420 115 M480 55 L540 115 M420 115 L390 170"/></g>
    <circle class="f-acc" cx="480" cy="55" r="20"/><text class="svgt f-bg" x="480" y="60" text-anchor="middle" font-weight="600">3</text>
    <circle class="f-mark s-acc" stroke-width="2.5" cx="420" cy="115" r="20"/><text class="svgt f-ink" x="420" y="120" text-anchor="middle" font-weight="600">7</text>
    <circle class="f-surf s-mut" stroke-width="1.5" cx="540" cy="115" r="20"/><text class="svgt f-ink" x="540" y="120" text-anchor="middle">9</text>
    <circle class="f-surf s-mut" stroke-width="1.5" cx="390" cy="170" r="16"/><text class="svgt f-ink" x="390" y="175" text-anchor="middle">8</text>
    <text class="svgt f-ink" x="600" y="60">min you read</text>
    <text class="svgt f-ink" x="455" y="195" text-anchor="middle">the next min was hidden all along</text>
  </svg>
</figure>

By this point I had a working test for ordering problems. The natural next worry was what to do when it failed. If no single sort key exists, is the answer immediately "use DP"? Several classic algorithms seemed to sit in between: they don't sort once, but they keep picking the best available thing from a priority queue, recomputing as they go.

::: q The question
If no static key exists for an ordering problem, can I fall back to an "adaptive" greedy with a priority queue, like the ones that repeatedly merge the two smallest items, before concluding it's DP?
:::

My first answer was yes, with a three-step ladder: static key, then adaptive key, then DP. To test it, I tried something concrete: write the separability and block-invariance proof for Prim's algorithm (grow a minimum spanning tree by repeatedly adding the cheapest edge leaving the tree so far), since it had been filed under "adaptive."

Trying to do that broke the classification in two separate ways:

- **No single number summarizes the past.** The obvious candidate is "how many vertices are in the tree." But two trees of the same size can cover completely different vertices, with completely different cheap edges leaving them. What matters is *which* vertices, not how many.
- **The build order isn't freely rearrangeable.** Take a triangle with edges A–B (weight 1), B–C (weight 2) and A–C (weight 10), starting from A. Prim's adds A–B, then B–C. But "swap them" isn't even a legal move: B–C can't be added first, because neither end is in the tree yet. Scheduling never had this problem; any two jobs can run in either order.

Both failures come from one fact. The answer to a spanning-tree problem is the *set* of edges chosen. The order they were added in has no effect on the total. The ordering machinery was built for objectives where position matters, so it has nothing to grip here. Prim's is a subset problem that happens to be built one piece at a time, and it belongs with the subset methods in part 4. The same turned out to be true for merging-the-two-smallest style algorithms.

> The defining property of an ordering problem isn't that you build it step by step. It's that position in the sequence changes the cost.

## When T turns out to be a heap

This came up again with a scheduling problem: each unit-time task has a deadline and a reward, and you want the most reward from tasks finished on time. One efficient solution sorts by deadline and keeps the chosen tasks in a min-heap, throwing out the smallest reward whenever there are more tasks than time slots. It looked like an ordering problem with a very compact $T$: the heap's size and its smallest element.

::: q The question
Doesn't this mean T doesn't have to be a single number after all? The heap exposes one number, its minimum, at each step, so maybe it still counts.
:::

We checked it directly. Put 3, 7 and 9 in a heap. The minimum is 3 and the size is 3. Push 8, then remove the smallest: the 3 goes, and the new minimum is 7. Nothing in "minimum 3, size 3" could have told you that. The 7 was sitting inside the heap the whole time, invisible to the summary.

That separates two questions that are easy to blur:

- **Does the decision at this step read only a small summary?** Yes: compare against the heap's minimum.
- **Can that summary work out its own next value from itself plus the new item?** No. It needs the whole multiset underneath it.

My first instinct was to make the second question a permanent third check for ordering problems. That turned out to be the wrong move: it made the framework bigger for a problem that wasn't an ordering problem in the first place. The better fix was simpler. For genuine ordering problems, keep separability and block invariance. When $T$ turns out to need a full data structure just to know its own next value, treat that as a *signal*: you're probably looking at subset selection. The heap is doing the work of a feasibility check (part 4 explains which one), not tracking the state of a sequence.

::: note Why this is a reliable signal
In a real ordering problem, $T$ has to be one number, and that isn't a coincidence. The swap proof works by reducing to a single inequality. A state with several independent dimensions would need several inequalities to agree on one order, which is exactly what fails in multi-constraint problems.
:::

## "But the problem says I choose an order"

::: q The question
That deadline problem literally asks me to decide the order in which tasks are done. How can it not be an ordering problem?
:::

Don't argue it; test it. Take the tasks one good solution uses and try every ordering of them. For the example we used, only 1 of the 24 orderings was even feasible, so order clearly matters for *whether* a schedule works. But every feasible ordering earned the same reward, 15. And one mechanical rule, sort the chosen tasks by deadline, always finds a feasible order whenever one exists.

So order isn't a trade-off you're optimizing. It's bookkeeping you do after the real decision, which is *which tasks to take*. That's a subset problem wearing a scheduling costume. Compare weighted completion time from part 2: there, different orderings of the same jobs give genuinely different totals, and the order is the thing being optimized.

::: note Carried forward
Two diagnostics. If $T$ needs a data structure, suspect a subset problem. To confirm, fix one chosen subset and try different valid orders: if the objective never changes, order is bookkeeping and you're in subset territory.
:::
