'use strict';

/* =========================================================
   Proof Engine
========================================================= */
const Proof = (() => {
  let current = -1;
  let autoplay = null;
  let focusMode = false;
  let practiceLevel = 0;

  // MCQ shuffle seed (changes on Reset)
  let mcqRunSeed = randomU32();

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

  function revealFromStep(step, animate = true) {
    if (step.reveal?.length) Diagram.showMany(step.reveal, animate);
  }

  // KEY FIX (Option 1): rebuild the diagram exactly as if we stepped from 0..index
  function rebuildVisibilityUpTo(index) {
    Diagram.resetVisibility();
    for (let i = 0; i <= index; i++) {
      revealFromStep(LESSON.steps[i], false); // no animation spam when jumping
    }
  }

  function applyFocusKeep(step) {
    if (applyFocusKeep._lastIds) {
      for (const id of applyFocusKeep._lastIds) Diagram.get(id)?.classList.remove('focus-keep');
    }
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

    // MCQ shuffle changes each Reset
    const seed = ((0xC0FFEE ^ mcqRunSeed) + stepIndex * 9973) >>> 0;
    const r = mulberry32(seed);

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

    // BIG FIX: rebuild the diagram to the correct cumulative state
    rebuildVisibilityUpTo(index);

    current = index;

    const row = document.getElementById(`line-${index}`);
    if (row) { row.classList.add('active'); row.setAttribute('aria-selected','true'); }

    const step = LESSON.steps[index];

    // Now apply current-step highlight and hooks
    Diagram.clearHighlights();
    // (resetVisibility already cleared; but clearHighlights also ensures stamp text matches lesson)
    // Keep state consistent:
    // - resetVisibility cleared everything
    // - we revealed up to index
    // - now clearHighlights removes any leftover highlight from previous step
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

    // MCQ reshuffle each reset
    mcqRunSeed = randomU32();

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

    el.proofBody.addEventListener('keydown', (e) => {
      const tr = e.target.closest?.('tr');
      if (!tr) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(parseInt(tr.id.replace('line-',''), 10), { scroll: false, setHash: true });
      }
    });

    el.proofBody.addEventListener('mouseover', (e) => {
      const t = e.target;
      if (t.classList.contains('geom-ref')) t.dataset.target.split(',').forEach(id => Diagram.addClass(id, 'hover-hl'));
    });
    el.proofBody.addEventListener('mouseout', (e) => {
      const t = e.target;
      if (t.classList.contains('geom-ref')) t.dataset.target.split(',').forEach(id => Diagram.removeClass(id, 'hover-hl'));
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

    // Progress bar click-to-jump
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
   Height helper
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

  await loadScript(`lessons/${key}.lesson.js`);
  if (!window.LESSON) {
    document.getElementById('page-subtitle').textContent = `Error: lesson "${key}" did not define window.LESSON`;
    return;
  }

  const svgText = await loadText(`lessons/${key}.svg`);
  document.getElementById('diagram-mount').innerHTML = svgText;
  Diagram.clearCache();

  const svg = document.querySelector('#diagram-mount svg');
  if (svg && !svg.id) svg.id = 'diagram';

  LESSON = window.LESSON;
  document.getElementById('page-title').textContent = LESSON.meta?.title || 'Euclid Interactive Proof';
  document.getElementById('page-subtitle').textContent = LESSON.meta?.subtitle || '';

  const gq = document.getElementById('guiding-question');
  if (gq) gq.innerHTML = sanitizeHTML(LESSON.guiding?.questionHTML || '—');

  const hints = document.getElementById('guiding-hints');
  if (hints) {
    const items = (LESSON.guiding?.hintsHTML || []);
    hints.innerHTML = items.map(x => `<li>${sanitizeHTML(x)}</li>`).join('');
  }

  // SUMMARY BOX support (new)
  const summaryBox = document.getElementById('summary-box');
  if (summaryBox) {
    const html = LESSON.summaryHTML || '';
    if (html.trim()) {
      summaryBox.innerHTML = sanitizeHTML(html);
      summaryBox.classList.remove('hidden');
      summaryBox.setAttribute('aria-hidden','false');
    } else {
      summaryBox.innerHTML = '';
      summaryBox.classList.add('hidden');
      summaryBox.setAttribute('aria-hidden','true');
    }
  }

  Proof.init(LESSON);

  validateLesson(LESSON);
  Diagram.resetVisibility();

  Explore.bind();
  Explore.setEnabled(!!LESSON.explore?.enabled);

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

  // Tutorial modal + focus trap (unchanged from your version)
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
