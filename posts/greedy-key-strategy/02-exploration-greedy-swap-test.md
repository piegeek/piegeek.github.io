---
title: Exploration greedy: The groundwork for all greedy archetypes that follow
short: Exploration greedy: the two-item swap
dek: The greedy key falls out as a pure function of k. Separability and Block-invariance proves this, which is a clearer restatement of the conventional exchange argument.
summary: The greedy key is just f(k). Sort by it. Build the solution from it.
byline: ~15 min read
---

## The conclusion first
Exploration greedy, a greedy subtype where we have to build up a permutation to solve the problem. You can think of it as similar to permutation dp, where ordering matters in a problem.

All things aside, I'll just plainly give you the final conclusion as to how to solve these types of problems.

First, identify the greedy key and some scalar sufficient statistic T that summarizes the past of the prefix. Here, the greedy key is always a function of item[k], where item[k] is the input.

As you might've guessed, if the input is not a numerical array, then we can't derive the key using this method, so you can assume that almost always the solution to the problem is not going to be about building up a ordering. Instead, we're going to talk about that type of problem in a later section.

Another thing to note is that I've mentioned T must be a scalar. While solving the problem, you have the suspicion that you might need a data structure (heap, stack, etc) to keep track of this prefix, then it's not permutation greedy, but subset greedy. We'll dive deep into it in the next post so stay tuned.

Once you've found the greedy key as f(k), all there is left is building the ordering that matches the problem's specification.

This is where T comes in. While building the order, we need to perform feasibility checks to see if we can append the candidate to our solution array. Here, we check against T, which is a compressed history of the past (think of the Markov property). 

<figure>
  <svg viewBox="0 0 680 222" role="img" aria-label="Pipeline: items, a key computed from each item alone, sort, then build while checking a single number T. If T needs a heap or stack, suspect subset greedy.">
    <rect class="f-soft" x="0" y="0" width="680" height="222" rx="4"/>
    <rect class="f-surf" x="18" y="34" width="112" height="54" rx="3"/>
    <text class="svgt f-ink" x="74.0" y="57" text-anchor="middle" font-weight="600">items</text>
    <text class="svgt f-mut" x="74.0" y="77" text-anchor="middle">3 · 7 · 2 · 5</text>
    <rect class="f-acc" x="156" y="34" width="128" height="54" rx="3"/>
    <text class="svgt f-bg" x="220.0" y="57" text-anchor="middle" font-weight="600">key</text>
    <text class="svgm f-bg" x="220.0" y="77" text-anchor="middle">f(item[k])</text>
    <rect class="f-surf" x="310" y="34" width="96" height="54" rx="3"/>
    <text class="svgt f-ink" x="358.0" y="57" text-anchor="middle" font-weight="600">sort</text>
    <text class="svgt f-mut" x="358.0" y="77" text-anchor="middle">by key</text>
    <rect class="f-surf" x="432" y="34" width="120" height="54" rx="3"/>
    <text class="svgt f-ink" x="492.0" y="57" text-anchor="middle" font-weight="600">build</text>
    <text class="svgt f-mut" x="492.0" y="77" text-anchor="middle">checking T</text>
    <rect class="f-surf" x="578" y="34" width="84" height="54" rx="3"/>
    <text class="svgt f-ink" x="620.0" y="66" text-anchor="middle" font-weight="600">order</text>
    <line class="s-mut" x1="133" y1="61" x2="146.0" y2="61.0" stroke-width="1.5"/>
    <path class="f-mut" d="M153.0 61.0 L146.0 57.1 L146.0 64.8 Z"/>
    <line class="s-mut" x1="287" y1="61" x2="300.0" y2="61.0" stroke-width="1.5"/>
    <path class="f-mut" d="M307.0 61.0 L300.0 57.1 L300.0 64.8 Z"/>
    <line class="s-mut" x1="409" y1="61" x2="422.0" y2="61.0" stroke-width="1.5"/>
    <path class="f-mut" d="M429.0 61.0 L422.0 57.1 L422.0 64.8 Z"/>
    <line class="s-mut" x1="555" y1="61" x2="568.0" y2="61.0" stroke-width="1.5"/>
    <path class="f-mut" d="M575.0 61.0 L568.0 57.1 L568.0 64.8 Z"/>
    <rect class="f-acc" x="457" y="132" width="70" height="38" rx="3"/>
    <text class="svgm f-bg" x="492" y="157" text-anchor="middle">T</text>
    <line class="s-mut" x1="492" y1="88" x2="492" y2="132" stroke-width="1.5"/>
    <text class="svgt f-mut" x="500" y="114">reads and updates</text>
    <text class="svgt f-mut" x="492" y="196" text-anchor="middle">one number: the prefix, compressed</text>
    <rect class="f-soft s-mut" x="40" y="126" width="300" height="50" rx="3" fill="none" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text class="svgt f-ink" x="190" y="147" text-anchor="middle">T needs a heap or stack instead?</text>
    <text class="svgt f-mut" x="190" y="166" text-anchor="middle">suspect subset greedy · Part 3</text>
    <line class="s-mut" x1="455" y1="151" x2="351.0" y2="151.0" stroke-width="1.5" stroke-dasharray="5 4"/>
    <path class="f-mut" d="M344.0 151.0 L351.0 154.8 L351.0 147.2 Z"/>
  </svg>
  <figcaption>The whole method in one line: compute a key from each item alone, sort by it, then build the order while carrying one number, T. If carrying T takes a data structure, you are probably not building an order at all.</figcaption>
</figure>

Now, for those of you who might want to know the technical details of how this works, there are two things you must understand.

1. Separability
2. Block invariance

These two terms are just technical jargon as to why the greedy key must be a pure function of k. Also, it provides a mathematical baseline against which we can verify our greedy strategy will produce the optimal solution. You can think of it as another way of viewing the exchange argument that you may be familiar with. By using these two terms, instead of going through the tedious process of verifying an alternative solution can be reduced to the greedy solution without losing optimality, we can just mechanically check a two-item swap at each step *repeatedly*

Notice *repeatedly* is in italics. It's nuanced. Formally, given enough time, we should iteratively go through the swap process like we would do with the exchange argument, but for coming up with a greedy solution and checking its validity on a small set of examples, using this method is much faster, cleaner, and straightforward. You probably only have to do the swap only once practically.

The details are as follows.

## Separability
Greedy key must always be a pure function of the property of item of interest - k. Thus greedy_key = f(item[k])

Another way to put it:

Each term k depends on its own data, never on the identity of whichever job happens to sit next to it.

<figure>
  <svg viewBox="0 0 680 232" role="img" aria-label="Five neighbouring items; only item k feeds its key. Its neighbours are not an input.">
    <rect class="f-soft" x="0" y="0" width="680" height="232" rx="4"/>
    <rect class="f-surf" x="68" y="40" width="96" height="46" rx="3"/>
    <text class="svgm f-mut" x="116" y="69" text-anchor="middle">k−2</text>
    <rect class="f-surf" x="180" y="40" width="96" height="46" rx="3"/>
    <text class="svgm f-mut" x="228" y="69" text-anchor="middle">k−1</text>
    <rect class="f-acc" x="292" y="40" width="96" height="46" rx="3"/>
    <text class="svgm f-bg" x="340" y="69" text-anchor="middle">k</text>
    <rect class="f-surf" x="404" y="40" width="96" height="46" rx="3"/>
    <text class="svgm f-mut" x="452" y="69" text-anchor="middle">k+1</text>
    <rect class="f-surf" x="516" y="40" width="96" height="46" rx="3"/>
    <text class="svgm f-mut" x="564" y="69" text-anchor="middle">k+2</text>
    <rect class="f-soft s-acc" x="220" y="150" width="240" height="44" rx="3" fill="none" stroke-width="2"/>
    <text class="svgm f-ink" x="340" y="178" text-anchor="middle">key(k) = f(item[k])</text>
    <line class="s-acc" x1="340" y1="88" x2="340.0" y2="141.0" stroke-width="2"/>
    <path class="f-acc" d="M340.0 148.0 L343.9 141.0 L336.1 141.0 Z"/>
    <line class="s-rule" x1="228" y1="88" x2="296" y2="150" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text class="svgt f-mut" x="262" y="124" text-anchor="middle">×</text>
    <line class="s-rule" x1="452" y1="88" x2="384" y2="150" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text class="svgt f-mut" x="418" y="124" text-anchor="middle">×</text>
    <text class="svgt f-mut" x="236" y="124" text-anchor="end">not an input</text>
    <text class="svgt f-mut" x="444" y="124">not an input</text>
    <text class="svgt f-mut" x="340" y="220" text-anchor="middle">the same key wherever k sits, which is what makes sorting legal</text>
  </svg>
  <figcaption>Separability: the key is read off the item alone. Nothing about its neighbours, or about where it ends up, goes in.</figcaption>
</figure>

## Block Invariance
Given T, we check two possible input orders based on a given greedy key candidate and swap them. if cost(i, j | T) <= cost(j, i | T) and freedom(i, j | T) >= freedom(j, i | T) then we can conclude our greedy key choice was correct.

<figure>
  <svg viewBox="0 0 680 232" role="img" aria-label="Both orders of the pair finish at T plus p_i plus p_j, so the suffix starts from the same state.">
    <rect class="f-soft" x="0" y="0" width="680" height="232" rx="4"/>
    <text class="svgt f-mut" x="20" y="71">i first</text>
    <rect class="f-surf" x="96" y="46" width="140" height="40" rx="3"/>
    <text class="svgt f-ink" x="166" y="71" text-anchor="middle">prefix, state T</text>
    <rect class="f-acc" x="236" y="46" width="110" height="40" rx="3"/>
    <text class="svgm f-bg" x="291.0" y="72" text-anchor="middle">i</text>
    <rect class="f-mut" x="346" y="46" width="80" height="40" rx="3"/>
    <text class="svgm f-bg" x="386.0" y="72" text-anchor="middle">j</text>
    <rect class="f-surf" x="426" y="46" width="214" height="40" rx="3"/>
    <text class="svgt f-ink" x="533" y="71" text-anchor="middle">starts from the same state</text>
    <text class="svgt f-mut" x="20" y="141">j first</text>
    <rect class="f-surf" x="96" y="116" width="140" height="40" rx="3"/>
    <text class="svgt f-ink" x="166" y="141" text-anchor="middle">prefix, state T</text>
    <rect class="f-mut" x="236" y="116" width="80" height="40" rx="3"/>
    <text class="svgm f-bg" x="276.0" y="142" text-anchor="middle">j</text>
    <rect class="f-acc" x="316" y="116" width="110" height="40" rx="3"/>
    <text class="svgm f-bg" x="371.0" y="142" text-anchor="middle">i</text>
    <rect class="f-surf" x="426" y="116" width="214" height="40" rx="3"/>
    <text class="svgt f-ink" x="533" y="141" text-anchor="middle">starts from the same state</text>
    <line class="s-acc" x1="426" y1="34" x2="426" y2="164" stroke-width="2"/>
    <text class="svgt f-ink" x="426" y="24" text-anchor="middle">both orders finish the pair at T + p<tspan dy="4" font-size="9.75">i</tspan><tspan dy="-4"> + p</tspan><tspan dy="4" font-size="9.75">j</tspan></text>
    <text class="svgt f-mut" x="340" y="194" text-anchor="middle">cost(i, j | T) and cost(j, i | T) can differ; nothing after the line can</text>
    <text class="svgt f-mut" x="340" y="214" text-anchor="middle">the freedom handed on is equal, so the pair’s own cost decides</text>
  </svg>
  <figcaption>Block invariance: the pair ends at the same moment in both orders, so the suffix cannot tell them apart.</figcaption>
</figure>

## Now how do these two concepts relate to what we've discussed earlier?
You might wonder why separability and block invariance matters at at all, and where they come from in the first place.

Remember, the key thing for you to remember in the first type of archetypes of greedy (there are a total of four, BTW), exploration greedy (or permuation greedy), is that 1. You sort by a numeric value given to you as input, 2. Then build up an array that matches the specifications of the problem.

Once you've found the greedy key, it basically reduces to a simulation/implementation problem.

However, mathematically proving why the greedy key can be derived solely from a numeric input might make you confused. 

This is where the aforementioned two concepts, separability and block invariance come in.

<figure>
  <svg viewBox="0 0 680 222" role="img" aria-label="Two layers. What you do: sort by key, then build while checking T. Why it is allowed: separability under the sort, block invariance under the build.">
    <rect class="f-soft" x="0" y="0" width="680" height="222" rx="4"/>
    <text class="svgt f-mut" x="20" y="24" font-weight="600">WHAT YOU DO</text>
    <text class="svgt f-mut" x="20" y="140" font-weight="600">WHY IT’S ALLOWED</text>
    <rect class="f-surf" x="20" y="34" width="250" height="44" rx="3"/>
    <text class="svgt f-ink" x="145" y="61" text-anchor="middle">sort by key(k)</text>
    <rect class="f-surf" x="330" y="34" width="330" height="44" rx="3"/>
    <text class="svgt f-ink" x="495" y="61" text-anchor="middle">build the order, checking T</text>
    <line class="s-mut" x1="273" y1="56" x2="320.0" y2="56.0" stroke-width="1.5"/>
    <path class="f-mut" d="M327.0 56.0 L320.0 52.1 L320.0 59.9 Z"/>
    <rect class="f-soft s-acc" x="20" y="150" width="250" height="54" rx="3" fill="none" stroke-width="2"/>
    <text class="svgt f-ink" x="145" y="172" text-anchor="middle" font-weight="600">separability</text>
    <text class="svgt f-mut" x="145" y="192" text-anchor="middle">a fixed sort order exists</text>
    <rect class="f-soft s-acc" x="330" y="150" width="330" height="54" rx="3" fill="none" stroke-width="2"/>
    <text class="svgt f-ink" x="495" y="172" text-anchor="middle" font-weight="600">block invariance</text>
    <text class="svgt f-mut" x="495" y="192" text-anchor="middle">a two-item swap judges the whole order</text>
    <line class="s-acc" x1="145" y1="148" x2="145.0" y2="88.0" stroke-width="2"/>
    <path class="f-acc" d="M145.0 81.0 L141.2 88.0 L148.8 88.0 Z"/>
    <line class="s-acc" x1="495" y1="148" x2="495.0" y2="88.0" stroke-width="2"/>
    <path class="f-acc" d="M495.0 81.0 L491.1 88.0 L498.9 88.0 Z"/>
  </svg>
  <figcaption>Sorting and simulating is the part you run. Separability and block invariance are what make each of those two moves safe.</figcaption>
</figure>

Let's take a deeper dive.

## The exchange argument
For many of those of you who've been familiar with algorithm textbooks, is that you would find the "exchange argument" every time you read the greedy algorithm section.

In many books, they don't go deep into the details on why that is, it just states that proving a greedy strategy comes in two steps, first, by proving the greedy property through an exchange argument, then proving optimal substructure.

The exchange argument usually runs in four steps ([Wikipedia](https://en.wikipedia.org/wiki/Greedy_algorithm)):

1. Suppose some optimal solution O differs from the greedy solution G.
2. Find the first point where O and G make a different choice.
3. Show that swapping O's choice at that point for G's choice can't make O any worse.
4. Repeat at the next difference, and the next. *Gradually*, O turns into G without ever getting worse, so by induction G is optimal too.

<figure>
  <svg viewBox="0 0 680 580" role="img" aria-label="Weighted completion time with four jobs. A table defines p, w and w over p for jobs A to D. The order CDBA costs 99; three exchanges at the first difference give ADBC at 72, ABDC at 60 and the greedy order ABCD at 54.">
    <rect class="f-soft" x="0" y="0" width="680" height="580" rx="4"/>
    <text class="svgt f-ink" x="20" y="28" font-weight="600">One machine, four jobs, run back to back</text>
    <text class="svgt f-mut" x="24" y="58">job</text>
    <text class="svgt f-ink" x="110" y="58" text-anchor="middle" font-weight="600">A</text>
    <text class="svgt f-ink" x="150" y="58" text-anchor="middle" font-weight="600">B</text>
    <text class="svgt f-ink" x="190" y="58" text-anchor="middle" font-weight="600">C</text>
    <text class="svgt f-ink" x="230" y="58" text-anchor="middle" font-weight="600">D</text>
    <text class="svgm f-mut" x="24" y="82">p</text>
    <text class="svgt f-ink" x="110" y="82" text-anchor="middle">1</text>
    <text class="svgt f-ink" x="150" y="82" text-anchor="middle">2</text>
    <text class="svgt f-ink" x="190" y="82" text-anchor="middle">3</text>
    <text class="svgt f-ink" x="230" y="82" text-anchor="middle">4</text>
    <text class="svgm f-mut" x="24" y="106">w</text>
    <text class="svgt f-ink" x="110" y="106" text-anchor="middle">4</text>
    <text class="svgt f-ink" x="150" y="106" text-anchor="middle">4</text>
    <text class="svgt f-ink" x="190" y="106" text-anchor="middle">3</text>
    <text class="svgt f-ink" x="230" y="106" text-anchor="middle">2</text>
    <text class="svgm f-mut" x="24" y="130">w/p</text>
    <text class="svgt f-ink" x="110" y="130" text-anchor="middle">4</text>
    <text class="svgt f-ink" x="150" y="130" text-anchor="middle">2</text>
    <text class="svgt f-ink" x="190" y="130" text-anchor="middle">1</text>
    <text class="svgt f-ink" x="230" y="130" text-anchor="middle">0.5</text>
    <line class="s-rule" x1="20" y1="66" x2="250" y2="66" stroke-width="1"/>
    <text class="svgt f-ink" x="290" y="52">p = time the job takes</text>
    <text class="svgt f-ink" x="290" y="74">w = weight: cost per unit of finish time</text>
    <text class="svgt f-ink" x="290" y="96">C = finish time (the running total of p)</text>
    <text class="svgt f-ink" x="290" y="118">cost of an order = Σ w·C over all four jobs</text>
    <text class="svgt f-ink" x="290" y="140">G = greedy order: sort by w/p, largest first</text>
    <text class="svgt f-ink" x="290" y="162">O = any other order, e.g. a claimed optimum</text>
    <line class="s-rule" x1="20" y1="186" x2="660" y2="186" stroke-width="1"/>
    <text class="svgt f-mut" x="372" y="206">cost = Σ w·C</text>
    <text class="svgm f-ink" x="24" y="239">O</text>
    <rect class="f-surf" x="70" y="216" width="78" height="34" rx="3"/>
    <text class="svgm f-ink" x="109.0" y="239" text-anchor="middle">C</text>
    <line class="s-mut" x1="148" y1="252" x2="148" y2="258" stroke-width="1"/>
    <text class="svgt f-mut" x="148" y="271" text-anchor="middle">3</text>
    <rect class="f-surf" x="148" y="216" width="104" height="34" rx="3"/>
    <text class="svgm f-ink" x="200.0" y="239" text-anchor="middle">D</text>
    <line class="s-mut" x1="252" y1="252" x2="252" y2="258" stroke-width="1"/>
    <text class="svgt f-mut" x="252" y="271" text-anchor="middle">7</text>
    <rect class="f-surf" x="252" y="216" width="52" height="34" rx="3"/>
    <text class="svgm f-ink" x="278.0" y="239" text-anchor="middle">B</text>
    <line class="s-mut" x1="304" y1="252" x2="304" y2="258" stroke-width="1"/>
    <text class="svgt f-mut" x="304" y="271" text-anchor="middle">9</text>
    <rect class="f-surf" x="304" y="216" width="26" height="34" rx="3"/>
    <text class="svgm f-ink" x="317.0" y="239" text-anchor="middle">A</text>
    <line class="s-mut" x1="330" y1="252" x2="330" y2="258" stroke-width="1"/>
    <text class="svgt f-mut" x="330" y="271" text-anchor="middle">10</text>
    <text class="svgm f-mut" x="62" y="271" text-anchor="end">C</text>
    <text class="svgt f-ink" x="372" y="239">3·3 + 2·7 + 4·9 + 4·10 = 99</text>
    <rect class="f-acc" x="70" y="300" width="26" height="34" rx="3"/>
    <text class="svgm f-bg" x="83.0" y="323" text-anchor="middle">A</text>
    <line class="s-mut" x1="96" y1="336" x2="96" y2="342" stroke-width="1"/>
    <text class="svgt f-mut" x="96" y="355" text-anchor="middle">1</text>
    <rect class="f-surf" x="96" y="300" width="104" height="34" rx="3"/>
    <text class="svgm f-ink" x="148.0" y="323" text-anchor="middle">D</text>
    <line class="s-mut" x1="200" y1="336" x2="200" y2="342" stroke-width="1"/>
    <text class="svgt f-mut" x="200" y="355" text-anchor="middle">5</text>
    <rect class="f-surf" x="200" y="300" width="52" height="34" rx="3"/>
    <text class="svgm f-ink" x="226.0" y="323" text-anchor="middle">B</text>
    <line class="s-mut" x1="252" y1="336" x2="252" y2="342" stroke-width="1"/>
    <text class="svgt f-mut" x="252" y="355" text-anchor="middle">7</text>
    <rect class="f-surf" x="252" y="300" width="78" height="34" rx="3"/>
    <text class="svgm f-ink" x="291.0" y="323" text-anchor="middle">C</text>
    <line class="s-mut" x1="330" y1="336" x2="330" y2="342" stroke-width="1"/>
    <text class="svgt f-mut" x="330" y="355" text-anchor="middle">10</text>
    <text class="svgm f-mut" x="62" y="355" text-anchor="end">C</text>
    <text class="svgt f-ink" x="372" y="323">4·1 + 2·5 + 4·7 + 3·10 = 72</text>
    <text class="svgt f-mut" x="372" y="288">position 1 differs: exchange C ↔ A</text>
    <rect class="f-acc" x="70" y="384" width="26" height="34" rx="3"/>
    <text class="svgm f-bg" x="83.0" y="407" text-anchor="middle">A</text>
    <line class="s-mut" x1="96" y1="420" x2="96" y2="426" stroke-width="1"/>
    <text class="svgt f-mut" x="96" y="439" text-anchor="middle">1</text>
    <rect class="f-acc" x="96" y="384" width="52" height="34" rx="3"/>
    <text class="svgm f-bg" x="122.0" y="407" text-anchor="middle">B</text>
    <line class="s-mut" x1="148" y1="420" x2="148" y2="426" stroke-width="1"/>
    <text class="svgt f-mut" x="148" y="439" text-anchor="middle">3</text>
    <rect class="f-surf" x="148" y="384" width="104" height="34" rx="3"/>
    <text class="svgm f-ink" x="200.0" y="407" text-anchor="middle">D</text>
    <line class="s-mut" x1="252" y1="420" x2="252" y2="426" stroke-width="1"/>
    <text class="svgt f-mut" x="252" y="439" text-anchor="middle">7</text>
    <rect class="f-surf" x="252" y="384" width="78" height="34" rx="3"/>
    <text class="svgm f-ink" x="291.0" y="407" text-anchor="middle">C</text>
    <line class="s-mut" x1="330" y1="420" x2="330" y2="426" stroke-width="1"/>
    <text class="svgt f-mut" x="330" y="439" text-anchor="middle">10</text>
    <text class="svgm f-mut" x="62" y="439" text-anchor="end">C</text>
    <text class="svgt f-ink" x="372" y="407">4·1 + 4·3 + 2·7 + 3·10 = 60</text>
    <text class="svgt f-mut" x="372" y="372">position 2 differs: exchange D ↔ B</text>
    <text class="svgm f-ink" x="24" y="491">G</text>
    <rect class="f-acc" x="70" y="468" width="26" height="34" rx="3"/>
    <text class="svgm f-bg" x="83.0" y="491" text-anchor="middle">A</text>
    <line class="s-mut" x1="96" y1="504" x2="96" y2="510" stroke-width="1"/>
    <text class="svgt f-mut" x="96" y="523" text-anchor="middle">1</text>
    <rect class="f-acc" x="96" y="468" width="52" height="34" rx="3"/>
    <text class="svgm f-bg" x="122.0" y="491" text-anchor="middle">B</text>
    <line class="s-mut" x1="148" y1="504" x2="148" y2="510" stroke-width="1"/>
    <text class="svgt f-mut" x="148" y="523" text-anchor="middle">3</text>
    <rect class="f-acc" x="148" y="468" width="78" height="34" rx="3"/>
    <text class="svgm f-bg" x="187.0" y="491" text-anchor="middle">C</text>
    <line class="s-mut" x1="226" y1="504" x2="226" y2="510" stroke-width="1"/>
    <text class="svgt f-mut" x="226" y="523" text-anchor="middle">6</text>
    <rect class="f-acc" x="226" y="468" width="104" height="34" rx="3"/>
    <text class="svgm f-bg" x="278.0" y="491" text-anchor="middle">D</text>
    <line class="s-mut" x1="330" y1="504" x2="330" y2="510" stroke-width="1"/>
    <text class="svgt f-mut" x="330" y="523" text-anchor="middle">10</text>
    <text class="svgm f-mut" x="62" y="523" text-anchor="end">C</text>
    <text class="svgt f-ink" x="372" y="491">4·1 + 4·3 + 3·6 + 2·10 = 54</text>
    <text class="svgt f-mut" x="372" y="456">position 3 differs: exchange D ↔ C</text>
    <text class="svgt f-mut" x="340" y="546" text-anchor="middle">the cost never rose, so G is at least as good as O:</text>
    <text class="svgt f-mut" x="340" y="566" text-anchor="middle">if O was optimal, so is G</text>
  </svg>
  <figcaption>The textbook exchange argument on weighted completion time, the problem the pairwise interchange argument was first written for (Smith, 1956). Starting from O, find the first position where it differs from G and exchange O’s job there for G’s. The highlighted prefix that agrees with G grows by one each time, and the cost falls 99 → 72 → 60 → 54.</figcaption>
</figure>

However, note that I've used the term *gradually*. This is a multistep process and is time consuming. If the problem is not a textbook case you've seen before, trying to 1. come up with the greedy strategy in the first place, then 2. justifying it through this exchange argument is very time consuming and non-trivial.

Thus, I came up with a thought experiment. What if, instead of building Gs and Os, we just assume the prefix (T) of the solution is correct, then at the ith and jth item (where i, j > T) we swap them according to two different strategies. 

Then the intuition becomes, if one strategy **always** cancels out the other, or one strategy **always** dominates, we've found the greedy key, without going through the multi-step exchange argument.

All we need to do now, is to prove that this **Fixed prefix** + **Two-item swap** is mathematically sound and verifies the correct strategy.

<figure>
  <svg viewBox="0 0 680 232" role="img" aria-label="Left: the textbook exchange argument turns O into G in several steps, each needing its own argument. Right: fix the prefix T and compare i j against j i once.">
    <rect class="f-soft" x="0" y="0" width="680" height="232" rx="4"/>
    <line class="s-rule" x1="340" y1="18" x2="340" y2="214" stroke-width="1"/>
    <text class="svgt f-mut" x="170" y="30" text-anchor="middle">textbook exchange argument</text>
    <text class="svgt f-mut" x="510" y="30" text-anchor="middle">fixed prefix + two-item swap</text>
    <circle class="f-surf" cx="50" cy="100" r="20"/>
    <text class="svgm f-ink" x="50" y="106" text-anchor="middle">O</text>
    <circle class="f-surf" cx="130" cy="100" r="20"/>
    <text class="svgm f-ink" x="130" y="106" text-anchor="middle">O′</text>
    <circle class="f-surf" cx="210" cy="100" r="20"/>
    <text class="svgm f-ink" x="210" y="106" text-anchor="middle">O″</text>
    <circle class="f-acc" cx="290" cy="100" r="20"/>
    <text class="svgm f-bg" x="290" y="106" text-anchor="middle">G</text>
    <line class="s-mut" x1="73" y1="100" x2="100.0" y2="100.0" stroke-width="1.5"/>
    <path class="f-mut" d="M107.0 100.0 L100.0 96.2 L100.0 103.8 Z"/>
    <text class="svgt f-mut" x="90.0" y="86" text-anchor="middle">?</text>
    <line class="s-mut" x1="153" y1="100" x2="180.0" y2="100.0" stroke-width="1.5"/>
    <path class="f-mut" d="M187.0 100.0 L180.0 96.2 L180.0 103.8 Z"/>
    <text class="svgt f-mut" x="170.0" y="86" text-anchor="middle">?</text>
    <line class="s-mut" x1="233" y1="100" x2="260.0" y2="100.0" stroke-width="1.5"/>
    <path class="f-mut" d="M267.0 100.0 L260.0 96.2 L260.0 103.8 Z"/>
    <text class="svgt f-mut" x="250.0" y="86" text-anchor="middle">?</text>
    <text class="svgt f-mut" x="170" y="160" text-anchor="middle">each step needs its own argument,</text>
    <text class="svgt f-mut" x="170" y="180" text-anchor="middle">and a new problem needs new steps</text>
    <rect class="f-surf" x="370" y="66" width="90" height="34" rx="3"/>
    <text class="svgm f-ink" x="415" y="88" text-anchor="middle">T</text>
    <rect class="f-acc" x="460" y="66" width="60" height="34" rx="3"/>
    <text class="svgm f-bg" x="490" y="89" text-anchor="middle">i</text>
    <rect class="f-mut" x="520" y="66" width="60" height="34" rx="3"/>
    <text class="svgm f-bg" x="550" y="89" text-anchor="middle">j</text>
    <rect class="f-surf" x="370" y="130" width="90" height="34" rx="3"/>
    <text class="svgm f-ink" x="415" y="152" text-anchor="middle">T</text>
    <rect class="f-mut" x="460" y="130" width="60" height="34" rx="3"/>
    <text class="svgm f-bg" x="490" y="153" text-anchor="middle">j</text>
    <rect class="f-acc" x="520" y="130" width="60" height="34" rx="3"/>
    <text class="svgm f-bg" x="550" y="153" text-anchor="middle">i</text>
    <text class="svgt f-mut" x="520" y="121" text-anchor="middle">swap</text>
    <text class="svgt f-mut" x="510" y="190" text-anchor="middle">one inequality, checked once,</text>
    <text class="svgt f-mut" x="510" y="210" text-anchor="middle">the same at every position</text>
  </svg>
  <figcaption>The textbook route builds a fresh chain of exchanges for every problem. Fixing the prefix shrinks the whole argument to one comparison of two neighbours.</figcaption>
</figure>

Thus, we split all exploration (permuatation) greedy problems into two sub-types. 1. Sum-based greedy and 2. Bottleneck-greedy.

You might wonder, can all exploration greedy problems fall into these two types? That is a valid push-back, but think about the original objective.

When can greedy algorithms be used? - 1. The objective must be a linear-optimization problem. 2. The problem's constraints have a very specific constraint, such that an ordering created greedily always outputs the optimal solution.

Particularly, focus on point 1. The objective must be linear. Thus an example where we have two arrays as inputs; a[], b[], and the objective is MAX(a) x MAX(b) can't be reliably solved by the greedy archetypes (1-3) we've built, but needs a fourth type, where the solution is defining a strict inequality every solution must satisfy and constructing, *programatically*, a solution that matches the lower/upper bound of this inequality gives the correct solution. This is a side note, but if this solution cannot accurately match this lower/upper bound, then it's not a greedy problem at all, and you have to revert to dynamic programming to solve this np-hard case.

Now that was a long way to justify that exploration greedy can only be 1. Sum-based, or 2. Bottleneck-based.

Intuitively, since a linear objective is just a weighted aggregate or dominated by some bottleneck in the array, we can say the above two options are sufficient.

For each case, let's observe the mathematical significance, and draw the conclusion of how we reach separability and block invariance.

## The Sum Case
In a sum-based problem, every item adds its own cost to the total, and you want the total to be as small (or as large) as possible. Total waiting time, total penalty, that kind of thing.

Let's use a concrete one. You have jobs on a single machine. Job $k$ takes $p_k$ time and has a weight $w_k$. If it finishes at time $C_k$, it costs you $w_k C_k$. You want to minimize $\sum_k w_k C_k$.

**Fix the prefix.** Assume the first part of the schedule is already decided, and it's correct. The only thing we need to know about it is the time it ends at. Call that $T$. That's our scalar sufficient statistic.

**Swap two items.** The next two jobs are $i$ and $j$. Write out the cost of the pair in both orders.

$i$ first:

$$w_i(T + p_i) + w_j(T + p_i + p_j)$$

$j$ first:

$$w_j(T + p_j) + w_i(T + p_j + p_i)$$

Expand both and subtract. $w_i T$, $w_j T$, $w_i p_i$ and $w_j p_j$ show up on both sides, so they all cancel, and you're left with

$$\Delta = cost(i, j \mid T) - cost(j, i \mid T) = w_j p_i - w_i p_j$$

<figure>
  <svg viewBox="0 0 680 286" role="img" aria-label="Smith’s rule. In i first, j waits p_i and pays w_j times p_i. In j first, i waits p_j and pays w_i times p_j. Everything else is paid in both orders.">
    <rect class="f-soft" x="0" y="0" width="680" height="286" rx="4"/>
    <text class="svgt f-mut" x="560" y="36" text-anchor="middle">cost from T = 0</text>
    <text class="svgt f-mut" x="20" y="70">i first</text>
    <rect class="f-acc" x="110" y="50" width="80" height="30" rx="3"/>
    <text class="svgm f-bg" x="150.0" y="71" text-anchor="middle">i</text>
    <rect class="f-mut" x="190" y="50" width="120" height="30" rx="3"/>
    <text class="svgm f-bg" x="250.0" y="71" text-anchor="middle">j</text>
    <rect class="f-mark" x="110" y="84" width="80" height="14" rx="2"><title>j waits 2 time units at weight 1: extra cost 2</title></rect>
    <text class="svgt f-ink" x="200" y="96.0">j waits for i: w<tspan dy="4" font-size="9.75">j</tspan><tspan dy="-4">·p</tspan><tspan dy="4" font-size="9.75">i</tspan><tspan dy="-4"> = 1·2 = 2</tspan></text>
    <text class="svgt f-mut" x="20" y="160">j first</text>
    <rect class="f-mut" x="110" y="140" width="120" height="30" rx="3"/>
    <text class="svgm f-bg" x="170.0" y="161" text-anchor="middle">j</text>
    <rect class="f-acc" x="230" y="140" width="80" height="30" rx="3"/>
    <text class="svgm f-bg" x="270.0" y="161" text-anchor="middle">i</text>
    <rect class="f-mark" x="110" y="174" width="120" height="42" rx="2"><title>i waits 3 time units at weight 3: extra cost 9</title></rect>
    <text class="svgt f-ink" x="240" y="200.0">i waits for j: w<tspan dy="4" font-size="9.75">i</tspan><tspan dy="-4">·p</tspan><tspan dy="4" font-size="9.75">j</tspan><tspan dy="-4"> = 3·3 = 9</tspan></text>
    <text class="svgt f-ink" x="560" y="70" text-anchor="middle" font-weight="600">11</text>
    <text class="svgt f-ink" x="560" y="160" text-anchor="middle" font-weight="600">18</text>
    <line class="s-rule" x1="110" y1="44" x2="110" y2="222" stroke-width="1"/>
    <text class="svgm f-mut" x="110" y="236" text-anchor="middle">T</text>
    <text class="svgt f-mut" x="340" y="258" text-anchor="middle">shared by both orders, so it cancels: every T term, and w<tspan dy="4" font-size="9.75">i</tspan><tspan dy="-4"> p</tspan><tspan dy="4" font-size="9.75">i</tspan><tspan dy="-4"> + w</tspan><tspan dy="4" font-size="9.75">j</tspan><tspan dy="-4"> p</tspan><tspan dy="4" font-size="9.75">j</tspan></text>
    <text class="svgt f-ink" x="340" y="278" text-anchor="middle">Δ = w<tspan dy="4" font-size="9.75">j</tspan><tspan dy="-4"> p</tspan><tspan dy="4" font-size="9.75">i</tspan><tspan dy="-4"> − w</tspan><tspan dy="4" font-size="9.75">i</tspan><tspan dy="-4"> p</tspan><tspan dy="4" font-size="9.75">j</tspan><tspan dy="-4"> = 2 − 9 = −7, so i goes first</tspan></text>
  </svg>
  <figcaption>Where Δ comes from. With p<sub>i</sub> = 2, w<sub>i</sub> = 3, p<sub>j</sub> = 3, w<sub>j</sub> = 1, the only cost that differs between the orders is the shaded one: whoever goes second pays its weight for the time it spent waiting. The ratio w/p says i first, and 11 against 18 agrees.</figcaption>
</figure>

$i$ should go first when $\Delta \le 0$, which rearranges to

$$\frac{w_i}{p_i} \ge \frac{w_j}{p_j}$$

Now look at what just happened, because both properties come straight out of this.

**Separability.** $T$ disappeared from $\Delta$. Whatever the prefix was, the choice between $i$ and $j$ only depends on the $w$ and $p$ of those two jobs. So the key is a function of the item alone, $key(k) = w_k / p_k$. That's separability, and it's also the reason we're allowed to sort before building anything.

**Block invariance.** Both orders finish the pair at the same time, $T + p_i + p_j$. So every job after the pair starts at exactly the same moment either way, and its cost doesn't change. The freedom handed to the rest of the schedule is equal, and the only thing that differs between the two orders is $\Delta$.

This isn't a coincidence of this one problem. Say an item that starts at time $T$ costs $a_k T + b_k$ (the cost grows linearly with how late it starts) and pushes time forward by $p_k$. Do the same subtraction and you get

$$\Delta = a_j p_i - a_i p_j$$

$T$ cancels every time, so the key is always $a_k / p_k$.

**Why this is enough.** This is where the swap becomes the exchange argument. The prefix we fixed was arbitrary, so the comparison holds at every position in the schedule. Take any schedule that isn't sorted by $w/p$. Somewhere in it, two neighbours are in the wrong order. Swap them. By block invariance nothing outside the pair changes, and by the sign of $\Delta$ the pair doesn't get worse. Keep doing this until no neighbours are out of order, and you've arrived at the sorted schedule without the cost ever going up. So the sorted schedule is at least as good as whatever you started from, including an optimal one.

That's the *gradual* exchange from the textbook, but you never have to prove anything new along the way. Every step is the same two-item swap you already checked.

So the strategy holds: sort by $w_k / p_k$ descending, then build the schedule in that order.

## The Bottleneck Case
In a bottleneck problem, a single item decides the answer. You're minimizing the worst lateness, the latest finish, the heaviest load. All the other items can be doing great and the answer won't move.

Same machine, different objective. Job $k$ takes $p_k$ time and is due at $d_k$. If it finishes at $C_k$, its lateness is $C_k - d_k$. You want to minimize the largest lateness, $\max_k (C_k - d_k)$.

**Fix the prefix.** Same as before. The schedule up to time $T$ is decided and correct.

**Swap two items.** The next two jobs are $i$ and $j$. Whichever one goes second finishes at the same time in both orders:

$$M = T + p_i + p_j$$

$i$ first, the worst lateness of the pair is

$$\max(T + p_i - d_i,\ M - d_j)$$

$j$ first:

$$\max(T + p_j - d_j,\ M - d_i)$$

This is where it differs from the sum case. You can't subtract two maxes and expect things to cancel. So instead of looking for cancellation, we look for domination: show that every term on one side is at most some term on the other side.

Say $d_i \le d_j$ (WLOG). Check both terms of the $i$-first order against $M - d_i$, which is one of the terms of the $j$-first order.

- $T + p_i - d_i \le M - d_i$, because $M = T + p_i + p_j$ and $p_j \ge 0$.
- $M - d_j \le M - d_i$, because $d_j \ge d_i$.

Both are at most $M - d_i$, so

$$cost(i, j \mid T) \le M - d_i \le cost(j, i \mid T)$$

The job due earlier goes first.

A quick check with numbers: $T = 5$, job A takes 3 and is due at 10, job B takes 2 and is due at 6. A first, B finishes at 10 and is 4 late. B first, B is 1 late and A is right on time. Earlier due date wins, 1 against 4.

<figure>
  <svg viewBox="0 0 680 270" role="img" aria-label="Earliest due date. T equals 5. A takes 3 and is due at 10; B takes 2 and is due at 6. A first leaves B 4 late; B first leaves B 1 late and A on time.">
    <rect class="f-soft" x="0" y="0" width="680" height="270" rx="4"/>
    <line class="s-mut" x1="200" y1="40" x2="200" y2="226" stroke-width="1"/>
    <text class="svgt f-mut" x="200" y="30" text-anchor="middle">d<tspan dy="4" font-size="9.75">B</tspan><tspan dy="-4"> = 6</tspan></text>
    <line class="s-mut" x1="480" y1="40" x2="480" y2="226" stroke-width="1"/>
    <text class="svgt f-mut" x="480" y="30" text-anchor="middle">d<tspan dy="4" font-size="9.75">A</tspan><tspan dy="-4"> = 10</tspan></text>
    <text class="svgt f-mut" x="600" y="46" text-anchor="middle">worst</text>
    <text class="svgt f-mut" x="20" y="82">A first</text>
    <rect class="f-surf" x="60" y="62" width="70" height="30" rx="3"/>
    <text class="svgt f-ink" x="95" y="82" text-anchor="middle">T = 5</text>
    <rect class="f-acc" x="130" y="62" width="210" height="30" rx="3"/>
    <text class="svgm f-bg" x="235" y="83" text-anchor="middle">A</text>
    <rect class="f-mut" x="340" y="62" width="140" height="30" rx="3"/>
    <text class="svgm f-bg" x="410" y="83" text-anchor="middle">B</text>
    <line class="s-acc" x1="200" y1="104" x2="480" y2="104" stroke-width="2"/>
    <line class="s-acc" x1="200" y1="99" x2="200" y2="109" stroke-width="2"/>
    <line class="s-acc" x1="480" y1="99" x2="480" y2="109" stroke-width="2"/>
    <text class="svgt f-ink" x="340.0" y="124" text-anchor="middle">B finishes at 10, due 6: late 4</text>
    <text class="svgt f-ink" x="600" y="82" text-anchor="middle" font-weight="600">4</text>
    <text class="svgt f-mut" x="20" y="172">B first</text>
    <rect class="f-surf" x="60" y="152" width="70" height="30" rx="3"/>
    <text class="svgt f-ink" x="95" y="172" text-anchor="middle">T = 5</text>
    <rect class="f-mut" x="130" y="152" width="140" height="30" rx="3"/>
    <text class="svgm f-bg" x="200" y="173" text-anchor="middle">B</text>
    <rect class="f-acc" x="270" y="152" width="210" height="30" rx="3"/>
    <text class="svgm f-bg" x="375" y="173" text-anchor="middle">A</text>
    <line class="s-acc" x1="200" y1="194" x2="270" y2="194" stroke-width="2"/>
    <line class="s-acc" x1="200" y1="189" x2="200" y2="199" stroke-width="2"/>
    <line class="s-acc" x1="270" y1="189" x2="270" y2="199" stroke-width="2"/>
    <text class="svgt f-ink" x="280" y="199">B late 1, A on time</text>
    <text class="svgt f-ink" x="600" y="172" text-anchor="middle" font-weight="600">1 ✓</text>
    <line class="s-rule" x1="130" y1="238" x2="550" y2="238" stroke-width="1"/>
    <line class="s-rule" x1="130" y1="234" x2="130" y2="242" stroke-width="1"/>
    <text class="svgt f-mut" x="130" y="258" text-anchor="middle">5</text>
    <line class="s-rule" x1="200" y1="234" x2="200" y2="242" stroke-width="1"/>
    <text class="svgt f-mut" x="200" y="258" text-anchor="middle">6</text>
    <line class="s-rule" x1="270" y1="234" x2="270" y2="242" stroke-width="1"/>
    <text class="svgt f-mut" x="270" y="258" text-anchor="middle">7</text>
    <line class="s-rule" x1="340" y1="234" x2="340" y2="242" stroke-width="1"/>
    <text class="svgt f-mut" x="340" y="258" text-anchor="middle">8</text>
    <line class="s-rule" x1="410" y1="234" x2="410" y2="242" stroke-width="1"/>
    <text class="svgt f-mut" x="410" y="258" text-anchor="middle">9</text>
    <line class="s-rule" x1="480" y1="234" x2="480" y2="242" stroke-width="1"/>
    <text class="svgt f-mut" x="480" y="258" text-anchor="middle">10</text>
    <line class="s-rule" x1="550" y1="234" x2="550" y2="242" stroke-width="1"/>
    <text class="svgt f-mut" x="550" y="258" text-anchor="middle">11</text>
  </svg>
  <figcaption>The worked example, drawn. Swapping the pair moves B from 4 late to 1 late without making A late at all, which is the domination argument with numbers in it.</figcaption>
</figure>

**Separability.** This time $T$ didn't cancel. It's sitting inside $M$. But $M$ is the same number in both orders, and the comparison came down to $d_i \le d_j$ and nothing else. The prefix never changes which order wins. So the key is again a function of the item alone, $key(k) = d_k$.

**Block invariance.** The pair ends at $M$ either way, so every job after it starts at the same time and has the same lateness. Call the worst lateness of everything outside the pair $C$. It's the same number in both orders. The final answer is $\max(C, \text{worst of the pair})$, and since

$$a \le b \implies \max(C, a) \le \max(C, b)$$

winning the pair means winning the whole schedule. That's why checking two items is enough, even though the objective looks at every item.

**Why this is enough.** Same argument as the sum case. The prefix was arbitrary, so in any schedule that isn't sorted by due date there's a pair of neighbours in the wrong order. Swapping it never makes the answer worse, and repeating ends at the sorted schedule.

So the strategy holds here too: sort by $d_k$ ascending, then build the schedule in that order.

## What these two cases tell us
In both cases, we fixed a prefix, swapped two neighbours, and found the same two things.

First, which order wins doesn't depend on $T$ at all. In the sum case $T$ cancelled out. In the bottleneck case it didn't cancel, but it ended up on both sides of the comparison and never changed the result. Either way, the choice came down to comparing one number per item: $w/p$ in the first case, $d$ in the second. That's separability, and that number is our greedy key.

Second, swapping the pair only changes the pair. Both orders finish at the same time, so everything after them starts from the same point and costs the same. That's block invariance, and it's why looking at two items is enough to judge the whole schedule.

Put those together and you get the strategy. Take any order that isn't sorted by the key. Somewhere, two neighbours are in the wrong order. Swap them, and by the two properties, nothing gets worse. Keep going until nothing is out of order, and you're at the sorted order. So sorting by the key and building in that order is optimal.

<figure>
  <svg viewBox="0 0 680 262" role="img" aria-label="Line chart: total weighted completion time for each order as out-of-order neighbours are swapped one pair at a time, falling from 105 to 54 and never rising.">
    <rect class="f-soft" x="0" y="0" width="680" height="262" rx="4"/>
    <text class="svgt f-mut" x="20" y="28">total cost Σ w<tspan dy="4" font-size="9.75">k</tspan><tspan dy="-4"> C</tspan><tspan dy="4" font-size="9.75">k</tspan></text>
    <line class="s-rule" x1="60" y1="175.0" x2="650" y2="175.0" stroke-width="1"/>
    <text class="svgt f-mut" x="52" y="179.0" text-anchor="end">60</text>
    <line class="s-rule" x1="60" y1="125.0" x2="650" y2="125.0" stroke-width="1"/>
    <text class="svgt f-mut" x="52" y="129.0" text-anchor="end">80</text>
    <line class="s-rule" x1="60" y1="75.0" x2="650" y2="75.0" stroke-width="1"/>
    <text class="svgt f-mut" x="52" y="79.0" text-anchor="end">100</text>
    <polyline class="s-acc" points="90,62.5 180,77.5 270,107.5 360,142.5 450,157.5 540,180 630,190" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle class="f-acc s-soft" cx="90" cy="62.5" r="5" stroke-width="2"/>
    <circle cx="90" cy="62.5" r="13" fill="transparent"><title>DCBA: total 105 (start)</title></circle>
    <text class="svgt f-ink" x="90" y="226" text-anchor="middle">DCBA</text>
    <circle class="f-acc s-soft" cx="180" cy="77.5" r="5" stroke-width="2"/>
    <circle cx="180" cy="77.5" r="13" fill="transparent"><title>CDBA: total 99 (after swapping D↔C)</title></circle>
    <text class="svgt f-ink" x="180" y="226" text-anchor="middle">CDBA</text>
    <text class="svgt f-mut" x="135.0" y="248" text-anchor="middle">D↔C</text>
    <circle class="f-acc s-soft" cx="270" cy="107.5" r="5" stroke-width="2"/>
    <circle cx="270" cy="107.5" r="13" fill="transparent"><title>CBDA: total 87 (after swapping D↔B)</title></circle>
    <text class="svgt f-ink" x="270" y="226" text-anchor="middle">CBDA</text>
    <text class="svgt f-mut" x="225.0" y="248" text-anchor="middle">D↔B</text>
    <circle class="f-acc s-soft" cx="360" cy="142.5" r="5" stroke-width="2"/>
    <circle cx="360" cy="142.5" r="13" fill="transparent"><title>CBAD: total 73 (after swapping D↔A)</title></circle>
    <text class="svgt f-ink" x="360" y="226" text-anchor="middle">CBAD</text>
    <text class="svgt f-mut" x="315.0" y="248" text-anchor="middle">D↔A</text>
    <circle class="f-acc s-soft" cx="450" cy="157.5" r="5" stroke-width="2"/>
    <circle cx="450" cy="157.5" r="13" fill="transparent"><title>BCAD: total 67 (after swapping C↔B)</title></circle>
    <text class="svgt f-ink" x="450" y="226" text-anchor="middle">BCAD</text>
    <text class="svgt f-mut" x="405.0" y="248" text-anchor="middle">C↔B</text>
    <circle class="f-acc s-soft" cx="540" cy="180" r="5" stroke-width="2"/>
    <circle cx="540" cy="180" r="13" fill="transparent"><title>BACD: total 58 (after swapping C↔A)</title></circle>
    <text class="svgt f-ink" x="540" y="226" text-anchor="middle">BACD</text>
    <text class="svgt f-mut" x="495.0" y="248" text-anchor="middle">C↔A</text>
    <circle class="f-acc s-soft" cx="630" cy="190" r="5" stroke-width="2"/>
    <circle cx="630" cy="190" r="13" fill="transparent"><title>ABCD: total 54 (after swapping B↔A)</title></circle>
    <text class="svgt f-ink" x="630" y="226" text-anchor="middle">ABCD</text>
    <text class="svgt f-mut" x="585.0" y="248" text-anchor="middle">B↔A</text>
    <text class="svgt f-ink" x="102" y="66.5" font-weight="600">105</text>
    <text class="svgt f-ink" x="630" y="178.0" text-anchor="middle" font-weight="600">54</text>
  </svg>
  <figcaption>The argument run on real numbers. Jobs A–D with (p, w) = (1, 4), (2, 4), (3, 3), (4, 2) have keys w/p = 4, 2, 1, 0.5, and start in the worst order. Each step swaps one pair of neighbours the key says is out of order. The total never rises, and the walk ends at the sorted order.</figcaption>
</figure>

That's the exchange argument, but with every step being the same two-item swap you already checked. Instead of building a new exchange argument for every problem, you prove one inequality about two neighbours, and the rest follows.

In competitive programming, you need to balance the tradeoff between time and verification. Our approach provides a robust alternative to the arbitrary exchange argument provided in almost all textbooks, and also a practical strategy to extract a greedy key quickly and verify that to some degree of confidence by only using a small number of examples.

## Conclusion
That's it.

For exploration greedy problems (permutation greedy), do the following:

1. Extract greedy key as a pure function of k; key = f(k)
2. Sort by this greedy key
3. Build the solution by iterating through the sorted array in 2. and applying the feasibility check against a scalar sufficient statistic T.
4. OPTIONAL. If needed, verify the strategy by applying the two-item swap for separability and block-invariance. If you do this step iteratively, it gives you the same proof as the exchange argument.

<figure>
  <svg viewBox="0 0 680 196" role="img" aria-label="Four steps: key equals f of k, sort by the key, build while checking scalar T, and optionally verify with a two-item swap, which repeated is the exchange argument.">
    <rect class="f-soft" x="0" y="0" width="680" height="196" rx="4"/>
    <rect class="f-acc" x="16" y="40" width="140" height="64" rx="3"/>
    <text class="svgt f-bg" x="86.0" y="66" text-anchor="middle" font-weight="600">1 · key = f(k)</text>
    <text class="svgt f-bg" x="86.0" y="86" text-anchor="middle">reads item k only</text>
    <rect class="f-surf" x="174" y="40" width="118" height="64" rx="3"/>
    <text class="svgt f-ink" x="233.0" y="66" text-anchor="middle" font-weight="600">2 · sort</text>
    <text class="svgt f-mut" x="233.0" y="86" text-anchor="middle">by the key</text>
    <rect class="f-surf" x="310" y="40" width="170" height="64" rx="3"/>
    <text class="svgt f-ink" x="395.0" y="66" text-anchor="middle" font-weight="600">3 · build</text>
    <text class="svgt f-mut" x="395.0" y="86" text-anchor="middle">checking scalar T</text>
    <rect class="f-soft s-mut" x="498" y="40" width="164" height="64" rx="3" fill="none" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text class="svgt f-ink" x="580.0" y="66" text-anchor="middle" font-weight="600">4 · verify</text>
    <text class="svgt f-mut" x="580.0" y="86" text-anchor="middle">swap two neighbours</text>
    <line class="s-mut" x1="158" y1="72" x2="165.0" y2="72.0" stroke-width="1.5"/>
    <path class="f-mut" d="M172.0 72.0 L165.0 68.2 L165.0 75.8 Z"/>
    <line class="s-mut" x1="294" y1="72" x2="301.0" y2="72.0" stroke-width="1.5"/>
    <path class="f-mut" d="M308.0 72.0 L301.0 68.2 L301.0 75.8 Z"/>
    <line class="s-mut" x1="482" y1="72" x2="489.0" y2="72.0" stroke-width="1.5" stroke-dasharray="5 4"/>
    <path class="f-mut" d="M496.0 72.0 L489.0 68.2 L489.0 75.8 Z"/>
    <path class="s-mut" d="M556 106 C 556 146, 604 146, 604 112" fill="none" stroke-width="1.5"/>
    <path class="f-mut" d="M604.0 106.0 L600.1 113.0 L607.9 113.0 Z"/>
    <text class="svgt f-mut" x="580" y="166" text-anchor="middle">repeat it and you have</text>
    <text class="svgt f-mut" x="580" y="184" text-anchor="middle">the exchange argument</text>
    <text class="svgt f-mut" x="248" y="140" text-anchor="middle">1–3 are the algorithm; 4 is the proof, on demand</text>
  </svg>
  <figcaption>The recipe from the conclusion. The first three steps are what you run; the fourth is there when you want to be sure, and repeating it is exactly the textbook proof.</figcaption>
</figure>

What was above was an induction, a step-by-step derivation of how we got to this conclusion.

In the next post, we're going to talk about a specific type of problem.

Remember how I've mentioned that for exploration greedy, the T we check feasibility against should be a scalar?

Now, during implementation, there are going to be problems where that T should be implemented as a data structure rather than a scalar. In other words, it should hold more information than just the aggregate or the last visited state (Markov property).

For such cases, we're going to show that it's the second archetype of greedy problems we're to tackle in the series: the decision greedy (subset greedy).

Following that, we will properly look at how decision greedy problems can be solved in a structured way, just like this.

Keep an eye out for this series, since we're going to tackle all four greedy archetypes with this kind of structured approach, rather than relying on memorizing solutions.

## References

- Smith, W. E. (1956). "Various optimizers for single-stage production." *Naval Research Logistics Quarterly*, 3(1–2), 59–66.
- "Greedy algorithm." *Wikipedia*. [https://en.wikipedia.org/wiki/Greedy_algorithm](https://en.wikipedia.org/wiki/Greedy_algorithm). Accessed 26 September 2026.
