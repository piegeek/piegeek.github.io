---
series: A Structured Approach to All (Most) Greedy Problems
title: A Structured Approach to All (Most) Greedy Problems
html_title: A Structured Approach to All (Most) Greedy Problems — Sang Yeop Han
kicker: A seven-part series
dek: Most, if not all, algorithms textbooks don't really tell you how to get to the correct greedy algorithm. They only tell you to use the "exchange argument" to prove a solution that you have to come up with through intuition. Is there a structured process that can change this? That's what motivated this framework.
byline: Notes on building a greedy framework · 7 posts
description: A seven-part derivation of a framework for finding the greedy key, greedy strategy: just follow one of four archetypes

output: greedy-key-strategy/index.html
---

<figure>
  <svg viewBox="0 0 680 220" role="img" aria-label="A search tree whose branches narrow to a single highlighted path">
    <g stroke-width="1.5" fill="none">
      <path class="s-rule" d="M340 30 L160 90 M340 30 L280 90 M340 30 L400 90 M340 30 L520 90 M160 90 L100 150 M160 90 L190 150 M280 90 L250 150 M280 90 L310 150 M400 90 L370 150 M400 90 L430 150 M520 90 L490 150 M520 90 L580 150 M100 150 L80 200 M190 150 L200 200 M250 150 L240 200 M430 150 L440 200 M490 150 L500 200 M580 150 L600 200 M370 150 L360 200"/>
      <path class="s-acc" stroke-width="3.5" d="M340 30 L400 90 L370 150 L360 200"/>
    </g>
    <g>
      <circle class="f-acc" cx="340" cy="30" r="8"/>
      <circle class="f-mut" cx="160" cy="90" r="5"/><circle class="f-mut" cx="280" cy="90" r="5"/><circle class="f-acc" cx="400" cy="90" r="8"/><circle class="f-mut" cx="520" cy="90" r="5"/>
      <circle class="f-mut" cx="100" cy="150" r="4"/><circle class="f-mut" cx="190" cy="150" r="4"/><circle class="f-mut" cx="250" cy="150" r="4"/><circle class="f-mut" cx="310" cy="150" r="4"/><circle class="f-acc" cx="370" cy="150" r="8"/><circle class="f-mut" cx="430" cy="150" r="4"/><circle class="f-mut" cx="490" cy="150" r="4"/><circle class="f-mut" cx="580" cy="150" r="4"/>
      <circle class="f-acc" cx="360" cy="200" r="8"/>
    </g>
    <text class="svgt f-mut" x="20" y="36">DP explores every branch</text>
    <text class="svgt f-acc" x="440" y="205">greedy proves one path is enough</text>
  </svg>
</figure>

Dynamic programming has a recipe. You write down a state, a transition, and a base case, and correctness comes for free because you are just searching everything efficiently. Greedy algorithms never felt like that to me. Each one seemed to come with its own trick: sort by ratio here, by deadline there, by end point somewhere else. Whether I could solve a greedy problem depended on whether I had seen it before.

This series records how that changed. I set out to find a way to *derive* greedy keys and strategies instead of recalling them or blindly relying on some intangible sense of intuition. By the end, I had four archetypes, a short diagnostic funnel for telling them apart, and a clear line around the problems that don't belong to greedy at all.

Each post picks up where the last one stopped, so reading in order works best.

## The posts

{{toc}}
