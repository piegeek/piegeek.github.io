#!/usr/bin/env python3
"""Build the markdown sources in posts/ into published HTML.

    python3 build.py              # build every series under posts/
    python3 build.py --check      # build to memory, report what would change
    python3 build.py greedy-key-strategy

A series is a directory of markdown files: 00-index.md plus one file per
part, ordered by filename. Each gets its own <section data-page>, all of
them concatenated into one HTML file that the page's hash router shows
one at a time — so a part is a real URL (#ch3) without a second request.

The table of contents and the previous/next links are generated from the
series order and each part's front matter. Nothing that names another
part is written by hand; renaming or reordering parts is a matter of
renaming files.

No third-party packages: this runs on a stock python3. The markdown
dialect is only as wide as these posts need, and README.md in the posts
directory documents it.
"""

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
POSTS = ROOT / "posts"
TEMPLATE = POSTS / "_series.html"

# Block-level tags a markdown file may open at column 0 to hand raw HTML
# straight through. The inline SVG figures rely on this.
RAW_TAGS = {"figure", "div", "table", "nav", "svg", "aside", "details", "p"}

# Characters that may appear in a table cell that still counts as
# numeric, and so gets the tabular-figures class.
NUMERIC_CHARS = set("0123456789 .,:=+-/()%~×≈−–—")


# ------------------------------------------------------------------ util

def esc(text):
    """Escape for a context where no markup is allowed (code)."""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def die(msg):
    sys.exit(f"build.py: {msg}")


# --------------------------------------------------------- front matter

def split_front_matter(text, origin):
    """Leading ---/--- block of `key: value` lines. Values stay strings."""
    if not text.startswith("---"):
        die(f"{origin}: no front matter — the file must open with ---")
    end = text.find("\n---", 3)
    if end < 0:
        die(f"{origin}: front matter is never closed")

    meta = {}
    for lineno, line in enumerate(text[3:end].split("\n"), start=2):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, sep, value = line.partition(":")
        if not sep:
            die(f"{origin}:{lineno}: front-matter line is not `key: value`")
        meta[key.strip()] = value.strip()

    return meta, text[end + 4:].lstrip("\n")


# ---------------------------------------------------------- inline pass

# The LaTeX subset understood inside $...$ and $$...$$. Anything else
# stops the build with its name, rather than printing a raw backslash
# on the published page. Add entries here as posts need them.
MATH_SYMBOLS = {
    "le": "≤", "leq": "≤", "ge": "≥", "geq": "≥", "ne": "≠", "neq": "≠",
    "lt": "&lt;", "gt": "&gt;", "approx": "≈", "cdot": "·", "times": "×",
    "mid": " ∣ ", "in": " ∈ ", "to": " → ", "rightarrow": " → ",
    "implies": " ⟹ ", "iff": " ⟺ ", "infty": "∞", "dots": "…", "ldots": "…",
    "alpha": "α", "beta": "β", "delta": "δ", "epsilon": "ε", "lambda": "λ",
    "mu": "μ", "phi": "φ", "pi": "π", "sigma": "σ", "theta": "θ",
    "Delta": "Δ", "Phi": "Φ", "Sigma": "Σ",
}
# Set upright, as function names are in print.
MATH_OPERATORS = {"max", "min", "argmax", "argmin", "log", "exp", "sum"}
MATH_SPACES = {" ": " ", ",": " ", ";": " ", "quad": "\u2003"}


def _brace_end(src, i):
    """Index of the } matching the { at src[i]."""
    depth = 0
    for j in range(i, len(src)):
        depth += {"{": 1, "}": -1}.get(src[j], 0)
        if depth == 0:
            return j
    die(f"unbalanced braces in maths: ${src}$")


def _math_arg(src, i):
    """One argument to _, ^ or a command: {group}, \\command or a char.
    Returns the raw source of the argument and where parsing resumes."""
    while i < len(src) and src[i] == " ":
        i += 1
    if i >= len(src):
        die(f"maths ends where an argument was expected: ${src}$")
    if src[i] == "{":
        j = _brace_end(src, i)
        return src[i + 1:j], j + 1
    m = re.match(r"\\[A-Za-z]+", src[i:])
    if m:
        return m.group(0), i + len(m.group(0))
    return src[i], i + 1


def render_math(src):
    """$...$ and $$...$$: sub/superscripts, \\frac, \\text, and the
    symbols above. `-` becomes a true minus sign."""
    out = []
    i = 0
    while i < len(src):
        c = src[i]
        if c == "\\":
            m = re.match(r"\\([A-Za-z]+|.)", src[i:])
            name = m.group(1)
            i += len(m.group(0))
            if name == "frac":
                top, i = _math_arg(src, i)
                bottom, i = _math_arg(src, i)
                out.append(f'<span class="frac"><span>{render_math(top)}</span>'
                           f'<span>{render_math(bottom)}</span></span>')
            elif name == "text":
                text, i = _math_arg(src, i)
                out.append(f'<span class="up">{text}</span>')
            elif name in MATH_OPERATORS:
                glyph = "∑" if name == "sum" else name
                out.append(f'<span class="up">{glyph}</span>')
            elif name in MATH_SYMBOLS:
                out.append(MATH_SYMBOLS[name])
            elif name in MATH_SPACES:
                out.append(MATH_SPACES[name])
            elif name in "{}$_^%#\\":
                out.append(name)
            else:
                die(f"unknown maths command \\{name} in ${src}$ — "
                    f"add it to MATH_SYMBOLS in build.py")
        elif c in "_^":
            arg, i = _math_arg(src, i + 1)
            tag = "sub" if c == "_" else "sup"
            out.append(f"<{tag}>{render_math(arg)}</{tag}>")
        elif c == "{":
            j = _brace_end(src, i)
            out.append(render_math(src[i + 1:j]))
            i = j + 1
        else:
            out.append({"-": "−", "<": "&lt;", ">": "&gt;"}.get(c, c))
            i += 1
    return "".join(out)


def render_inline(src):
    """Markdown spans. Raw HTML in the source is passed through as-is, so
    nothing here escapes anything except the inside of a code span."""
    kept = []

    def keep(markup):
        kept.append(markup)
        return f"\x00{len(kept) - 1}\x01"

    # Code and math first: their contents are not markdown.
    src = re.sub(r"`([^`]+)`", lambda m: keep(f"<code>{esc(m.group(1))}</code>"), src)
    src = re.sub(r"\$([^$\n]+)\$",
                 lambda m: keep(f'<span class="m">{render_math(m.group(1))}</span>'), src)

    src = re.sub(r"==(.+?)==", r"<mark>\1</mark>", src)
    src = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", src)
    src = re.sub(r"(?<![*\w])\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", src)
    src = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', src)

    return re.sub(r"\x00(\d+)\x01", lambda m: kept[int(m.group(1))], src)


# ----------------------------------------------------------- block pass

def render_blocks(lines, origin):
    out = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]

        if not line.strip():
            i += 1
            continue

        # --- raw HTML, passed through verbatim -------------------------
        m = re.match(r"<(\w+)", line)
        if m and m.group(1) in RAW_TAGS:
            tag = m.group(1)
            buf = []
            depth = 0
            while i < n:
                buf.append(lines[i])
                depth += len(re.findall(rf"<{tag}\b", lines[i]))
                depth -= len(re.findall(rf"</{tag}>", lines[i]))
                i += 1
                if depth <= 0:
                    break
            else:
                die(f"{origin}: <{tag}> is never closed")
            out.append("\n".join(buf))
            continue

        # --- fenced code ----------------------------------------------
        if line.startswith("```"):
            i += 1
            buf = []
            while i < n and not lines[i].startswith("```"):
                buf.append(lines[i])
                i += 1
            if i >= n:
                die(f"{origin}: code fence is never closed")
            i += 1
            out.append(f"<pre><code>{esc(chr(10).join(buf))}</code></pre>")
            continue

        # --- ::: container --------------------------------------------
        if line.startswith(":::"):
            spec = line[3:].strip()
            if not spec:
                die(f"{origin}: ::: opens without a name")
            name, _, label = spec.partition(" ")
            buf = []
            depth = 1
            i += 1
            while i < n:
                stripped = lines[i].strip()
                if stripped.startswith(":::") and stripped != ":::":
                    depth += 1
                elif stripped == ":::":
                    depth -= 1
                    if depth == 0:
                        i += 1
                        break
                buf.append(lines[i])
                i += 1
            else:
                die(f"{origin}: ::: {name} is never closed")
            out.append(render_container(name, label.strip(), buf, origin))
            continue

        # --- $$ display equation --------------------------------------
        m = re.match(r"^\$\$(.+)\$\$$", line.strip())
        if m:
            out.append(f'<div class="eq">{render_math(m.group(1).strip())}</div>')
            i += 1
            continue

        # --- heading ---------------------------------------------------
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            if level < 2:
                die(f"{origin}: '# ' is the page title — it comes from front "
                    f"matter, so body headings start at '## '")
            out.append(f"<h{level}>{render_inline(m.group(2).strip())}</h{level}>")
            i += 1
            continue

        # --- blockquote ------------------------------------------------
        if line.startswith(">"):
            buf = []
            while i < n and lines[i].startswith(">"):
                buf.append(lines[i][1:].strip())
                i += 1
            # No inner <p>: the paragraph rule's bottom margin would show
            # up as dead space inside the quote.
            out.append(f"<blockquote>{render_inline(' '.join(buf))}</blockquote>")
            continue

        # --- table -----------------------------------------------------
        if line.lstrip().startswith("|") and i + 1 < n and re.match(
                r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            head = split_row(line)
            i += 2
            rows = []
            while i < n and lines[i].lstrip().startswith("|"):
                rows.append(split_row(lines[i]))
                i += 1
            out.append(render_table(head, rows))
            continue

        # --- list ------------------------------------------------------
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", line)
        if m:
            ordered = m.group(2)[0].isdigit()
            items = []
            while i < n:
                m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", lines[i])
                if not m:
                    if lines[i].startswith(("  ", "\t")) and lines[i].strip() and items:
                        items[-1] += " " + lines[i].strip()   # lazy continuation
                        i += 1
                        continue
                    break
                items.append(m.group(3).strip())
                i += 1
            tag = "ol" if ordered else "ul"
            body = "".join(f"<li>{render_inline(t)}</li>" for t in items)
            out.append(f"<{tag}>{body}</{tag}>")
            continue

        # --- paragraph -------------------------------------------------
        buf = []
        while i < n and lines[i].strip() and not starts_block(lines[i]):
            buf.append(lines[i].strip())
            i += 1
        out.append(f"<p>{render_inline(' '.join(buf))}</p>")

    return out


def starts_block(line):
    """True if the line begins a construct, so a paragraph must stop."""
    if line.startswith((":::", "```", ">", "#")):
        return True
    if re.match(r"^\s*([-*]|\d+\.)\s+", line):
        return True
    if line.lstrip().startswith("|"):
        return True
    if re.match(r"^\$\$.+\$\$$", line.strip()):
        return True
    m = re.match(r"<(\w+)", line)
    return bool(m and m.group(1) in RAW_TAGS)


def render_container(name, label, lines, origin):
    if name == "checklist":
        items = []
        for line in lines:
            if not line.strip():
                continue
            m = re.match(r"^\s*[-*]\s*\[([^\]]*)\]\s*(.*)$", line)
            if not m:
                die(f"{origin}: checklist items look like '- [2.1] text'")
            items.append(f"<li><b>{m.group(1)}</b>{render_inline(m.group(2).strip())}</li>")
        return '<ol class="checklist">\n  ' + "\n  ".join(items) + "\n</ol>"

    inner = render_blocks(lines, origin)
    lab = f'<span class="lab">{render_inline(label)}</span>' if label else ""
    return f'<div class="{name}">{lab}' + "".join(inner) + "</div>"


def split_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def render_cell(tag, raw):
    """A cell may end with {.cls} to add a class. Purely numeric cells
    get .num on their own so columns of figures line up."""
    classes = []
    m = re.search(r"\{\.([\w\s.]+)\}\s*$", raw)
    if m:
        classes = m.group(1).replace(".", " ").split()
        raw = raw[:m.start()].strip()

    if any(c.isdigit() for c in raw) and all(c in NUMERIC_CHARS for c in raw):
        classes.insert(0, "num")

    attr = f' class="{" ".join(classes)}"' if classes else ""
    return f"<{tag}{attr}>{render_inline(raw)}</{tag}>"


def render_table(head, rows):
    thead = "".join(render_cell("th", c) for c in head)
    body = "\n      ".join(
        "<tr>" + "".join(render_cell("td", c) for c in row) + "</tr>" for row in rows)
    return ('<div class="tbl"><table>\n'
            f"    <thead><tr>{thead}</tr></thead>\n"
            f"    <tbody>\n      {body}\n    </tbody>\n"
            "  </table></div>")


# ------------------------------------------------------------- assembly

class Part:
    def __init__(self, path, index):
        self.path = path
        self.meta, body = split_front_matter(
            path.read_text(encoding="utf-8"), path.name)
        self.body = body
        self.index = index                       # 0 for the series index
        self.id = "index" if index == 0 else f"ch{index}"

    def get(self, key, *fallbacks, required=False):
        for k in (key,) + fallbacks:
            if self.meta.get(k):
                return self.meta[k]
        if required:
            die(f"{self.path.name}: front matter needs `{key}:`")
        return ""

    @property
    def title(self):
        return self.get("title", required=True)

    @property
    def index_title(self):
        """Heading used in the table of contents, where a longer, more
        explicit line has room."""
        return self.get("index_title", "title")

    @property
    def short(self):
        """Heading used in the previous/next links, which are narrow."""
        return self.get("short", "index_title", "title")


def byline(text):
    if not text:
        return ""
    bits = [b.strip() for b in text.split("·")]
    spans = "<span>·</span>".join(f"<span>{render_inline(b)}</span>" for b in bits)
    return f'<div class="byline">{spans}</div>'


def render_toc(parts):
    items = []
    for p in parts:
        items.append(
            f'<li><a href="#{p.id}"><span class="n">{p.index:02d}</span>'
            f'<span class="t">{render_inline(p.index_title)}</span>'
            f'<span class="d">{render_inline(p.get("summary"))}</span></a></li>')
    return '<ol class="toc">\n    ' + "\n    ".join(items) + "\n  </ol>"


def render_nav(part, parts):
    """Previous/next, with the series overview standing in at both ends."""
    k = part.index
    if k == 1:
        prev = ("#index", "Back to", "Series overview")
    else:
        p = parts[k - 2]
        prev = (f"#{p.id}", "Previous", p.short)

    if k == len(parts):
        nxt = ("#index", "Back to", "Series overview")
    else:
        p = parts[k]
        nxt = (f"#{p.id}", "Next", p.short)

    def link(target, label, text, cls=""):
        c = f' class="{cls}"' if cls else ""
        return f'<a{c} href="{target}"><small>{label}</small><span>{text}</span></a>'

    return ('<nav class="pn">' + link(*prev) + link(*nxt, cls="next") + "</nav>")


def render_page(part, parts, series):
    total = len(parts)
    if part.index == 0:
        tag, attrs = "section", ""
        data_part = f"Series · {total} parts"
        kicker = part.get("kicker")
    else:
        tag, attrs = "article", " hidden"
        data_part = f"Part {part.index} of {total}"
        kicker = f"Part {part.index} · {series}"

    head = [f'<p class="kicker">{render_inline(kicker)}</p>' if kicker else "",
            f"<h1>{render_inline(part.title)}</h1>",
            f'<p class="dek">{render_inline(part.get("dek"))}</p>' if part.get("dek") else "",
            byline(part.get("byline", "read"))]

    body = render_blocks(part.body.split("\n"), part.path.name)
    body = [b for b in body if b]

    # {{toc}} on its own line expands to the generated contents list.
    body = [render_toc(parts) if b.strip() in ("<p>{{toc}}</p>",) else b for b in body]

    if part.index:
        body.append(render_nav(part, parts))

    inner = "\n  ".join(b for b in head + body if b)
    return (f'<{tag} id="{part.id}" data-page data-part="{data_part}"{attrs}>\n'
            f"  {inner}\n"
            f"</{tag}>")


def build_series(directory, check=False):
    files = sorted(p for p in directory.glob("*.md") if not p.name.startswith("_")
                   and p.name.lower() != "readme.md")
    if not files:
        die(f"{directory}: no markdown files")

    index = Part(files[0], 0)
    parts = [Part(p, i) for i, p in enumerate(files[1:], start=1)]
    series = index.get("series", "title", required=True)

    pages = [render_page(index, parts, series)]
    pages += [render_page(p, parts, series) for p in parts]

    # `output:` is relative to the repo root, and must stay inside it —
    # a stray ../ in front matter should not be able to write anywhere on
    # the disk.
    out_rel = index.get("output", required=True)
    out_path = (ROOT / out_rel).resolve()
    if ROOT not in out_path.parents:
        die(f"{index.path.name}: output `{out_rel}` resolves outside the repo "
            f"({out_path})")

    banner = lambda p: f"<!-- {'=' * 12} {p.id.upper()} {'=' * 12} -->"
    body = "\n\n".join(f"{banner(p)}\n{page}"
                       for p, page in zip([index] + parts, pages))

    page = TEMPLATE.read_text(encoding="utf-8")
    for key, value in {
        "title": index.get("html_title", "title", required=True),
        "description": index.get("description"),
        "series": series,
        "parts_label": f"Series · {len(parts)} parts",
        "body": body,
    }.items():
        page = page.replace("{{" + key + "}}", value)

    left = re.findall(r"\{\{(\w+)\}\}", page)
    if left:
        die(f"{TEMPLATE.name}: no value for {', '.join('{{%s}}' % x for x in left)}")

    existing = out_path.read_text(encoding="utf-8") if out_path.exists() else None
    if check:
        state = "unchanged" if existing == page else "WOULD CHANGE"
        print(f"  {out_path.relative_to(ROOT)}  {state}  "
              f"({len(parts)} parts, {len(page):,} bytes)")
        return existing == page

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(page, encoding="utf-8")
    print(f"  {directory.relative_to(ROOT)} -> {out_path.relative_to(ROOT)}  "
          f"({len(parts)} parts, {len(page):,} bytes)")
    return True


def main(argv):
    check = "--check" in argv
    names = [a for a in argv if not a.startswith("-")]

    if not TEMPLATE.exists():
        die(f"missing template {TEMPLATE.relative_to(ROOT)}")

    dirs = ([POSTS / n for n in names] if names else
            sorted(d for d in POSTS.iterdir() if d.is_dir()))
    for d in dirs:
        if not d.is_dir():
            die(f"{d}: not a directory")

    print("build.py: checking" if check else "build.py: building")
    ok = all(build_series(d, check) for d in dirs)
    if check and not ok:
        sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1:])
