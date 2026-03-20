'use strict';

/* =========================================================
   Loader (fetch lesson + svg)
========================================================= */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

async function loadText(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

function safeGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
function safeSet(key, val) { try { window.localStorage.setItem(key, val); } catch (e) {} }

/* =========================================================
   Utilities
========================================================= */
function escapeHTML(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeAttr(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function uniq(arr) { return [...new Set(arr)]; }

const STOPWORDS = new Set([
  'the','a','an','and','or','to','of','in','on','are','is','be','that','then','therefore','moreover',
  'through','both','directions','equal','equals','triangle','triangles','parallelogram','parallelograms'
]);
function tokenize(s) {
  return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => w.length > 1 && !STOPWORDS.has(w));
}
function jaccard(aTokens, bTokens) {
  const A = new Set(aTokens), B = new Set(bTokens);
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

/* =========================================================
   Engine globals (filled at boot)
========================================================= */
let LESSON = null;

/* =========================================================
   Diagram Module
========================================================= */
const Diagram = (() => {
  const cache = new Map();
  const get = (id) => {
    if (cache.has(id)) return cache.get(id);
    const el = document.getElementById(id);
    if (el) cache.set(id, el);
    return el || null;
  };

  function applyAnimation(el) {
    if (!el) return;
    const wantsFade = el.classList.contains('no-draw');
    const tag = el.tagName.toLowerCase();
    const isDrawable = (tag === 'line' || tag === 'path' || tag === 'polygon');
    const isDashed = !!el.getAttribute('stroke-dasharray');

    if (!wantsFade && isDrawable && !isDashed) {
      el.classList.add('draw-solid'); setTimeout(() => el.classList.remove('draw-solid'), 900);
    } else {
      el.classList.add('fade-in'); setTimeout(() => el.classList.remove('fade-in'), 250);
    }
  }

  function showMany(ids) {
    const els = ids.map(get).filter(Boolean);
    els.forEach(el => { el.classList.remove('hidden'); el.setAttribute('aria-hidden','false'); });
    requestAnimationFrame(() => els.forEach(applyAnimation));
  }

  function addClass(id, ...klasses) { get(id)?.classList.add(...klasses); }
  function removeClass(id, ...klasses) { get(id)?.classList.remove(...klasses); }

  function removeTriangleHatch(name) { document.getElementById(`tri${name}fill`)?.remove(); }

  function addTriangleHatch(name) {
    const id = `tri${name}fill`;
    if (document.getElementById(id)) return;

    const points = LESSON?.hatch?.[name];
    if (!points) return;

    const poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    poly.setAttribute('id', id);
    poly.classList.add('focus-keep');
    poly.setAttribute('fill','url(#hatch)');
    poly.setAttribute('opacity','0.25');
    poly.setAttribute('points', points);

    get('diagram')?.insertBefore(poly, get('labels'));
  }

  function clearHighlights() {
    const svg = get('diagram');
    svg?.querySelectorAll('.highlight, .hl-strong, .hl-parallelogram, .hl-tri, .hover-hl')
      .forEach(el => el.classList.remove('highlight','hl-strong','hl-parallelogram','hl-tri','hover-hl'));

    // ✅ EDIT: remove ALL triangle hatch polygons, not just hard-coded names.
    // This fixes "green colored-in parts" sticking between steps.
    document.querySelectorAll('polygon[id^="tri"][id$="fill"]').forEach(el => el.remove());

    const stamp = document.getElementById('qed-stamp');
    if (stamp) { stamp.classList.add('hidden'); stamp.classList.remove('stamp-drop'); stamp.setAttribute('aria-hidden','true'); }
  }

  function resetVisibility() {
    (LESSON?.diagram?.initialHidden || []).forEach(id => {
      const el = get(id);
      if (el) { el.classList.add('hidden'); el.setAttribute('aria-hidden','true'); }
    });
    clearHighlights();
  }

  return { get, showMany, addClass, removeClass, clearHighlights, resetVisibility, addTriangleHatch, removeTriangleHatch };
})();

/* =========================================================
   Explore Mode (generic; per-lesson update function)
========================================================= */
const Explore = (() => {
  let enabled = false;
  let dragKey = null;
  let P = {}; // {A:{x,y}, D:{x,y}, ...}

  function initFromLesson() {
    P = {};
    const handles = LESSON?.explore?.handles || {};
    for (const key of Object.keys(handles)) {
      const h = handles[key];
      const el = Diagram.get(h.handleId);
      const x = parseFloat(el?.getAttribute('cx') ?? '0');
      const y = parseFloat(el?.getAttribute('cy') ?? '0');
      P[key] = { x, y };
    }
  }

  function setEnabled(on) {
    enabled = !!on;
    const groupId = LESSON?.explore?.handlesGroupId || 'explore-handles';
    const g = Diagram.get(groupId);
    if (g) {
      g.classList.toggle('hidden', !enabled);
      g.setAttribute('aria-hidden', enabled ? 'false' : 'true');
    }
    if (enabled) update();
  }

  function pointerToSvgPoint(evt) {
    const svg = Diagram.get('diagram');
    if (!svg) return {x:0,y:0};
    const ctm = svg.getScreenCTM();
    if (!ctm) return {x:0,y:0};
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const sp = pt.matrixTransform(ctm.inverse());
    return { x: sp.x, y: sp.y };
  }

  function startDrag(key, evt) {
    if (!enabled) return;
    dragKey = key;
    evt.preventDefault();
    evt.target.setPointerCapture?.(evt.pointerId);
  }
  function stopDrag() { dragKey = null; }

  function onMove(evt) {
    if (!enabled || !dragKey) return;
    evt.preventDefault();

    const {x,y} = pointerToSvgPoint(evt);
    const h = LESSON.explore.handles[dragKey];

    const clampX = h.clampX || [-Infinity, Infinity];
    const clampY = h.clampY || [-Infinity, Infinity];

    P[dragKey].x = clamp(x, clampX[0], clampX[1]);
    P[dragKey].y = clamp(y, clampY[0], clampY[1]);

    update();
  }

  function update() {
    if (!enabled) return;

    // Keep handles positioned
    const handles = LESSON?.explore?.handles || {};
    for (const key of Object.keys(handles)) {
      const h = handles[key];
      for (const id of [h.handleId, h.ringId].filter(Boolean)) {
        Diagram.get(id)?.setAttribute('cx', P[key].x);
        Diagram.get(id)?.setAttribute('cy', P[key].y);
      }
    }

    // Let the lesson update the actual diagram
    LESSON?.explore?.onUpdate?.(P, Diagram);
  }

  function resetPositions() {
    initFromLesson();
    update();
  }

  function bind() {
    initFromLesson();
    const handles = LESSON?.explore?.handles || {};
    for (const key of Object.keys(handles)) {
      const el = Diagram.get(handles[key].handleId);
      el?.addEventListener('pointerdown', (e) => startDrag(key, e));
    }
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    window.addEventListener('pointermove', onMove, { passive: false });
  }

  return { bind, setEnabled, isEnabled: () => enabled, update, resetPositions };
})();

/* =========================================================
   Rendering + practice helpers
========================================================= */
function renderStatement(parts) {
  return parts.map(p => {
    if (p.ref) {
      const targets = escapeAttr(p.ref.join(','));
      return `<span class="geom-ref" data-target="${targets}">${escapeHTML(p.t)}</span>`;
    }
    if (p.strong) return `<strong>${escapeHTML(p.t)}</strong>`;
    return escapeHTML(p.t);
  }).join('');
}
function statementPlainText(parts) { return parts.map(p => p.t).join(''); }
function collectRefsFromParts(parts) {
  const ids = [];
  for (const p of parts) if (p.ref) ids.push(...p.ref);
  return uniq(ids);
}

function validateLesson(lesson) {
  const svg = document.getElementById('diagram');
  if (!svg) return;

  const svgIds = new Set([...svg.querySelectorAll('[id]')].map(el => el.id));
  const referenced = [];
  const errors = [];

  const allowedModes = new Set(['strong','para','tri']);
  const allowedKinds = new Set(['given','det','constr','def','prop','thus']);

  lesson.steps.forEach((st, i) => {
    if (!st.statementParts || !Array.isArray(st.statementParts)) errors.push(`Step ${i}: missing statementParts[]`);
    if (!st.reason || typeof st.reason.label !== 'string') errors.push(`Step ${i}: missing reason.label`);
    if (!st.reason || typeof st.reason.kind !== 'string') errors.push(`Step ${i}: missing reason.kind`);
    if (st.reason?.kind && !allowedKinds.has(st.reason.kind)) errors.push(`Step ${i}: unknown reason.kind "${st.reason.kind}"`);

    (st.reveal || []).forEach(id => referenced.push({i, where:'reveal', id}));
    (st.focusKeep || []).forEach(id => referenced.push({i, where:'focusKeep', id}));
    (st.highlight || []).forEach(h => {
      if (!h || typeof h.id !== 'string') errors.push(`Step ${i}: highlight item missing id`);
      if (h?.mode && !allowedModes.has(h.mode)) errors.push(`Step ${i}: highlight mode "${h.mode}" not allowed`);
      if (h?.id) referenced.push({i, where:'highlight', id:h.id});
    });
    collectRefsFromParts(st.statementParts || []).forEach(id => referenced.push({i, where:'statementParts.ref', id}));

    if (st.mcq) {
      const c = st.mcq.choices || [];
      if (!Array.isArray(c) || c.length === 0) errors.push(`Step ${i}: mcq.choices missing/empty`);
      if (typeof st.mcq.correctIndex !== 'number' || st.mcq.correctIndex < 0 || st.mcq.correctIndex >= c.length) {
        errors.push(`Step ${i}: mcq.correctIndex out of bounds`);
      }
    }
  });

  const missing = referenced.filter(x => !svgIds.has(x.id));
  if (missing.length) console.warn('[Lesson validation] Missing SVG IDs referenced:', missing);
  if (errors.length) console.warn('[Lesson validation] Lesson schema issues:', errors);
}

function buildPools(lesson) {
  const steps = lesson.steps;
  const statementTexts = steps.map(s => statementPlainText(s.statementParts));
  const statementTokens = statementTexts.map(t => tokenize(t));

  const reasonLabels = steps.map(s => s.reason.label);
  const reasonsUnique = uniq(reasonLabels);
  const reasonsByKind = {};
  steps.forEach(s => {
    const k = s.reason.kind || 'other';
    reasonsByKind[k] = reasonsByKind[k] || new Set();
    reasonsByKind[k].add(s.reason.label);
  });
  return { statementTexts, statementTokens, reasonsUnique, reasonsByKind };
}

function statementChoicesForStep(i, pools, count, rand) {
  const targetTok = pools.statementTokens[i];
  const scored = [];
  for (let j = 0; j < pools.statementTokens.length; j++) {
    if (j === i) continue;
    const sim = jaccard(targetTok, pools.statementTokens[j]);
    scored.push({ j, score: sim });
  }
  scored.sort((a,b) => b.score - a.score);
  const distractors = scored.slice(0, Math.max(0, count - 1)).map(x => x.j);
  while (distractors.length < count - 1) {
    const j = Math.floor(rand() * pools.statementTexts.length);
    if (j !== i && !distractors.includes(j)) distractors.push(j);
  }
  return shuffle([i, ...distractors], rand);
}

function reasonChoicesForStep(i, lesson, pools, count, rand) {
  const correct = lesson.steps[i].reason.label;
  const kind = lesson.steps[i].reason.kind || 'other';
  const sameKind = pools.reasonsByKind[kind] ? [...pools.reasonsByKind[kind]] : [];
  const candidates = shuffle(sameKind.filter(r => r !== correct), rand);

  const out = [correct];
  for (const r of candidates) {
    if (out.length >= count) break;
    if (!out.includes(r)) out.push(r);
  }
  while (out.length < count) {
    const r = pools.reasonsUnique[Math.floor(rand() * pools.reasonsUnique.length)];
    if (!out.includes(r)) out.push(r);
  }
  return shuffle(out, rand);
}

/* =========================================================
   Proof Engine
========================================================= */
const Proof = (() => {
  let current = -1;
  let autoplay = null;
  let focusMode = false;
  let practiceLevel = 0;

  let solvedStatements = new Set([0]);
  let solvedReasons = new Set([0]);
  let solvedMCQ = new Set();

  const el = {};
  let pools = null;

  function cacheDom() {
    el.btnPrev = document.getElementById('btn-prev');
    el.btnNext = document.getElementById('btn-next');
    el.btnPlay = document.getElementById('btn-play');
    el.btnReset = document.getElementById('btn-reset');
    el.btnFocus = document.getElementById('btn-focus');
    el.btnExplore = document.getElementById('btn-explore');
    el.btnDark = document.getElementById('btn-dark');
    el.modeSelect = document.getElementById('mode-select');
    el.proofBody = document.getElementById('proof-body');
    el.tchartWrap = document.getElementById('tchart-wrap');
    el.coachText = document.getElementById('coach-text');
    el.coachStepKind = document.getElementById('coach-stepkind');
    el.mcq = document.getElementById('mcq');
    el.live = document.getElementById('live');
    el.stepCounter = document.getElementById('step-counter');
    el.diagram = document.getElementById('diagram');

    el.progressContainer = document.getElementById('progress-container');
    el.progressBar = document.getElementById('progress-bar');

    el.modal = document.getElementById('tutorial-modal');
  }

  function applySavedTheme() {
    const t = safeGet('euclidTheme');
    if (t === 'dark') document.body.classList.add('dark');
    const isDark = document.body.classList.contains('dark');
    el.btnDark.innerHTML = isDark
      ? '<span aria-hidden="true">☀️</span> Light'
      : '<span aria-hidden="true">🌙</span> Dark';
    el.btnDark.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function updateHash(index) {
    try { history.replaceState(null, '', `#line-${index}`); } catch (e) {}
  }
  function scrollRowIfNeeded(row) {
    if (!row) return;
    const wrapRect = el.tchartWrap.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    if (rowRect.top >= wrapRect.top && rowRect.bottom <= wrapRect.bottom) return;
    row.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  function isStepSolved(index) {
    if (practiceLevel === 0) return true;
    if (index < 0) return false;
    const sSolved = (practiceLevel === 1) || solvedStatements.has(index);
    const rSolved = (practiceLevel === 2) || solvedReasons.has(index);
    return sSolved && rSolved;
  }

  function maxAllowedStep() {
    if (practiceLevel === 0) return LESSON.steps.length - 1;
    let i = 0;
    while (i < LESSON.steps.length && isStepSolved(i)) i++;
    return Math.min(i, LESSON.steps.length - 1);
  }

  function highlightFromStep(step) {
    const list = step.highlight?.length
      ? step.highlight
      : collectRefsFromParts(step.statementParts).map(id => ({id, mode:'strong'}));

    list.forEach(({id, mode}) => {
      const cls = mode === 'tri' ? 'hl-tri' : (mode === 'para' ? 'hl-parallelogram' : 'hl-strong');
      Diagram.addClass(id, 'highlight', cls);
    });
  }
  function revealFromStep(step) {
    if (step.reveal?.length) Diagram.showMany(step.reveal);
  }

  function applyFocusKeep(step) {
    if (applyFocusKeep._lastIds) for (const id of applyFocusKeep._lastIds) Diagram.get(id)?.classList.remove('focus-keep');
    const ids = step.focusKeep || [];
    for (const id of ids) Diagram.get(id)?.classList.add('focus-keep');
    applyFocusKeep._lastIds = ids.slice();
  }

  function renderMCQ(stepIndex) {
    const step = LESSON.steps[stepIndex];
    const mcq = step.mcq;

    if (!mcq) {
      el.mcq.classList.add('hidden');
      el.mcq.setAttribute('aria-hidden','true');
      el.mcq.innerHTML = '';
      return;
    }

    el.mcq.classList.remove('hidden');
    el.mcq.setAttribute('aria-hidden','false');

    const alreadySolved = solvedMCQ.has(stepIndex);
    const feedbackId = `mcq-feedback-${stepIndex}`;

    const r = mulberry32(0xC0FFEE + stepIndex * 9973);
    const items = mcq.choices.map((text, originalIndex) => ({ text, originalIndex }));
    const shuffled = shuffle(items, r);
    const newCorrectIndex = shuffled.findIndex(it => it.originalIndex === mcq.correctIndex);
    const displayFeedback = shuffled.map(it => (mcq.feedback || [])[it.originalIndex]);

    const choicesHtml = shuffled.map((it, displayIndex) => {
      const disabledAttr = alreadySolved ? 'disabled' : '';
      return `<button type="button" class="choice" data-choice="${displayIndex}" ${disabledAttr} aria-describedby="${feedbackId}">
        ${escapeHTML(it.text)}
      </button>`;
    }).join('');

    el.mcq.innerHTML = `
      <h3>Quick Check</h3>
      <div class="muted" style="font-weight:800;">${escapeHTML(mcq.question)}</div>
      <div class="choices">${choicesHtml}</div>
      <div id="${feedbackId}" class="feedback muted"></div>
    `;

    const feedbackEl = el.mcq.querySelector('.feedback');
    if (alreadySolved) {
      feedbackEl.textContent = "Answered.";
      feedbackEl.classList.remove('bad');
      feedbackEl.classList.add('good');
      return;
    }

    el.mcq.querySelectorAll('button.choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = parseInt(btn.dataset.choice, 10);
        const correct = (choice === newCorrectIndex);

        if (correct) {
          solvedMCQ.add(stepIndex);
          feedbackEl.textContent = displayFeedback[choice] || "Correct.";
          feedbackEl.classList.remove('bad');
          feedbackEl.classList.add('good');
          el.mcq.querySelectorAll('button.choice').forEach(b => b.disabled = true);
        } else {
          feedbackEl.textContent = displayFeedback[choice] || "Try again.";
          feedbackEl.classList.remove('good');
          feedbackEl.classList.add('bad');
        }
      });
    });
  }

  function updateProgressBar(index) {
    if (!el.progressBar || !el.progressContainer) return;
    const pct = ((index + 1) / LESSON.steps.length) * 100;
    el.progressBar.style.width = `${pct}%`;
    el.progressContainer.setAttribute('aria-valuemin', '1');
    el.progressContainer.setAttribute('aria-valuemax', String(LESSON.steps.length));
    el.progressContainer.setAttribute('aria-valuenow', String(index + 1));
    el.progressContainer.setAttribute('aria-valuetext', `Step ${index + 1} of ${LESSON.steps.length}`);
  }

  function setActive(index, opts = {}) {
    const { scroll = false, setHash = true, fromAutoplay = false } = opts;
    if (index < 0 || index >= LESSON.steps.length) return;

    const allowed = maxAllowedStep();
    if (practiceLevel > 0 && index > allowed) index = allowed;

    if (!fromAutoplay && autoplay) stop();

    if (current >= 0) {
      LESSON.steps[current].onDeselect?.();
      const oldRow = document.getElementById(`line-${current}`);
      if (oldRow) { oldRow.classList.remove('active'); oldRow.setAttribute('aria-selected','false'); }
    }

    Diagram.clearHighlights();
    current = index;

    const row = document.getElementById(`line-${index}`);
    if (row) { row.classList.add('active'); row.setAttribute('aria-selected','true'); }

    const step = LESSON.steps[index];
    revealFromStep(step);
    highlightFromStep(step);
    step.onSelect?.();

    el.coachText.textContent = step.coach || 'No notes for this step.';
    el.coachStepKind.textContent = step.reason?.label ? `Reason: ${step.reason.label}` : '';

    renderMCQ(index);

    const announce = (step.announce || []).filter(Boolean).join(', ');
    el.live.textContent = announce ? `Highlighting ${announce}.` : '';

    el.stepCounter.textContent = `Step ${index + 1} of ${LESSON.steps.length}`;
    el.btnPrev.disabled = index <= 0;
    el.btnNext.disabled = (index >= LESSON.steps.length - 1) || !isStepSolved(index);

    updateProgressBar(index);
    applyFocusKeep(step);

    if (setHash) updateHash(index);
    if (scroll) scrollRowIfNeeded(row);

    if (Explore.isEnabled()) Explore.update();
    postHeight();
  }

  function next(opts) {
    if (current === -1) return setActive(0, opts);
    if (!isStepSolved(current)) return;
    setActive(Math.min(current + 1, LESSON.steps.length - 1), opts);
  }
  function prev(opts) {
    if (current <= 0) return setActive(0, opts);
    setActive(Math.max(current - 1, 0), opts);
  }

  function stop() {
    if (autoplay) clearInterval(autoplay);
    autoplay = null;
    el.btnPlay.textContent = '▶ Play';
    el.btnPlay.setAttribute('aria-pressed','false');
    el.btnPlay.setAttribute('aria-label','Auto play');
  }

  function reset() {
    const exploreWasOn = Explore.isEnabled();

    current = -1;
    stop();

    solvedStatements = new Set([0]);
    solvedReasons = new Set([0]);
    solvedMCQ = new Set();

    Diagram.resetVisibility();
    renderProof();

    el.coachText.textContent = "Select a step in the proof to see notes here.";
    el.coachStepKind.textContent = '';
    el.mcq.classList.add('hidden');
    el.mcq.setAttribute('aria-hidden','true');
    el.mcq.innerHTML = '';

    el.btnPrev.disabled = true;
    el.btnNext.disabled = LESSON.steps.length === 0;

    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}

    if (exploreWasOn) {
      Explore.setEnabled(true);
      Explore.resetPositions();
    }

    if (LESSON.steps.length > 0) setActive(0, { scroll: false, setHash: false });
    postHeight();
  }

  function play() {
    stop();
    if (current >= LESSON.steps.length - 1) reset();
    else if (current === -1) setActive(0, { scroll: false });

    autoplay = setInterval(() => {
      if (current >= LESSON.steps.length - 1 || !isStepSolved(current)) { stop(); return; }
      next({ scroll: true, setHash: true, fromAutoplay: true });
    }, 3300);

    el.btnPlay.textContent = '⏸ Pause';
    el.btnPlay.setAttribute('aria-pressed','true');
    el.btnPlay.setAttribute('aria-label','Pause auto play');
  }

  function togglePlay() { autoplay ? stop() : play(); }

  function toggleFocus() {
    focusMode = !focusMode;
    el.diagram.classList.toggle('focusless', focusMode);
    el.btnFocus.textContent = focusMode ? '☾ Unfocus' : '☼ Focus';
    el.btnFocus.setAttribute('aria-pressed', focusMode ? 'true' : 'false');
    el.btnFocus.setAttribute('aria-label', focusMode ? 'Disable focus mode' : 'Enable focus mode');
  }

  function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark');
    safeSet('euclidTheme', isDark ? 'dark' : 'light');
    el.btnDark.innerHTML = isDark
      ? '<span aria-hidden="true">☀️</span> Light'
      : '<span aria-hidden="true">🌙</span> Dark';
    el.btnDark.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    el.btnDark.setAttribute('aria-label', isDark ? 'Disable dark mode' : 'Enable dark mode');
  }

  function toggleExplore() {
    const on = !Explore.isEnabled();
    Explore.setEnabled(on);
    el.btnExplore.setAttribute('aria-pressed', on ? 'true' : 'false');
    el.btnExplore.textContent = on ? 'Explore: on' : 'Explore';
    el.btnExplore.setAttribute('aria-label', on ? 'Disable explore mode' : 'Enable explore mode');
    postHeight();
  }

  function setPracticeMode(e) {
    practiceLevel = parseInt(e.target.value, 10);
    solvedStatements = new Set([0]);
    solvedReasons = new Set([0]);
    solvedMCQ = new Set();
    pools = buildPools(LESSON);
    renderProof();
    reset();
  }

  function isStatementSolved(i) {
    if (practiceLevel === 0) return true;
    if (i === 0) return true;
    return (practiceLevel === 1) || solvedStatements.has(i);
  }
  function isReasonSolved(i) {
    if (practiceLevel === 0) return true;
    if (i === 0) return true;
    return (practiceLevel === 2) || solvedReasons.has(i);
  }

  function renderProof() {
    const tbody = el.proofBody;
    tbody.innerHTML = '';

    const statementHtml = LESSON.steps.map(st => renderStatement(st.statementParts));
    const statementPlain = LESSON.steps.map(st => statementPlainText(st.statementParts));

    const seedBase = 123456 + practiceLevel * 999;

    LESSON.steps.forEach((step, i) => {
      const tr = document.createElement('tr');
      tr.id = `line-${i}`;
      tr.setAttribute('tabindex','0');
      tr.setAttribute('aria-selected','false');

      let stmtCell = `<div>${statementHtml[i]}</div>`;

      const tt = step.reason.tooltip ? escapeAttr(step.reason.tooltip) : '';
      const tooltipClass = step.reason.tooltip ? 'has-tooltip' : '';
      const tooltipAttrs = step.reason.tooltip ? ` data-tooltip="${tt}"` : '';
      const rsnBadge = `<span class="badge ${step.reason.kind} ${tooltipClass}"${tooltipAttrs}>${escapeHTML(step.reason.label)}</span>`;
      let rsnCell = rsnBadge;

      if (practiceLevel > 0 && i > 0) {
        if (!isStatementSolved(i)) {
          const r = mulberry32(seedBase + i * 104729);
          const choiceIdxs = statementChoicesForStep(i, pools, 5, r);
          const opts = choiceIdxs.map(idx => `<option value="${idx}">${escapeHTML(statementPlain[idx])}</option>`).join('');
          stmtCell = `
            <select class="practice-select stmt-select" data-step="${i}" aria-label="Select the correct statement for this step">
              <option value="">Select Statement...</option>${opts}
            </select>
            <div class="blur-hidden" id="hidden-stmt-${i}"><div>${statementHtml[i]}</div></div>
          `;
        }

        if (!isReasonSolved(i)) {
          const r = mulberry32(seedBase + i * 2654435761);
          const reasonChoices = reasonChoicesForStep(i, LESSON, pools, 5, r);
          const opts = reasonChoices.map(lbl => `<option value="${escapeAttr(lbl)}">${escapeHTML(lbl)}</option>`).join('');
          rsnCell = `
            <select class="practice-select rsn-select" data-step="${i}" aria-label="Select the correct reason for this step">
              <option value="">Select Reason...</option>${opts}
            </select>
            <div class="blur-hidden" id="hidden-rsn-${i}">${rsnBadge}</div>
          `;
        }
      }

      tr.innerHTML = `<td>${stmtCell}</td><td>${rsnCell}</td>`;
      tbody.appendChild(tr);
    });

    postHeight();
  }

  function bindControls() {
    document.getElementById('btn-next')?.addEventListener('click', () => next({ scroll: true }));
    document.getElementById('btn-prev')?.addEventListener('click', () => prev({ scroll: true }));
    document.getElementById('btn-reset')?.addEventListener('click', reset);
    document.getElementById('btn-play')?.addEventListener('click', () => (autoplay ? stop() : play()));
    document.getElementById('btn-focus')?.addEventListener('click', toggleFocus);
    document.getElementById('btn-dark')?.addEventListener('click', toggleDarkMode);
    document.getElementById('btn-explore')?.addEventListener('click', toggleExplore);
    document.getElementById('mode-select')?.addEventListener('change', setPracticeMode);

    el.proofBody.addEventListener('click', (e) => {
      if (['select','option'].includes(e.target.tagName.toLowerCase())) return;
      const tr = e.target.closest('tr');
      if (tr) setActive(parseInt(tr.id.replace('line-',''), 10), { scroll: false, setHash: true });
    });

    // Row keyboard activation (Enter/Space)
    el.proofBody.addEventListener('keydown', (e) => {
      const tr = e.target.closest?.('tr');
      if (!tr) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(parseInt(tr.id.replace('line-',''), 10), { scroll: false, setHash: true });
      }
    });

    // Hover highlight
    el.proofBody.addEventListener('mouseover', (e) => {
      const t = e.target;
      if (t.classList.contains('geom-ref')) t.dataset.target.split(',').forEach(id => Diagram.addClass(id, 'hover-hl'));
    });
    el.proofBody.addEventListener('mouseout', (e) => {
      const t = e.target;
      if (t.classList.contains('geom-ref')) t.dataset.target.split(',').forEach(id => Diagram.removeClass(id, 'hover-hl'));
    });

    // Keyboard highlight
    el.proofBody.addEventListener('focusin', (e) => {
      const t = e.target;
      if (t.classList?.contains('geom-ref')) t.dataset.target.split(',').forEach(id => Diagram.addClass(id, 'hover-hl'));
    });
    el.proofBody.addEventListener('focusout', (e) => {
      const t = e.target;
      if (t.classList?.contains('geom-ref')) t.dataset.target.split(',').forEach(id => Diagram.removeClass(id, 'hover-hl'));
    });

    // Practice selects
    el.proofBody.addEventListener('change', (e) => {
      const stepIndex = parseInt(e.target.dataset.step, 10);
      if (Number.isNaN(stepIndex)) return;

      if (e.target.classList.contains('stmt-select')) {
        if (parseInt(e.target.value, 10) === stepIndex) {
          solvedStatements.add(stepIndex);
          e.target.style.borderColor = 'var(--good)';
          e.target.disabled = true;
          document.getElementById(`hidden-stmt-${stepIndex}`)?.classList.remove('blur-hidden');
        } else {
          e.target.style.borderColor = 'var(--hilite)';
          e.target.value = '';
        }
      }

      if (e.target.classList.contains('rsn-select')) {
        if (e.target.value === LESSON.steps[stepIndex].reason.label) {
          solvedReasons.add(stepIndex);
          e.target.style.borderColor = 'var(--good)';
          e.target.disabled = true;
          document.getElementById(`hidden-rsn-${stepIndex}`)?.classList.remove('blur-hidden');
        } else {
          e.target.style.borderColor = 'var(--hilite)';
          e.target.value = '';
        }
      }

      if (current === stepIndex) {
        el.btnNext.disabled = (current >= LESSON.steps.length - 1) || !isStepSolved(stepIndex);
      }
    });

    // Progress bar click-to-jump (gated via setActive)
    function stepFromClientX(clientX) {
      const rect = el.progressContainer.getBoundingClientRect();
      const x = clientX - rect.left;
      let targetStep = Math.floor((x / rect.width) * LESSON.steps.length);
      targetStep = Math.max(0, Math.min(targetStep, LESSON.steps.length - 1));
      return targetStep;
    }
    el.progressContainer?.addEventListener('click', (e) => {
      setActive(stepFromClientX(e.clientX), { scroll: true });
    });

    // Keyboard for progress bar
    el.progressContainer?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next({ scroll: true }); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev({ scroll: true }); }
      if (e.key === 'Home')       { e.preventDefault(); setActive(0, { scroll: true, setHash: true }); }
      if (e.key === 'End') {
        e.preventDefault();
        if (practiceLevel === 0) setActive(LESSON.steps.length - 1, { scroll: true, setHash: true });
        else setActive(maxAllowedStep(), { scroll: true, setHash: true });
      }
    });

    // Hotkeys (disabled when modal open)
    window.addEventListener('keydown', (e) => {
      const modalOpen = el.modal && !el.modal.classList.contains('hidden');
      if (modalOpen && e.key !== 'Escape') return;

      const tag = document.activeElement?.tagName?.toLowerCase();
      if (['input','textarea','select','button'].includes(tag)) return;

      if (e.key === 'ArrowRight') next({ scroll: true });
      if (e.key === 'ArrowLeft') prev({ scroll: true });
      if (e.key.toLowerCase() === 'r') reset();

      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }

      if (e.key === 'Home') setActive(0, { scroll: true, setHash: true });
      if (e.key === 'End') {
        if (practiceLevel === 0) setActive(LESSON.steps.length - 1, { scroll: true, setHash: true });
        else setActive(maxAllowedStep(), { scroll: true, setHash: true });
      }
    });
  }

  function init(lesson) {
    LESSON = lesson;
    pools = buildPools(LESSON);
    cacheDom();
    applySavedTheme();
    bindControls();
  }

  return { init, renderProof, setActive, reset };
})();

/* =========================================================
   Height helper (Canvas iframe)
========================================================= */
function postHeight() {
  try {
    const h = Math.max(
      document.documentElement.scrollHeight || 0,
      document.body?.scrollHeight || 0
    );
    parent.postMessage({ type: 'euclid-iframe-height', value: h }, '*');
  } catch (e) {}
}
window.addEventListener('resize', () => setTimeout(postHeight, 50));
if ('ResizeObserver' in window) {
  const ro = new ResizeObserver(() => postHeight());
  window.addEventListener('DOMContentLoaded', () => {
    try { ro.observe(document.body); } catch (e) {}
  });
}

/* =========================================================
   Boot
========================================================= */
window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const key = (params.get('lesson') || 'I38').replace(/[^A-Za-z0-9_-]/g, '');

  // 1) load lesson JS (sets window.LESSON)
  await loadScript(`lessons/${key}.lesson.js`);
  if (!window.LESSON) {
    document.getElementById('page-subtitle').textContent = `Error: lesson "${key}" did not define window.LESSON`;
    return;
  }

  // 2) load SVG and mount
  const svgText = await loadText(`lessons/${key}.svg`);
  document.getElementById('diagram-mount').innerHTML = svgText;

  // Ensure SVG has id="diagram" for engine queries
  const svg = document.querySelector('#diagram-mount svg');
  if (svg && !svg.id) svg.id = 'diagram';

  // 3) hook up page title/subtitle/guiding question
  LESSON = window.LESSON;
  document.getElementById('page-title').textContent = LESSON.meta?.title || 'Euclid Interactive Proof';
  document.getElementById('page-subtitle').textContent = LESSON.meta?.subtitle || '';

  const gq = document.getElementById('guiding-question');
  if (gq) gq.innerHTML = LESSON.guiding?.questionHTML || '—';

  const hints = document.getElementById('guiding-hints');
  if (hints) {
    const items = (LESSON.guiding?.hintsHTML || []);
    hints.innerHTML = items.map(x => `<li>${x}</li>`).join('');
  }

  // 4) init modules
  Proof.init(LESSON);

  validateLesson(LESSON);
  Diagram.resetVisibility();

  // Explore mode setup
  Explore.bind();
  Explore.setEnabled(!!LESSON.explore?.enabled);

  // render proof + activate step from hash (gated inside Proof)
  Proof.renderProof();

  const m = location.hash.match(/line-(\d+)/);
  if (m) Proof.setActive(parseInt(m[1], 10), { scroll: false, setHash: true });
  else Proof.setActive(0, { scroll: false, setHash: false });

  // Layout hint
  const hint = document.getElementById('layout-hint');
  const mq = window.matchMedia('(min-width: 980px)');
  function updateLayoutHint() {
    hint.textContent = mq.matches
      ? "Layout: Side-by-side view. For stacked view, zoom in or narrow the window."
      : "Layout: Stacked view. For side-by-side view, zoom out or widen the window.";
  }
  if (mq.addEventListener) mq.addEventListener('change', updateLayoutHint);
  else mq.addListener(updateLayoutHint);
  updateLayoutHint();

  // Tutorial modal + focus trap
  const helpBtn = document.getElementById('btn-help');
  const modal = document.getElementById('tutorial-modal');
  const closeBtn = document.getElementById('btn-help-close');
  const dontShow = document.getElementById('tutorial-dontshow');

  let lastFocus = null;
  function focusablesInModal() {
    if (!modal) return [];
    return [...modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }

  function openTutorial() {
    lastFocus = document.activeElement;
    const skip = safeGet('euclidTutorialSkip') === '1';
    if (dontShow) dontShow.checked = skip;

    modal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
    postHeight();
  }

  function closeTutorial() {
    modal?.classList.add('hidden');
    document.body.style.overflow = '';
    (lastFocus || helpBtn)?.focus();
    postHeight();
  }

  helpBtn?.addEventListener('click', openTutorial);
  closeBtn?.addEventListener('click', closeTutorial);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeTutorial();
  });

  modal?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = focusablesInModal();
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeTutorial();
  });

  dontShow?.addEventListener('change', () => {
    safeSet('euclidTutorialSkip', dontShow.checked ? '1' : '0');
  });

  const skip = safeGet('euclidTutorialSkip') === '1';
  const seen = safeGet('euclidTutorialSeen') === '1';
  if (!skip && !seen) {
    openTutorial();
    safeSet('euclidTutorialSeen', '1');
  }

  postHeight();
});
