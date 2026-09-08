/* ------------------------------------------------------------------
   Dashboard rendering + the card-flip transition.

   Opening a project does a FLIP-style handoff: the clicked card's
   on-screen rectangle is measured, a 3D stage is placed exactly over
   it, and that stage then animates its geometry out to a wide modal
   while its inner layer rotates 180deg — the front face (a copy of the
   card) turns away and the back face (the detail panel) turns in.
   ------------------------------------------------------------------ */

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const CHEVRON =
  '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" ' +
  'stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

/* ------------------------------------------------------------- profile */

/* Employer name, preceded by its logo and linked out when a URL is set. */
function employerNode() {
  if (!PROFILE.employment) return null;

  const linked = Boolean(PROFILE.employmentUrl);
  const wrap = el(linked ? 'a' : 'span', 'employer');
  if (linked) {
    wrap.href = PROFILE.employmentUrl;
    wrap.target = '_blank';
    wrap.rel = 'noopener noreferrer';
  }

  if (PROFILE.employmentLogo) {
    const logo = el('img', 'employer-logo');
    logo.src = PROFILE.employmentLogo;
    logo.alt = '';                    // decorative: the name sits beside it
    wrap.appendChild(logo);
  }

  wrap.appendChild(el('span', null, PROFILE.employment));
  return wrap;
}

function renderProfile() {
  const host = document.getElementById('profile');

  /* The circle, plus — when a full-body shot is configured — a panel that
     pops out of it on hover. The wrapper is what's hovered, so it must
     shrink-wrap the circle rather than span the card. */
  const avatarWrap = el('div', 'avatar-wrap');

  const avatar = el('div', 'profile-avatar');
  const photo = el('img');
  photo.src = PROFILE.photo;
  photo.alt = '';                 // decorative: the name follows immediately
  avatar.appendChild(photo);
  avatarWrap.appendChild(avatar);

  if (PROFILE.photoFull) {
    avatarWrap.tabIndex = 0;      // so it opens on keyboard focus too
    avatarWrap.setAttribute('aria-label', `Full photo of ${PROFILE.name}`);

    const pop = el('div', 'avatar-pop');
    const full = el('img');
    full.src = PROFILE.photoFull;
    full.alt = `${PROFILE.name}, full-length portrait`;
    full.loading = 'lazy';
    pop.appendChild(full);
    avatarWrap.appendChild(pop);
  }

  host.appendChild(avatarWrap);
  host.appendChild(el('h1', 'profile-name', PROFILE.name));
  host.appendChild(el('p', 'profile-headline', PROFILE.headline));

  const meta = el('ul', 'profile-meta');

  /* A row value may be a plain string or a prebuilt node. */
  const addRow = (label, value) => {
    if (!value) return;                     // skip fields left blank
    const li = el('li');
    li.appendChild(el('span', 'k', label));
    const v = el('span', 'v');
    if (typeof value === 'string') v.textContent = value;
    else v.appendChild(value);
    li.appendChild(v);
    meta.appendChild(li);
  };

  addRow('Employment', employerNode());
  addRow('Education', PROFILE.education);
  addRow('Focus', PROFILE.focus);
  addRow('Current', PROFILE.current);
  addRow('Location', PROFILE.location);
  addRow('Email', PROFILE.email);

  host.appendChild(meta);

  if (PROFILE.about) host.appendChild(el('p', 'profile-about', PROFILE.about));

  host.appendChild(el('div', 'profile-section-label', 'Skills'));
  const chips = el('div', 'chip-row');
  PROFILE.skills.forEach((s) => chips.appendChild(el('span', 'chip', s)));
  host.appendChild(chips);

  const links = el('div', 'profile-links');
  PROFILE.links.forEach((l) => {
    const a = el('a', 'profile-link', l.label);
    a.href = l.href;
    if (l.href.startsWith('http')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    links.appendChild(a);
  });
  host.appendChild(links);
}

function renderStats() {
  const host = document.getElementById('stats');
  STATS.forEach((s) => {
    const tile = el('div', 'stat-tile');
    tile.appendChild(el('div', 'stat-value', s.value));
    tile.appendChild(el('div', 'stat-label', s.label));
    host.appendChild(tile);
  });
}

/* --------------------------------------------------------------- cards */

/* The visual contents of a card. Rendered twice: once in the grid and
   once as the flip stage's front face, so the handoff is seamless. */
function cardFace(project) {
  const frag = document.createDocumentFragment();

  const media = el('div', 'card-media');
  if (project.preview) {
    const img = el('img');
    img.src = project.preview;
    img.alt = '';
    img.loading = 'lazy';
    media.appendChild(img);
  } else if (project.previewCode) {
    media.appendChild(el('pre', 'card-codeview', project.previewCode));
  }
  media.appendChild(el('div', 'card-scrim'));
  frag.appendChild(media);

  const body = el('div', 'card-body');

  const top = el('div', 'card-top');
  top.appendChild(el('span', 'card-kind', project.type.split('(')[0].trim()));
  top.appendChild(el('span', 'card-year', project.year));
  body.appendChild(top);

  const bottom = el('div');
  const title = el('span', 'card-title');   // phrasing content: the card is a <button>
  title.appendChild(document.createTextNode(project.short));
  title.insertAdjacentHTML('beforeend', CHEVRON);
  bottom.appendChild(title);

  const tech = el('div', 'card-tech');
  project.techStack.forEach((t) => tech.appendChild(el('span', null, t)));
  bottom.appendChild(tech);

  body.appendChild(bottom);
  frag.appendChild(body);

  return frag;
}

function projectCard(p) {
  const card = el('button', 'card');
  card.type = 'button';
  card.dataset.id = p.id;
  card.setAttribute('aria-label', `Open project: ${p.title}`);
  card.appendChild(cardFace(p));
  card.addEventListener('click', () => openProject(p, card));
  return card;
}

/* ------------------------------------------------------------ timeline */

/* A project is filed under the year it STARTED, taken from the first
   year in its timeline string — so 'Dec 2019 – Feb 2020' lands on 2019,
   which is what makes 2019 the start of the run. */
function startYear(p) {
  const m = p.timeline && p.timeline.match(/\b(?:19|20)\d{2}\b/);
  return m ? Number(m[0]) : Number(p.year);
}

function renderTimeline() {
  const scroller = document.getElementById('timeline');

  const byYear = new Map();
  PROJECTS.forEach((p) => {
    const y = startYear(p);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(p);
  });

  const years = Array.from(byYear.keys());
  const oldest = Math.min(TIMELINE_START, ...years);
  const newest = Math.max(new Date().getFullYear(), ...years);

  const list = el('ol', 'tl-list');

  // Newest first, so scrolling down travels back in time.
  for (let y = newest; y >= oldest; y--) {
    const projects = byYear.get(y) || [];
    const row = el('li', 'tl-row' + (projects.length ? '' : ' is-empty'));

    const rail = el('div', 'tl-rail');
    rail.appendChild(el('span', 'tl-dot'));
    row.appendChild(rail);

    const content = el('div', 'tl-content');
    const head = el('div', 'tl-year');
    head.appendChild(el('span', 'tl-year-num', String(y)));
    if (projects.length) {
      head.appendChild(
        el('span', 'tl-year-count',
           `${projects.length} project${projects.length > 1 ? 's' : ''}`)
      );
    }
    content.appendChild(head);

    if (projects.length) {
      const cards = el('div', 'tl-cards');
      projects.forEach((p) => cards.appendChild(projectCard(p)));
      content.appendChild(cards);
    }

    row.appendChild(content);
    list.appendChild(row);
  }

  scroller.appendChild(list);
}

/* Frame the timeline inside the viewport: it gets whatever vertical room
   is left below it, and scrolls internally rather than growing the page. */
function fitTimeline() {
  const scroller = document.getElementById('timeline');
  const frame = document.getElementById('timelineFrame');
  const foot = document.querySelector('.foot');

  // Offset from the top of the DOCUMENT, so the result does not change as
  // the page itself is scrolled (measuring rect.top alone would feed back
  // on itself and the box would grow every time you scrolled).
  const docTop = frame.getBoundingClientRect().top + window.scrollY;
  const reserve = (foot ? foot.offsetHeight + 34 : 0) + 28;

  const h = window.innerHeight - docTop - reserve;
  scroller.style.height = Math.max(360, Math.round(h)) + 'px';
  markTimelineEnds();
}

/* Fade hints at the edges, hidden once you reach that end. */
function markTimelineEnds() {
  const scroller = document.getElementById('timeline');
  const frame = document.getElementById('timelineFrame');
  const max = scroller.scrollHeight - scroller.clientHeight;
  frame.classList.toggle('at-top', scroller.scrollTop <= 2);
  frame.classList.toggle('at-end', scroller.scrollTop >= max - 2);
}

/* -------------------------------------------------------------- detail */

function galleryBlock(gallery) {
  const group = el('div', 'shot-group');

  const head = el('div', 'shot-group-head');
  head.appendChild(el('h4', null, gallery.title));
  head.appendChild(
    el('span', 'count', `${gallery.images.length} image${gallery.images.length > 1 ? 's' : ''}`)
  );
  group.appendChild(head);

  const grid = el('div', 'shot-grid' + (gallery.tall ? ' is-tall' : ''));
  gallery.images.forEach((src, i) => {
    const btn = el('button', 'shot');
    btn.type = 'button';
    btn.setAttribute('aria-label', `${gallery.title} — enlarge image ${i + 1}`);
    const img = el('img');
    img.src = src;
    img.alt = `${gallery.title} — ${i + 1}`;
    img.loading = 'lazy';
    btn.appendChild(img);
    btn.addEventListener('click', () => openLightbox(src, img.alt));
    grid.appendChild(btn);
  });
  group.appendChild(grid);

  return group;
}

function block(label, node) {
  const b = el('div', 'detail-block');
  b.appendChild(el('div', 'detail-label', label));
  b.appendChild(node);
  return b;
}

function bulletList(items) {
  const ul = el('ul', 'detail-list');
  items.forEach((t) => ul.appendChild(el('li', null, t)));
  return ul;
}

function renderDetail(project) {
  const root = el('div', 'flip-face flip-back');

  /* ---- header ---- */
  const head = el('div', 'detail-head');
  head.appendChild(el('div', 'detail-head-bg'));

  const eyebrow = el('div', 'detail-eyebrow');
  [project.type, project.timeline, project.role].filter(Boolean).forEach((t, i) => {
    if (i) eyebrow.appendChild(el('span', 'dot', '•'));
    eyebrow.appendChild(el('span', null, t));
  });
  head.appendChild(eyebrow);
  head.appendChild(el('h2', 'detail-title', project.title));

  const close = el('button', 'detail-close', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close project');
  close.addEventListener('click', closeProject);
  head.appendChild(close);

  root.appendChild(head);

  /* ---- body ---- */
  const scroll = el('div', 'detail-scroll');

  scroll.appendChild(block('Overview', bulletList(project.description)));

  if (project.performance) {
    const grid = el('div', 'metric-grid');
    project.performance.forEach((p) => {
      const c = el('div', 'metric-card');
      c.appendChild(el('h4', null, p.title));
      const ul = el('ul');
      p.metrics.forEach((m) => ul.appendChild(el('li', null, m)));
      c.appendChild(ul);
      grid.appendChild(c);
    });
    scroll.appendChild(block('Results', grid));
  }

  if (project.achievements) {
    const grid = el('div', 'metric-grid');
    const c = el('div', 'metric-card');
    c.appendChild(el('h4', null, 'Impact'));
    const ul = el('ul');
    project.achievements.forEach((m) => ul.appendChild(el('li', null, m)));
    c.appendChild(ul);
    grid.appendChild(c);
    scroll.appendChild(block('Achievements', grid));
  }

  if (project.galleries) {
    const wrap = el('div');
    project.galleries.forEach((g) => wrap.appendChild(galleryBlock(g)));
    scroll.appendChild(block('Screens & results', wrap));
  }

  if (project.simulator) {
    const shell = el('div', 'sim-shell dbms-simulator');
    shell.appendChild(
      document.getElementById('tpl-dbms-simulator').content.cloneNode(true)
    );
    scroll.appendChild(block('Interactive demo', shell));
  }

  const tech = el('div', 'detail-tech');
  project.techStack.forEach((t) => tech.appendChild(el('span', null, t)));
  scroll.appendChild(block('Tech stack', tech));

  if (project.cta) {
    const a = el('a', 'detail-cta', project.cta.label);
    a.href = project.cta.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    const b = el('div', 'detail-block');
    b.appendChild(a);
    scroll.appendChild(b);
  }

  root.appendChild(scroll);
  return root;
}

/* --------------------------------------------------- flip transition */

const stage = document.getElementById('flipStage');
const scrim = document.getElementById('scrim');

let openCard = null;      // the grid card currently hidden behind the stage
let openState = 'closed'; // closed | opening | open | closing

/* Where the expanded panel should land: a wide, centred rectangle. */
function targetRect() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(1120, vw - 48);
  const h = Math.min(880, vh - 56);
  return {
    left: Math.round((vw - w) / 2),
    top: Math.round((vh - h) / 2),
    width: Math.round(w),
    height: Math.round(h),
  };
}

function applyRect(r) {
  stage.style.left = r.left + 'px';
  stage.style.top = r.top + 'px';
  stage.style.width = r.width + 'px';
  stage.style.height = r.height + 'px';
}

function openProject(project, card) {
  if (openState !== 'closed') return;
  openState = 'opening';
  openCard = card;

  const r = card.getBoundingClientRect();

  // Front face = a copy of the card, so the flip starts from what the
  // user just clicked.
  const front = el('div', 'flip-face flip-front');
  front.appendChild(cardFace(project));

  stage.innerHTML = '';
  const inner = el('div', 'flip-inner');
  inner.appendChild(front);
  inner.appendChild(renderDetail(project));
  stage.appendChild(inner);

  stage.hidden = false;
  stage.classList.remove('is-open', 'is-settled');
  applyRect({ left: r.left, top: r.top, width: r.width, height: r.height });

  scrim.hidden = false;
  card.classList.add('is-flipping');
  document.body.classList.add('is-locked');

  // Commit the start geometry before animating to the target.
  void stage.offsetWidth;

  requestAnimationFrame(() => {
    scrim.classList.add('is-shown');
    stage.classList.add('is-open');
    applyRect(targetRect());
  });

  const settle = () => {
    openState = 'open';
    stage.classList.add('is-settled');
    if (project.simulator && typeof initDbmsSimulator === 'function') {
      initDbmsSimulator();
    }
    const closeBtn = stage.querySelector('.detail-close');
    if (closeBtn) closeBtn.focus();
  };

  stage.addEventListener('transitionend', function once(e) {
    if (e.target !== stage || e.propertyName !== 'height') return;
    stage.removeEventListener('transitionend', once);
    settle();
  });
  // Safety net if the transition never fires (reduced motion, hidden tab).
  setTimeout(() => { if (openState === 'opening') settle(); }, 900);
}

function closeProject() {
  if (openState !== 'open' && openState !== 'opening') return;
  openState = 'closing';

  closeLightbox();
  stage.classList.remove('is-open', 'is-settled');
  scrim.classList.remove('is-shown');

  const r = openCard.getBoundingClientRect();
  applyRect({ left: r.left, top: r.top, width: r.width, height: r.height });

  const done = () => {
    stage.hidden = true;
    scrim.hidden = true;
    stage.innerHTML = '';
    document.body.classList.remove('is-locked');
    if (openCard) {
      openCard.classList.remove('is-flipping');
      openCard.focus();
      openCard = null;
    }
    openState = 'closed';
  };

  stage.addEventListener('transitionend', function once(e) {
    if (e.target !== stage || e.propertyName !== 'height') return;
    stage.removeEventListener('transitionend', once);
    done();
  });
  setTimeout(() => { if (openState === 'closing') done(); }, 900);
}

scrim.addEventListener('click', closeProject);

window.addEventListener('resize', () => {
  if (openState === 'open') applyRect(targetRect());
});

/* ------------------------------------------------------------ lightbox */

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.hidden = false;
  void lightbox.offsetWidth;
  lightbox.classList.add('is-shown');
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.classList.remove('is-shown');
  lightbox.hidden = true;
  lightboxImg.src = '';
}

lightbox.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!lightbox.hidden) closeLightbox();
  else closeProject();
});

/* ---------------------------------------------------------------- boot */

renderProfile();
renderStats();
renderTimeline();

fitTimeline();
window.addEventListener('resize', fitTimeline);
document.getElementById('timeline').addEventListener('scroll', markTimelineEnds, { passive: true });
// Poppins loading changes text metrics, which changes the offset above.
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTimeline);
