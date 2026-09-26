# posts/

Markdown sources for the long-form write-ups. Edit these, then build:

```sh
python3 build.py                      # build every series
python3 build.py greedy-key-strategy  # just one
python3 build.py --check              # report what would change, write nothing
```

No dependencies — stock `python3` is enough. The generated HTML is
committed alongside the markdown, because GitHub Pages serves files and
does not run a build.

## Layout

```
posts/
  _series.html                  the shell: <head>, top bar, router script
  greedy-key-strategy/
    00-index.md                 series overview; holds series-wide settings
    01-....md  …  07-....md     one file per part, ordered by filename
```

Parts are ordered by filename, so renumbering files reorders the series.
The first file (`00-`) is the index. Each file becomes one
`<section data-page>`; they are concatenated into a single HTML file that
the page's hash router shows one at a time, which is what makes `#ch3` a
real URL without a second request.

**The table of contents and the previous/next links are generated.** They
come from the file order and each part's front matter, so nothing that
names another part is written by hand. To reorder, rename files.

## Front matter

Opens the file, `---` delimited, one `key: value` per line. Values are
plain text — no quoting, no nesting, no lists.

Every part:

| key | |
| --- | --- |
| `title` | the `<h1>`. Required. |
| `dek` | standfirst under the title |
| `byline` | ` · ` splits it into separate spans |
| `summary` | the one-line description in the contents list |
| `index_title` | contents-list heading, if it should differ from `title` |
| `short` | previous/next heading, where there is less room. Falls back to `index_title`, then `title` |

The index file (`00-index.md`) also takes:

| key | |
| --- | --- |
| `series` | series name, shown in the top bar and each part's kicker |
| `html_title` | `<title>` for the whole file |
| `description` | `<meta name="description">` |
| `kicker` | eyebrow above the index title |
| `output` | where to write the HTML, relative to the repo root |

## Markdown

Standard: `##`/`###` headings (`#` is the title, which comes from front
matter), paragraphs, `-` and `1.` lists, `> quotes`, ``` fenced code,
`**bold**`, `*italic*`, `` `code` ``, `[links](url)`, `==highlight==`.

### Maths

`$...$` is a variable, set in serif italic. Inside it, `_` and `^` are
subscript and superscript — `_i` for one character, `_{i+1}` for more:

```
the ratio $w_i/p_i$ beats $w_j/p_j$
```

`$$...$$` alone on a line is a centred display equation, in maths mode
throughout, so bare `_i` works without the single `$`.

### Callouts

```
::: q The question
Is there a general way to derive the greedy key?
:::

::: note Carried forward
The swap test needs separability and block invariance.
:::
```

The text after the container name is the small uppercase label, and may
be left off. `q` is a posed question, `note` is an accented aside; both
take any number of paragraphs.

### The checklist

A numbered procedure whose labels are not sequential integers:

```
::: checklist
- [0] Count degrees of freedom.
- [2.1] A non-linear objective suggests row 4.
:::
```

### Tables

Ordinary markdown tables. A cell of digits and arithmetic gets tabular
figures automatically; `{.good}` or `{.bad}` at the end of a cell colours
it, and is stripped from the text:

```
| Order    | Worst    |
| -------- | -------- |
| A then B | 4 {.bad} |
| B then A | 1 {.good}|
```

### Figures and other raw HTML

A line starting with a block tag at column 0 is passed through verbatim
until its closing tag, which is how the inline SVG figures work:

```
<figure>
  <svg viewBox="0 0 680 200" role="img" aria-label="...">
    <rect class="f-soft" x="0" y="0" width="680" height="200" rx="4"/>
  </svg>
  <figcaption>What the drawing shows</figcaption>
</figure>
```

Use the theme's SVG classes rather than hex colours, so figures follow
dark mode and any later palette change: `f-ink` `f-mut` `f-acc` `f-bg`
`f-mark` `f-soft` (figure panel) `f-surf` (raised box) for fills,
`s-ink` `s-mut` `s-acc` `s-rule` for strokes, and `svgt` / `svgm` for
label and maths text. They are defined in `assets/css/post.css`.

## Adding a part

Add a file, keeping the numbering in order. Give it `title`, `dek`,
`summary` and `byline`, write the body, and build. The contents list, the
previous/next links, the "Part 3 of 8" labels and the top bar's part
count all update on their own.

## Adding a series

Copy a series directory, keep one `00-index.md` with a new `output:`, and
build. `build.py` picks up every directory under `posts/`.
