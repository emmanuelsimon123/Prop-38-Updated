// Lesson: Euclid Book I Proposition 38
// Exposes window.LESSON for the engine loader.
window.LESSON = {
  meta: {
    title: "Euclid’s Elements — Book I, Proposition 38",
    subtitle: "Triangles on equal bases and in the same parallels are equal in area."
  },

  guiding: {
    questionHTML: `If two triangles stand on equal bases and between the same parallels, how do we use <strong>parallelograms</strong> to prove their areas are equal?`,
    hintsHTML: [
      `<strong>I.36</strong>: Parallelograms on equal bases in the same parallels are equal (in area).`,
      `<strong>I.34</strong>: A diagonal bisects a parallelogram; each triangle cut off is half its parallelogram.`
    ]
  },

  // Used by Diagram.resetVisibility() to hide initial construction objects
  diagram: {
    initialHidden: ['paraGBCA','paraDEFH','lineBG','lineFH','diagAB','diagDF','explore-handles']
  },

  // Hatch polygons initial points (Explore.onUpdate keeps these aligned too)
  hatch: {
    ABC: '140,360 300,360 230,120',
    DEF: '520,360 680,360 610,120'
  },

  explore: {
    enabled: true,
    handlesGroupId: 'explore-handles',
    handles: {
      A: { handleId: 'handleA', ringId: 'handleA_ring', clampX: [200, 800], clampY: [120, 120] },
      D: { handleId: 'handleD', ringId: 'handleD_ring', clampX: [40, 640],  clampY: [120, 120] }
    },

    // Called by the engine on every drag/update.
    onUpdate: (P, Diagram) => {
      const B = {x:140, y:360}, C = {x:300, y:360}, E = {x:520, y:360}, F = {x:680, y:360};
      const yTop = 120;

      const A = P.A;
      const D = P.D;

      const G = { x: B.x + (A.x - C.x), y: yTop };
      const H = { x: F.x + (D.x - E.x), y: yTop };

      Diagram.get('AB')?.setAttribute('x1', A.x);
      Diagram.get('AB')?.setAttribute('y1', A.y);
      Diagram.get('CA')?.setAttribute('x2', A.x);
      Diagram.get('CA')?.setAttribute('y2', A.y);
      Diagram.get('diagAB')?.setAttribute('x1', A.x);
      Diagram.get('diagAB')?.setAttribute('y1', A.y);

      Diagram.get('DE')?.setAttribute('x1', D.x);
      Diagram.get('DE')?.setAttribute('y1', D.y);
      Diagram.get('DF')?.setAttribute('x1', D.x);
      Diagram.get('DF')?.setAttribute('y1', D.y);
      Diagram.get('diagDF')?.setAttribute('x1', D.x);
      Diagram.get('diagDF')?.setAttribute('y1', D.y);

      Diagram.get('lineBG')?.setAttribute('x2', G.x);
      Diagram.get('lineBG')?.setAttribute('y2', G.y);
      Diagram.get('lineFH')?.setAttribute('x2', H.x);
      Diagram.get('lineFH')?.setAttribute('y2', H.y);

      Diagram.get('paraGBCA')?.setAttribute('points', `${G.x},${G.y} ${B.x},${B.y} ${C.x},${C.y} ${A.x},${A.y}`);
      Diagram.get('paraDEFH')?.setAttribute('points', `${D.x},${D.y} ${E.x},${E.y} ${F.x},${F.y} ${H.x},${H.y}`);

      Diagram.get('lblA')?.setAttribute('x', A.x - 5);
      Diagram.get('lblD')?.setAttribute('x', D.x - 5);
      Diagram.get('lblG')?.setAttribute('x', G.x - 10);
      Diagram.get('lblH')?.setAttribute('x', H.x);

      // Keep hatch fills aligned if present
      Diagram.get('triABCfill')?.setAttribute('points', `${B.x},${B.y} ${C.x},${C.y} ${A.x},${A.y}`);
      Diagram.get('triDEFfill')?.setAttribute('points', `${E.x},${E.y} ${F.x},${F.y} ${D.x},${D.y}`);
    }
  },

  steps: [
    {
      kind: 'given',
      statementParts: [
        {t:'Let '},{t:'ABC', ref:['triA_parts','lblA','lblB','lblC']},{t:' and '},
        {t:'DEF', ref:['triD_parts','lblD','lblE','lblF']},
        {t:' be triangles on equal bases '},{t:'BC', ref:['BC','lblB','lblC']},{t:' and '},
        {t:'EF', ref:['EF','lblE','lblF']},
        {t:' and in the same parallels '},{t:'BF', ref:['lineBF','lblB','lblF']},{t:' and '},
        {t:'AD', ref:['lineAD','lblA','lblD']},{t:'.'}
      ],
      reason: { label:'Given (I.38)', kind:'given' },
      coach: 'Both triangles sit between the same pair of parallels and have equal bases.',
      announce: ['bases BC and EF', 'parallels BF and AD', 'triangles ABC and DEF'],
      highlight: [
        { id:'BC', mode:'strong' }, { id:'EF', mode:'strong' },
        { id:'tickBC', mode:'strong' }, { id:'tickEF', mode:'strong' },
        { id:'lineBF', mode:'strong' }, { id:'lineAD', mode:'strong' },
        { id:'AB', mode:'strong' }, { id:'CA', mode:'strong' }, { id:'DE', mode:'strong' }, { id:'DF', mode:'strong' }
      ],
      focusKeep: ['lineBF','lineAD']
    },
    {
      kind: 'det',
      statementParts: [
        {t:'I say that triangle '},{t:'ABC', ref:['triA_parts']},{t:' equals triangle '},{t:'DEF', ref:['triD_parts']},{t:' '},
        {t:'in area', strong:true},{t:'.'}
      ],
      reason: { label:'Determination', kind:'det' },
      coach: 'This is an area claim (not triangle congruence).',
      announce: ['triangle ABC', 'triangle DEF'],
      highlight: [
        {id:'AB', mode:'tri'}, {id:'BC', mode:'tri'}, {id:'CA', mode:'tri'},
        {id:'DE', mode:'tri'}, {id:'EF', mode:'tri'}, {id:'DF', mode:'tri'}
      ],
      focusKeep: ['lineBF','lineAD']
    },
    {
      kind: 'constr',
      statementParts: [
        {t:'Produce '},{t:'AD', ref:['lineAD','lblA','lblD']},{t:' in both directions to '},{t:'G', ref:['lblG']},{t:' and '},{t:'H', ref:['lblH']},{t:'.'}
      ],
      reason: { label:'I.Post.2', kind:'constr', tooltip:'To produce a finite straight line continuously in a straight line.' },
      coach: 'Extending AD prepares the top side of each constructed parallelogram.',
      announce: ['line AD produced to G and H'],
      focusKeep: ['lineBF','lineAD'],
      mcq: {
        question: "Which idea is being used in this step?",
        choices: [
          "A postulate about extending a line segment.",
          "A proposition about equal parallelogram areas.",
          "A definition of parallelogram."
        ],
        correctIndex: 0,
        feedback: [
          "Yes: this is exactly “produce a finite straight line continuously.”",
          "Not here—area equality comes later (I.36).",
          "Not here—we haven’t justified a quadrilateral as a parallelogram yet."
        ]
      }
    },
    {
      kind: 'constr',
      statementParts: [
        {t:'Draw '},{t:'BG', ref:['lineBG','lblB','lblG']},{t:' through '},{t:'B', ref:['lblB']},{t:' parallel to '},{t:'CA', ref:['CA','lblC','lblA']},
        {t:', and '},{t:'FH', ref:['lineFH','lblF','lblH']},{t:' through '},{t:'F', ref:['lblF']},{t:' parallel to '},{t:'DE', ref:['DE','lblD','lblE']},{t:'.'}
      ],
      reason: { label:'I.31', kind:'constr', tooltip:'Through a given point, to draw a straight line parallel to a given straight line.' },
      reveal: ['lineBG','lineFH'],
      coach: 'These parallels create the missing sides needed to form parallelograms.',
      announce: ['line BG parallel CA', 'line FH parallel DE'],
      focusKeep: ['lineBF','lineAD'],
      mcq: {
        question: "Why are BG and FH drawn?",
        choices: [
          "To create the missing sides so we can form parallelograms on the bases.",
          "To prove triangles ABC and DEF are congruent.",
          "To mark the bases as equal using ticks."
        ],
        correctIndex: 0,
        feedback: [
          "Correct: they complete the parallelogram constructions.",
          "No—this proposition is about area, not congruence.",
          "No—the equal base marking is already given."
        ]
      }
    },
    {
      kind: 'def',
      statementParts: [
        {t:'Then '},{t:'GBCA', ref:['paraGBCA']},{t:' and '},{t:'DEFH', ref:['paraDEFH']},{t:' are parallelograms.'}
      ],
      reason: { label:'Definition', kind:'def', tooltip:'A quadrilateral with both pairs of opposite sides parallel is a parallelogram.' },
      reveal: ['paraGBCA','paraDEFH'],
      coach: 'We have built two parallelograms on the same pair of parallels.',
      announce: ['parallelogram GBCA', 'parallelogram DEFH'],
      highlight: [
        {id:'paraGBCA', mode:'para'}, {id:'paraDEFH', mode:'para'},
        {id:'lineBG', mode:'strong'}, {id:'CA', mode:'strong'},
        {id:'lineFH', mode:'strong'}, {id:'DE', mode:'strong'},
        {id:'BC', mode:'strong'}, {id:'EF', mode:'strong'},
        {id:'lineAD', mode:'strong'}, {id:'lineBF', mode:'strong'}
      ],
      focusKeep: ['lineBF','lineAD']
    },
    {
      kind: 'prop',
      statementParts: [
        {t:'And parallelogram '},{t:'GBCA', ref:['paraGBCA']},{t:' equals '},{t:'DEFH', ref:['paraDEFH']},{t:' '},{t:'in area', strong:true},{t:'.'}
      ],
      reason: { label:'I.36', kind:'prop', tooltip:'Parallelograms which are on equal bases and in the same parallels are equal to one another.' },
      coach: 'Equal bases and same parallels gives equal parallelogram areas.',
      announce: ['parallelograms GBCA and DEFH'],
      highlight: [
        {id:'paraGBCA', mode:'para'}, {id:'paraDEFH', mode:'para'},
        {id:'BC', mode:'strong'}, {id:'EF', mode:'strong'},
        {id:'tickBC', mode:'strong'}, {id:'tickEF', mode:'strong'},
        {id:'lineBF', mode:'strong'}, {id:'lineAD', mode:'strong'}
      ],
      focusKeep: ['lineBF','lineAD']
    },
    {
      kind: 'prop',
      statementParts: [
        {t:'Moreover, triangle '},{t:'ABC', ref:['triA_parts']},{t:' is half of '},{t:'GBCA', ref:['paraGBCA']},{t:' (diagonal '},{t:'AB', ref:['diagAB']},
        {t:' bisects it), and triangle '},{t:'DEF', ref:['triD_parts']},{t:' is half of '},{t:'DEFH', ref:['paraDEFH']},{t:'.'}
      ],
      reason: { label:'I.34', kind:'prop', tooltip:'In parallelogrammic areas the opposite sides and angles are equal, and the diameter bisects the areas.' },
      reveal: ['diagAB','diagDF'],
      coach: 'Each triangle is exactly half of its parallelogram.',
      announce: ['diagonal AB', 'diagonal DF', 'triangles as halves'],
      onSelect: () => { Diagram.addTriangleHatch('ABC'); Diagram.addTriangleHatch('DEF'); },
      onDeselect: () => { Diagram.removeTriangleHatch('ABC'); Diagram.removeTriangleHatch('DEF'); },
      highlight: [
        {id:'paraGBCA', mode:'para'}, {id:'paraDEFH', mode:'para'},
        {id:'AB', mode:'tri'}, {id:'BC', mode:'tri'}, {id:'CA', mode:'tri'},
        {id:'DF', mode:'tri'}, {id:'DE', mode:'tri'}, {id:'EF', mode:'tri'}
      ],
      focusKeep: ['lineBF','lineAD']
    },
    {
      kind: 'thus',
      statementParts: [
        {t:'Therefore triangle '},{t:'ABC', ref:['triA_parts']},{t:' equals triangle '},{t:'DEF', ref:['triD_parts']},{t:' '},{t:'in area', strong:true},{t:'.'}
      ],
      reason: { label:'C.N. 3 / Q.E.D.', kind:'thus', tooltip:'Because halves of equals are equal, and halving is a kind of subtraction, we appeal to Common Notion 3 (If equals be subtracted from equals, the remainders are equal).' },
      coach: 'Equal parallelograms imply equal halves, so the triangles have equal area.',
      announce: ['triangle ABC equals triangle DEF in area'],
      highlight: [
        {id:'AB', mode:'tri'}, {id:'BC', mode:'tri'}, {id:'CA', mode:'tri'},
        {id:'DE', mode:'tri'}, {id:'EF', mode:'tri'}, {id:'DF', mode:'tri'},
        {id:'lineBF', mode:'strong'}, {id:'lineAD', mode:'strong'}
      ],
      focusKeep: ['lineBF','lineAD'],
      onSelect: () => {
        Diagram.addTriangleHatch('ABC'); Diagram.addTriangleHatch('DEF');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion && typeof confetti === 'function') {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#2b6cb0', '#d97706', '#16a34a', '#7c3aed'] });
        }
        const stamp = document.getElementById('qed-stamp');
        stamp.classList.remove('hidden'); stamp.classList.add('stamp-drop'); stamp.setAttribute('aria-hidden','false');
      },
      onDeselect: () => { Diagram.removeTriangleHatch('ABC'); Diagram.removeTriangleHatch('DEF'); }
    }
  ]
};
