---
title: The starting frustration
dek: Exchange arguments verify a greedy key once you have it. I wanted a way to find the key in the first place.
summary: Why textbook exchange arguments verify a key but never find one, and why no universal key formula can exist.
byline: ~9 min read
---

<figure>
  <svg viewBox="0 0 680 200" role="img" aria-label="A lock labelled 'exchange argument' next to a key labelled with a question mark">
    <rect class="f-soft" x="0" y="0" width="680" height="200" rx="4"/>
    <g fill="none" stroke-width="3">
      <rect class="s-ink" x="120" y="80" width="120" height="90" rx="8"/>
      <path class="s-ink" d="M145 80 V55 a35 35 0 0 1 70 0 V80"/>
      <circle class="s-ink" cx="180" cy="118" r="10"/>
      <path class="s-ink" d="M180 128 V150"/>
    </g>
    <text class="svgt f-ink" x="180" y="192" text-anchor="middle">exchange argument: checks a key</text>
    <g fill="none" stroke-width="3" class="s-acc">
      <circle cx="430" cy="110" r="32"/>
      <path d="M462 110 H590 M560 110 V135 M585 110 V128"/>
    </g>
    <text class="svgm f-acc" x="430" y="118" text-anchor="middle" font-size="30">?</text>
    <text class="svgt f-acc" x="500" y="192" text-anchor="middle">where does the key come from?</text>
  </svg>
</figure>

## Two kinds of DP

I came in with a mental model I trusted for dynamic programming. Optimization DPs come in two shapes. **Exploration DP** builds a permutation: at each step you pick which unvisited item comes next.

```
for i in range(n):
    if not (visited & (1 << i)):
        best = max(best, cost[i] + dp(i, visited | (1 << i)))
```

**Decision DP** builds a subset: walk the items in a fixed order and decide, for each one, take it or skip it.

```
best = dp(idx + 1, C)                                    # skip
best = max(best, cost[idx] + dp(idx + 1, C + cap[idx]))  # take
```

Greedy, the usual story goes, is a special case of DP where you never need to branch. So I expected greedy to split the same way: *exploration greedy* builds an order greedily, and *decision greedy* builds a subset greedily. That part held up. What didn't hold up was the word "greedily." Build it greedily by *what*?

## What the textbooks give you

The standard answer has two steps: prove the greedy choice property with an exchange argument, then show optimal substructure. The trouble is the order of operations. An exchange argument takes a key you already have, say "sort by deadline," and checks that swapping two out-of-order items never hurts. It verifies. It doesn't generate. Somebody has to hand you the key first.

I also tried reading the key off a working DP. Write the recurrence, stare at the transitions, look for the pattern. That can't work, and it's worth saying why: the recurrence encodes *what* happens at each step, not *why* one choice would always beat another. The reason a swap is safe lives in the objective and the constraints, one level above the code.

::: q The question
Is there a general, mathematical way to derive the greedy key, rather than recognizing it from a problem I've already seen? Something that works in every scenario?
:::

## A detour: the potential function

I had asked ChatGPT the same question, and it offered something that sounded like exactly what I wanted:

$$ a* = argmin_a Φ(T_a(s)) $$

where Φ is "some monotone potential measuring future regret." Every greedy algorithm, it said, is almost minimizing a potential.

::: q The question
Is this the missing universal equation?
:::

It's true, but it's empty. If Φ is the true optimal cost of the remaining problem, then picking the action that minimizes it is just Bellman's principle of optimality with an oracle. That holds for *every* optimization problem, including the bag problem above, which has no greedy solution. An idea that applies equally to problems that have greedy solutions and problems that don't can't explain which is which.

The real content is in what the formula skips. It only becomes something you can compute when the future cost collapses onto a small summary of the state (elapsed time, remaining capacity) and behaves simply in it. Finding that summary, and proving it's enough, is the whole job. The swap test in the next post is exactly the check for that.
