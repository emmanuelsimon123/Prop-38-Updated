'use strict';

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
