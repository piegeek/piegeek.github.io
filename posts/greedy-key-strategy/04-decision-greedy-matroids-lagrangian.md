---
title: Decision greedy: matroids and the Lagrangian
dek: Test the constraint before you look at the objective. Then, if you have to, put a price on the budget.
summary: Testing the constraint before the objective, and where "sort by ratio" really comes from.
byline: ~12 min read
---

<figure>
  <svg viewBox="0 0 680 220" role="img" aria-label="Items plotted by value-to-weight ratio with a horizontal price line; items above the line are included">
    <line class="s-mut" x1="60" y1="190" x2="640" y2="190" stroke-width="1.5"/>
    <line class="s-mut" x1="60" y1="20" x2="60" y2="190" stroke-width="1.5"/>
    <text class="svgt f-mut" x="20" y="30">ratio</text>
    <line class="s-acc" x1="60" y1="98" x2="640" y2="98" stroke-width="2.5" stroke-dasharray="8 5"/>
    <text class="svgm f-acc" x="600" y="90">λ</text>
    <rect class="f-acc" x="120" y="40" width="44" height="150"/><text class="svgt f-ink" x="142" y="210" text-anchor="middle">A · 6</text>
    <rect class="f-acc" x="230" y="70" width="44" height="120"/><text class="svgt f-ink" x="252" y="210" text-anchor="middle">B · 5</text>
    <rect class="f-mut" x="340" y="110" width="44" height="80"/><text class="svgt f-ink" x="362" y="210" text-anchor="middle">D · 4</text>
    <rect class="f-mut" x="450" y="140" width="44" height="50"/><text class="svgt f-ink" x="472" y="210" text-anchor="middle">E · 2</text>
    <text class="svgt f-ink" x="520" y="130">below the price:</text>
    <text class="svgt f-ink" x="520" y="148">left out</text>
  </svg>
  <figcaption>Lower the price and items switch on in ratio order, whatever the final price turns out to be.</figcaption>
</figure>

With orderings handled, the other half of my original model was waiting: problems where the answer is a subset. I had heard two phrases for these, "check if it's a matroid" and "use a Lagrangian," and I understood neither well enough to use them.

::: q The question
How do I actually tell whether a problem is a matroid? And what is a Lagrangian? I've never been shown one.
:::

## A matroid is a property of the constraint

This was the first thing to unlearn. I had been choosing between "matroid" and "not matroid" by looking at the objective. The matroid question has nothing to do with the objective. It's about the rule that says which subsets are allowed.

A useful fact makes it testable: in a matroid, every maximal allowed set (one you can't add anything else to) has the same size. So if you can find two maximal sets of different sizes, it isn't a matroid, full stop. Take items of weight 1, 1 and 3 with a capacity of 3. Take the two 1s first: weight 2, and the 3 won't fit, so that set is maximal with 2 items. Take the 3 first: nothing else fits, so that set is maximal with 1 item. Two sizes, not a matroid. That's why a weight budget with unequal weights has no simple greedy solution.

When the constraint *is* a matroid, the payoff is large: sort by the raw value of each item and add it whenever the set stays allowed. That's exactly optimal, for any values. The classic case is "no cycles" in a graph, which is why Kruskal's algorithm for spanning trees works.

## A Lagrangian is a price on the budget

When the matroid test fails and there's a single budget, the Lagrangian is the next tool. I asked for it built from scratch, and it turned out to be one idea. The problem is: maximize $Σ c_ix_i$ subject to $Σ a_ix_i ≤ B$. The budget is the only thing tying the items together. So replace the hard limit with a price $λ$ per unit of budget used, and give back $λB$ for the budget you were handed:

$$ L(x, λ) = Σ (c_i − λa_i) x_i + λB $$

With the price fixed, every item decides on its own: include it if $c_i − λa_i &gt; 0$, which is the same as $c_i/a_i &gt; λ$. Each item switches on at its own ratio. So as the price falls, items switch on in ratio order, and you don't need to know the final price to know the order. That's where "sort by value per weight" actually comes from. Using the items from part 1:

| Price λ | A (ratio 6) | B (ratio 5) | D (ratio 4) |
|---------|-------------|-------------|-------------|
| 5.5     | in {.good}  | out         | out         |
| 4.5     | in {.good}  | in {.good}  | out         |
| 3.5     | in {.good}  | in {.good}  | in {.good}  |

This also explains why problems with two budgets have no simple key. With two prices, an item's net value is $c_i − λ_1a_i − λ_2b_i$, and whether it beats another item depends on the balance between the two prices, which depends on the whole input. The ranking can flip. That's a different mathematical situation, not a key nobody has found yet.

## Key versus strategy

::: q The question
Isn't the matroid really telling me the strategy, not the key?
:::

Yes, and seeing that exposed an asymmetry between the two cases.

- **Matroid:** the key is trivial, just the raw value. All the real work is confirming the constraint has the right structure.
- **Lagrangian:** the key takes real derivation (the ratio). But the strategy is only exact when you're allowed to take a fraction of an item. With the items above and capacity 50, taking A and B whole and two-thirds of D gives 240, the best possible fractional answer. Whole items only, the true best is 220. The ratio key is right; turning it into a whole-item answer is where exactness is lost.

## Stop, or skip and keep going?

::: q The question
For whole items, when the next item in ratio order doesn't fit, should I stop there or skip it and keep checking smaller ones?
:::

A small example settles which is better. Items worth 9 (weight 5), 10 (weight 6) and 1 (weight 1), capacity 6, in ratio order. Stopping at the first item that doesn't fit gets 9. Skipping it and continuing picks up the weight-1 item too and gets 10.

That's not luck. Both rules make identical choices until the first item that doesn't fit. After that point, stopping gives up entirely, while skipping can only find more. So skipping is never worse, on any input. A check across 50,000 random inputs found no exceptions. There's no "try both and pick the better one"; always skip and continue.

But winning that comparison doesn't make it exact. On the part 1 items at capacity 50, skip-and-continue takes A and B for 160, while the best is 220. What it guarantees is at least half of the best answer, if you also compare against the single most valuable item. It's exact only when all weights are equal, because then the budget is just "pick any $k$ items," which is a matroid in disguise.

## Does subset greedy reduce to ordering greedy?

::: q The question
Decision DP can always be simulated by exploration DP. Can decision greedy always be simulated by exploration greedy, even if inefficiently?
:::

Not in the same sense. DP can switch forms because it searches the full space either way. Greedy isn't a search; it's a proof that one path is enough, and a proof that works for subsets doesn't imply one exists for orderings. What you do see in practice is that a working subset greedy *looks* like two layers: a sort (order the candidates by the key) followed by a filter (walk them and include each if the set stays allowed). Kruskal's is exactly that. And when subset greedy fails because the problem genuinely needs more than one number of state, the sort-based version fails for the same reason.

## Where the data structures come from

::: q The question
So in an ordering problem T is always one number, but in a subset problem the strategy can use a data structure?
:::

Close, with one correction. The matroid property itself is proven once, on paper. A data structure never checks it at runtime. What a data structure does is run the "is this still allowed?" check quickly, and whether you need one depends on which kind of matroid you're in:

| Constraint                                       | Check                         | Needs                |
|--------------------------------------------------|-------------------------------|----------------------|
| Plain budget, equal weights                      | Does it fit?                  | One number           |
| No cycles in a graph                             | Does this edge close a cycle? | Union-find           |
| Each item matched to a slot or container it fits | Can it still be matched?      | Union-find or a heap |

That last row is the deadline problem from part 3: the heap was running this check, not tracking the state of a sequence.

::: note Carried forward
For subsets: test the constraint first. If maximal sets can differ in size, it's not a matroid, so go to the Lagrangian (one budget) or beyond. If it's a matroid, sort by raw value and add whenever the set stays allowed. For whole items under a budget, always skip and continue, and remember that's an approximation.
:::
