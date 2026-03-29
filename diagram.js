'use strict';

/* =========================================================
   Floating tooltip system (tooltips over everything)
========================================================= */
(function installFloatingTooltips(){
  let tip = null;

  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = 'floating-tooltip';
    tip.style.display = 'none';
    document.body.appendChild(tip);
    return tip;
  }

  function showTip(target) {
    const text = target?.getAttribute?.('data-tooltip');
    if (!text) return;
    const t = ensureTip();
    t.textContent = text;
    t.style.display = 'block';
    positionTip(target);
  }

  function hideTip() {
    if (!tip) return;
    tip.style.display = 'none';
  }

  function positionTip(target) {
    if (!tip || tip.style.display === 'none') return;
    const rect = target.getBoundingClientRect();
    const margin = 10;
    const tipRect = tip.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - tipRect.width - margin));

    let top = rect.top - tipRect.height - 10;
    if (top < margin) top = rect.bottom + 10;

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  document.addEventListener('pointerover', (e) => {
    const badge = e.target.closest?.('.badge.has-tooltip');
    if (!badge) return;
    showTip(badge);
  });

  document.addEventListener('pointerout', (e) => {
    const badge = e.target.closest?.('.badge.has-tooltip');
    if (!badge) return;
    hideTip();
  });

  document.addEventListener('scroll', () => {
    const active = document.querySelector('.badge.has-tooltip:hover');
    if (!active) return;
    const t = tip;
    if (!t || t.style.display === 'none') return;
    positionTip(active);
  }, true);

  window.addEventListener('resize', () => {
    const active = document.querySelector('.badge.has-tooltip:hover');
    if (!active) return;
    const t = tip;
    if (!t || t.style.display === 'none') return;
    positionTip(active);
  });
})();

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

  function clearCache() { cache.clear(); }

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

  // UPDATED: allow animate=false for "jump to step N" rebuilds
  function showMany(ids, animate = true) {
    const els = ids.map(get).filter(Boolean);
    els.forEach(el => { el.classList.remove('hidden'); el.setAttribute('aria-hidden','false'); });
    if (animate) requestAnimationFrame(() => els.forEach(applyAnimation));
  }

  function addClass(id, ...klasses) { get(id)?.classList.add(...klasses); }
  function removeClass(id, ...klasses) { get(id)?.classList.remove(...klasses); }

  function removeTriangleHatch(name) { document.getElementById(`tri${name}fill`)?.remove(); }
  function addTriangleHatch(name) { return; } // hatching disabled (no-op)

  function clearHighlights() {
    const svg = get('diagram');
    svg?.querySelectorAll('.highlight, .hl-strong, .hl-parallelogram, .hl-tri, .hover-hl')
      .forEach(el => el.classList.remove('highlight','hl-strong','hl-parallelogram','hl-tri','hover-hl'));

    document.querySelectorAll('polygon[id^="tri"][id$="fill"]').forEach(el => el.remove());

    const stamp = document.getElementById('qed-stamp');
    if (stamp) {
      // Per-lesson stamp text (Q.E.D. default, Q.E.F. for constructions)
      stamp.textContent = (LESSON?.meta?.stampText || 'Q.E.D.');
      stamp.classList.add('hidden');
      stamp.classList.remove('stamp-drop');
      stamp.setAttribute('aria-hidden','true');
    }
  }

  function resetVisibility() {
    (LESSON?.diagram?.initialHidden || []).forEach(id => {
      const el = get(id);
      if (el) { el.classList.add('hidden'); el.setAttribute('aria-hidden','true'); }
    });
    clearHighlights();
  }

  return { get, showMany, addClass, removeClass, clearHighlights, resetVisibility, addTriangleHatch, removeTriangleHatch, clearCache };
})();
