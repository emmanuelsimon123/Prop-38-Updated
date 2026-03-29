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

function randomU32() {
  try {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] >>> 0;
  } catch (e) {
    return ((Date.now() ^ (Math.random() * 0xFFFFFFFF)) >>> 0);
  }
}

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
   HTML sanitizer (allowlist-based, strips dangerous content)
========================================================= */
function sanitizeHTML(html) {
  const SAFE_TAGS = new Set(['b','strong','i','em','u','br','span','sub','sup','code','a','p','ul','ol','li']);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function clean(node) {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE) {
        child.remove();
        continue;
      }
      const tag = child.tagName.toLowerCase();
      if (!SAFE_TAGS.has(tag)) {
        while (child.firstChild) node.insertBefore(child.firstChild, child);
        child.remove();
        continue;
      }
      const attrs = [...child.attributes];
      for (const attr of attrs) {
        if (tag === 'a' && attr.name === 'href') {
          // Only allow http:, https:, and relative URLs (allowlist approach)
          const val = attr.value.trim();
          if (!/^(https?:\/\/|\/|\.\/|\.\.\/|#)/i.test(val)) child.removeAttribute(attr.name);
        } else {
          child.removeAttribute(attr.name);
        }
      }
      clean(child);
    }
  }

  clean(doc.body);
  return doc.body.innerHTML;
}

/* =========================================================
   Engine globals (filled at boot)
========================================================= */
let LESSON = null;
