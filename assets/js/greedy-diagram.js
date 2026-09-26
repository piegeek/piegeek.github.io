/* ------------------------------------------------------------------
   Greedy Key Strategy — interactive block diagram.

   Every box's explanation is pre-generated and stored in
   /greedy-key-strategy/strategy.json, so opening a box is a lookup in
   an already-loaded object: no model call happens at view time. The
   JSON is fetched once per page load and cached here.

   Layout mirrors the reference diagram: a two-box stem, a four-way fan,
   then one lane per output shape. The lane captions are rendered as
   captions rather than boxes, so the only things that look clickable
   are the eleven that are.
   ------------------------------------------------------------------ */

const GK_SRC = '/greedy-key-strategy/strategy.json';

let gkData = null;        // parsed JSON, cached across opens
let gkPending = null;     // in-flight fetch, so re-opens don't refetch
let gkActive = null;      // { root, boxes, sheet, index } while mounted

function gkEl(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function gkLoad() {
  if (gkData) return Promise.resolve(gkData);
  if (!gkPending) {
    gkPending = fetch(GK_SRC)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((d) => { gkData = d; return d; })
      .catch((err) => { gkPending = null; throw err; });
  }
  return gkPending;
}

/* ------------------------------------------------------------- build */

function gkBox(box, onOpen) {
  const b = gkEl('button', 'gk-box');
  b.type = 'button';
  b.dataset.id = box.id;
  b.setAttribute('aria-label', `${box.label} — read the explanation`);
  b.setAttribute('aria-haspopup', 'dialog');
  b.appendChild(gkEl('span', 'gk-box-label', box.label));
  if (box.sublabel) b.appendChild(gkEl('span', 'gk-box-sub', box.sublabel));
  b.addEventListener('click', () => onOpen(box.id));
  return b;
}

function gkLink() {
  return gkEl('div', 'gk-link');
}

function gkBuildDiagram(data, onOpen) {
  const wrap = gkEl('div', 'gk-diagram');
  const inLane = (id) => data.boxes.filter((b) => b.lane === id);

  /* ---- stem: identify the key -> output shape ---- */
  const stem = gkEl('div', 'gk-stem');
  inLane('stem').forEach((box, i) => {
    if (i) stem.appendChild(gkLink());
    stem.appendChild(gkBox(box, onOpen));
  });
  wrap.appendChild(stem);

  /* ---- the four-way fan ---- */
  const lanes = data.lanes.filter((l) => l.id !== 'stem');
  const fan = gkEl('div', 'gk-fan');
  fan.appendChild(gkEl('div', 'gk-fan-bar'));
  lanes.forEach(() => fan.appendChild(gkEl('div', 'gk-tick')));
  wrap.appendChild(fan);

  /* ---- one column per output shape ---- */
  const cols = gkEl('div', 'gk-lanes');
  lanes.forEach((lane) => {
    const col = gkEl('div', 'gk-lane');

    const cap = gkEl('div', 'gk-lane-label');
    cap.appendChild(gkEl('span', null, lane.label));
    if (lane.note) cap.appendChild(gkEl('span', 'gk-lane-note', lane.note));
    col.appendChild(cap);

    inLane(lane.id).forEach((box, i) => {
      if (i) col.appendChild(gkLink());
      col.appendChild(gkBox(box, onOpen));
    });

    cols.appendChild(col);
  });
  wrap.appendChild(cols);

  return wrap;
}

function gkBuildNotes(data) {
  const notes = gkEl('div', 'gk-notes');
  notes.appendChild(gkEl('div', 'gk-notes-title', 'Gates & reroutes'));
  const ul = gkEl('ul');
  (data.notes || []).forEach((t) => ul.appendChild(gkEl('li', null, t)));
  notes.appendChild(ul);
  return notes;
}

/* Copyright, link and license, rendered inside the panel itself so that a
   screenshot of the diagram or of an open sheet carries the attribution
   with it. Returns null if the JSON has no attribution fields. */
function gkCredit(meta, cls) {
  if (!meta || !meta.copyright) return null;
  const c = gkEl('div', cls);
  const bits = [meta.copyright];
  if (meta.url) bits.push(meta.url.replace(/^https?:\/\//, ''));
  c.appendChild(document.createTextNode(bits.join(' · ')));
  if (meta.license) {
    c.appendChild(document.createTextNode(' · '));
    const a = gkEl('a', null, meta.license);
    if (meta.licenseUrl) {
      a.href = meta.licenseUrl;
      a.target = '_blank';
      a.rel = 'license noopener noreferrer';
    }
    c.appendChild(a);
  }
  return c;
}

/* ------------------------------------------------------- explain sheet */

function gkRenderSheetBody(box, host) {
  host.innerHTML = '';

  if (box.summary) host.appendChild(gkEl('p', 'gk-summary', box.summary));

  (box.sections || []).forEach((s) => {
    const sec = gkEl('div', 'gk-section');
    if (s.heading) sec.appendChild(gkEl('h5', null, s.heading));
    (s.paras || []).forEach((p) => sec.appendChild(gkEl('p', null, p)));
    if (s.list && s.list.length) {
      const ul = gkEl('ul');
      s.list.forEach((t) => ul.appendChild(gkEl('li', null, t)));
      sec.appendChild(ul);
    }
    host.appendChild(sec);
  });

  if (box.watch && box.watch.length) {
    const w = gkEl('div', 'gk-watch');
    w.appendChild(gkEl('h5', null, 'Watch out'));
    const ul = gkEl('ul');
    box.watch.forEach((t) => ul.appendChild(gkEl('li', null, t)));
    w.appendChild(ul);
    host.appendChild(w);
  }

  if (box.source) {
    const src = gkEl('div', 'gk-source');
    src.appendChild(gkEl('strong', null, 'From the framework: '));
    src.appendChild(document.createTextNode(box.source));
    host.appendChild(src);
  }
}

function gkOpenSheet(id) {
  const s = gkActive;
  if (!s) return;

  const i = s.boxes.findIndex((b) => b.id === id);
  if (i < 0) return;
  const box = s.boxes[i];
  s.index = i;

  s.root.querySelectorAll('.gk-box').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.id === id);
  });

  s.eyebrow.innerHTML = '';
  s.eyebrow.appendChild(gkEl('span', null, box.step || ''));
  s.eyebrow.appendChild(gkEl('span', 'gk-of', `Box ${i + 1} of ${s.boxes.length}`));

  s.title.textContent = box.label;
  s.formula.textContent = box.sublabel || '';
  s.formula.hidden = !box.sublabel;

  gkRenderSheetBody(box, s.body);
  s.body.scrollTop = 0;

  s.prev.disabled = i === 0;
  s.next.disabled = i === s.boxes.length - 1;
  s.counter.textContent = `${i + 1} / ${s.boxes.length}`;

  s.scrim.hidden = false;
  s.sheet.hidden = false;
  void s.sheet.offsetWidth;               // commit before transitioning in
  s.scrim.classList.add('is-shown');
  s.sheet.classList.add('is-shown');

  // The sheet is capped in height, so bringing its top into view puts
  // the whole thing on screen inside the modal's scroller.
  s.root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  s.close.focus();
}

/* Returns true when it actually closed something, so the page-level
   Escape handler knows the keypress was consumed here. */
function closeGreedySheet() {
  const s = gkActive;
  if (!s || s.sheet.hidden) return false;

  s.sheet.classList.remove('is-shown');
  s.sheet.hidden = true;
  s.scrim.classList.remove('is-shown');
  s.scrim.hidden = true;

  const open = s.root.querySelector('.gk-box.is-active');
  s.root.querySelectorAll('.gk-box').forEach((b) => b.classList.remove('is-active'));
  if (open) open.focus();
  return true;
}

function gkBuildSheet(meta) {
  const scrim = gkEl('div', 'gk-scrim');
  scrim.hidden = true;
  scrim.addEventListener('click', closeGreedySheet);

  const sheet = gkEl('div', 'gk-sheet');
  sheet.hidden = true;
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'false');
  sheet.setAttribute('aria-label', 'Step explanation');

  const head = gkEl('div', 'gk-sheet-head');
  const eyebrow = gkEl('div', 'gk-eyebrow');
  const title = gkEl('h4');
  const formula = gkEl('p', 'gk-formula');
  const close = gkEl('button', 'gk-sheet-close', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close explanation');
  close.addEventListener('click', closeGreedySheet);
  head.appendChild(eyebrow);
  head.appendChild(title);
  head.appendChild(formula);
  head.appendChild(close);

  const body = gkEl('div', 'gk-sheet-body');

  const foot = gkEl('div', 'gk-sheet-foot');
  const prev = gkEl('button', 'gk-nav', '←  Previous');
  const next = gkEl('button', 'gk-nav', 'Next  →');
  prev.type = next.type = 'button';
  const counter = gkEl('span', 'gk-counter');
  foot.appendChild(prev);
  foot.appendChild(next);
  foot.appendChild(gkEl('span', 'gk-foot-spacer'));
  const credit = gkCredit(meta, 'gk-foot-credit');
  if (credit) foot.appendChild(credit);
  foot.appendChild(counter);

  sheet.appendChild(head);
  sheet.appendChild(body);
  sheet.appendChild(foot);

  return { scrim, sheet, eyebrow, title, formula, close, body, prev, next, counter };
}

/* --------------------------------------------------------------- mount */

/* Called once the detail modal has settled. `host` is the .gk element
   that app.js put in the panel. */
function initGreedyDiagram(host) {
  if (!host || host.dataset.ready === '1') return;
  host.dataset.ready = '1';
  host.textContent = 'Loading the strategy…';

  gkLoad()
    .then((data) => {
      host.innerHTML = '';

      const head = gkEl('div', 'gk-head');
      head.appendChild(gkEl('h3', null, data.meta.title));
      if (data.meta.subtitle) head.appendChild(gkEl('p', 'gk-sub', data.meta.subtitle));
      if (data.meta.intro) head.appendChild(gkEl('p', 'gk-intro', data.meta.intro));
      head.appendChild(gkEl('span', 'gk-hint', 'Click any box'));
      host.appendChild(head);

      const parts = gkBuildSheet(data.meta);
      gkActive = {
        root: host,
        boxes: data.boxes,
        index: 0,
        scrim: parts.scrim,
        sheet: parts.sheet,
        eyebrow: parts.eyebrow,
        title: parts.title,
        formula: parts.formula,
        close: parts.close,
        body: parts.body,
        prev: parts.prev,
        next: parts.next,
        counter: parts.counter,
      };

      parts.prev.addEventListener('click', () => {
        if (gkActive.index > 0) gkOpenSheet(gkActive.boxes[gkActive.index - 1].id);
      });
      parts.next.addEventListener('click', () => {
        if (gkActive.index < gkActive.boxes.length - 1) {
          gkOpenSheet(gkActive.boxes[gkActive.index + 1].id);
        }
      });

      host.appendChild(gkBuildDiagram(data, gkOpenSheet));
      host.appendChild(gkBuildNotes(data));
      if (data.meta.standing) {
        host.appendChild(gkEl('div', 'gk-standing', data.meta.standing));
      }
      const credit = gkCredit(data.meta, 'gk-credit');
      if (credit) host.appendChild(credit);
      host.appendChild(parts.scrim);
      host.appendChild(parts.sheet);
    })
    .catch((err) => {
      host.dataset.ready = '';       // let a later open retry
      host.innerHTML = '';
      const box = gkEl('div', 'gk-error');
      box.appendChild(gkEl('strong', null, 'Could not load the strategy data. '));
      box.appendChild(
        document.createTextNode(
          `Expected ${GK_SRC} (${err.message}). Note that fetch is blocked on ` +
          'file:// — serve the site over HTTP to view this locally.'
        )
      );
      host.appendChild(box);
    });
}
