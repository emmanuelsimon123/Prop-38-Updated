'use strict';

/* =========================================================
   Explore Mode (scroll-safe)
========================================================= */
const Explore = (() => {
  let enabled = false;
  let dragKey = null;
  let dragPointerId = null;
  let draggingEl = null;
  let P = {};

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
    if (!enabled) stopDrag();
    if (enabled) update();
  }

  function pointerToSvgPoint(evt) {
    const svg = Diagram.get('diagram');
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const sp = pt.matrixTransform(ctm.inverse());
    return { x: sp.x, y: sp.y };
  }

  function onMove(evt) {
    if (!enabled || !dragKey) return;
    const { x, y } = pointerToSvgPoint(evt);
    const h = LESSON.explore.handles[dragKey];
    const clampX = h.clampX || [-Infinity, Infinity];
    const clampY = h.clampY || [-Infinity, Infinity];
    P[dragKey].x = clamp(x, clampX[0], clampX[1]);
    P[dragKey].y = clamp(y, clampY[0], clampY[1]);
    update();
  }

  function stopDrag() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', stopDrag);
    window.removeEventListener('pointercancel', stopDrag);
    try { draggingEl?.releasePointerCapture?.(dragPointerId); } catch (e) {}
    dragKey = null;
    dragPointerId = null;
    draggingEl = null;
  }

  function startDrag(key, evt) {
    if (!enabled) return;
    dragKey = key;
    dragPointerId = evt.pointerId;
    draggingEl = evt.target;
    draggingEl?.setPointerCapture?.(evt.pointerId);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
  }

  function update() {
    if (!enabled) return;

    const handles = LESSON?.explore?.handles || {};
    for (const key of Object.keys(handles)) {
      const h = handles[key];
      for (const id of [h.handleId, h.ringId].filter(Boolean)) {
        Diagram.get(id)?.setAttribute('cx', P[key].x);
        Diagram.get(id)?.setAttribute('cy', P[key].y);
      }
    }

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
      el?.addEventListener('lostpointercapture', stopDrag);
    }
  }

  return { bind, setEnabled, isEnabled: () => enabled, update, resetPositions };
})();
