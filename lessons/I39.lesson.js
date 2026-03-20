// Lesson: Euclid Book I Proposition 39
// Exposes window.LESSON for the engine loader.
window.LESSON = {
  meta: {
    title: "Euclid’s Elements — Book I, Proposition 39",
    subtitle: "Equal triangles on the same base and on the same side are in the same parallels."
  },

  guiding: {
    questionHTML: `If two triangles share the same base <strong>BC</strong> and have equal area, what must be true about the line through their vertices <strong>A</strong> and <strong>D</strong>?`,
    hintsHTML: [
      `<strong>I.37</strong>: Triangles on the same base and in the same parallels are equal in area.`,
      `<strong>C.N. 1</strong>: Things equal to the same thing are equal to one another.`,
      `<strong>C.N. 5</strong>: The whole is greater than the part (used for the contradiction).`
    ]
  },

  // Hide construction objects until the relevant steps
  diagram: {
    initialHidden: [
      'AD',
      'AE',
      'BE',
      'EC',
      'ptE',
      'lblE',
      'explore-handles'
    ]
  },

  // Optional hatch fills (engine will create them when asked)
  hatch: {
    ABC: '170,360 370,360 270,120',
    DBC: '170,360 370,360 300,190',
    EBC: '170,360 370,360 354,120'
  },

  explore: {
    enabled: true,
    handlesGroupId: 'explore-handles',
    handles: {
      A: { handleId: 'handleA', ringId: 'handleA_ring', clampX: [180, 330], clampY: [80, 160] },
      D: { handleId: 'handleD', ringId: 'handleD_ring', clampX: [210, 420], clampY: [150, 270] }
    },

    // Called by the engine on every drag/update.
    onUpdate: (P, Diagram) => {
      // Fixed base
      const B = { x: 170, y: 360 };
      const C = { x: 370, y: 360 };

      const A = P.A;
      const D = P.D;

      // AE is the horizontal line through A (parallel to BC).
      // E is intersection of line BD (produced) with y = A.y.
      const Ay = A.y;
      const By = B.y;
      const Dy = D.y;

      // Guard against Dy == By (would be horizontal, no intersection)
      let t = 1.0;
      if (Math.abs(Dy - By) > 1e-6) {
        t = (Ay - By) / (Dy - By);
      }
      const E = {
        x: B.x + t * (D.x - B.x),
        y: Ay
      };

      // Update triangle ABC
      Diagram.get('AB')?.setAttribute('x1', A.x);
      Diagram.get('AB')?.setAttribute('y1', A.y);
      Diagram.get('AC')?.setAttribute('x1', A.x);
      Diagram.get('AC')?.setAttribute('y1', A.y);

      // Update triangle DBC
      Diagram.get('BD')?.setAttribute('x2', D.x);
      Diagram.get('BD')?.setAttribute('y2', D.y);
      Diagram.get('DC')?.setAttribute('x1', D.x);
      Diagram.get('DC')?.setAttribute('y1', D.y);

      // AD (join A to D)
      Diagram.get('AD')?.setAttribute('x1', A.x);
      Diagram.get('AD')?.setAttribute('y1', A.y);
      Diagram.get('AD')?.setAttribute('x2', D.x);
      Diagram.get('AD')?.setAttribute('y2', D.y);

      // AE (full-width guide line through A)
      Diagram.get('AE')?.setAttribute('y1', A.y);
      Diagram.get('AE')?.setAttribute('y2', A.y);

      // BE extension (B to E)
      Diagram.get('BE')?.setAttribute('x1', B.x);
      Diagram.get('BE')?.setAttribute('y1', B.y);
      Diagram.get('BE')?.setAttribute('x2', E.x);
      Diagram.get('BE')?.setAttribute('y2', E.y);

      // EC
      Diagram.get('EC')?.setAttribute('x1', E.x);
      Diagram.get('EC')?.setAttribute('y1', E.y);
      Diagram.get('EC')?.setAttribute('x2', C.x);
      Diagram.get('EC')?.setAttribute('y2', C.y);

      // Point/label positions
      Diagram.get('lblA')?.setAttribute('x', A.x - 6);
      Diagram.get('lblA')?.setAttribute('y', A.y - 10);

      Diagram.get('lblD')?.setAttribute('x', D.x - 6);
      Diagram.get('lblD')?.setAttribute('y', D.y - 10);

      Diagram.get('ptE')?.setAttribute('cx', E.x);
      Diagram.get('ptE')?.setAttribute('cy', E.y);
      Diagram.get('lblE')?.setAttribute('x', E.x + 6);
      Diagram.get('lblE')?.setAttribute('y', E.y - 10);

      // If hatch polygons exist, keep them aligned
      Diagram.get('triABCfill')?.setAttribute('points', `${B.x},${B.y} ${C.x},${C.y} ${A.x},${A.y}`);
      Diagram.get('triDBCfill')?.setAttribute('points', `${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`);
      Diagram.get('triEBCfill')?.setAttribute('points', `${B.x},${B.y} ${C.x},${C.y} ${E.x},${E.y}`);
    }
  },

  steps: [
    {
      kind: 'constr',
      statementParts: [
        {t:'Let '},{t:'ABC', ref:['triABC','lblA','lblB','lblC']},{t:' and '},{t:'DBC', ref:['triDBC','lblD','lblB','lblC']},
        {t:' be equal triangles on the same base '},{t:'BC', ref:['BC','lblB','lblC']},{t:' and on the same side of it. Join '},
        {t:'AD', ref:['AD','lblA','lblD']},{t:'.'}
      ],
      reason: { label:'I.Post.1', kind:'constr', tooltip:'To draw a straight line from any point to any point.' },
      reveal: ['AD'],
      coach: 'We start with equal-area triangles sharing base BC. Then we join A to D.',
      announce: ['triangles ABC and DBC', 'base BC', 'segment AD'],
      highlight: [
        {id:'AB', mode:'tri'},{id:'AC', mode:'tri'},{id:'BC', mode:'tri'},
        {id:'BD', mode:'tri'},{id:'DC', mode:'tri'},
        {id:'AD', mode:'strong'}
      ],
      focusKeep: ['BC'],
      onSelect: () => { Diagram.addTriangleHatch('ABC'); Diagram.addTriangleHatch('DBC'); },
      onDeselect: () => { Diagram.removeTriangleHatch('ABC'); Diagram.removeTriangleHatch('DBC'); }
    },

    {
      kind: 'det',
      statementParts: [
        {t:'I say that '},{t:'AD', ref:['AD']},{t:' is parallel to '},{t:'BC', ref:['BC']},{t:'.'}
      ],
      reason: { label:'Determination (I.39)', kind:'det' },
      coach: 'Goal: show the line through the two vertices is parallel to the shared base.',
      announce: ['AD', 'BC'],
      highlight: [{id:'AD', mode:'strong'},{id:'BC', mode:'strong'}],
      focusKeep: ['BC']
    },

    {
      kind: 'constr',
      statementParts: [
        {t:'If not, draw '},{t:'AE', ref:['AE','lblA']},{t:' through '},{t:'A', ref:['lblA']},{t:' parallel to '},{t:'BC', ref:['BC']},
        {t:' meeting '},{t:'BD', ref:['BD','lblB','lblD']},{t:' produced at '},{t:'E', ref:['ptE','lblE']},{t:', and join '},
        {t:'EC', ref:['EC','lblE','lblC']},{t:'.'}
      ],
      reason: { label:'I.31 + I.Post.1', kind:'constr', tooltip:'Draw a parallel through a point; join two points by a straight line.' },
      reveal: ['AE','BE','ptE','lblE','EC'],
      coach: 'This is the “assume not” step: we draw a different line through A parallel to BC and derive a contradiction.',
      announce: ['AE', 'point E', 'segment EC'],
      highlight: [
        {id:'AE', mode:'strong'},{id:'BC', mode:'strong'},
        {id:'BE', mode:'strong'},{id:'EC', mode:'strong'}
      ],
      focusKeep: ['BC'],
      mcq: {
        question: "Why do we introduce the line AE?",
        choices: [
          "To create a triangle on the same base BC and between the same parallels as ABC.",
          "To prove triangles ABC and DBC are congruent.",
          "To mark BC and DC as equal segments."
        ],
        correctIndex: 0,
        feedback: [
          "Yes: AE lets us apply the ‘same base + same parallels’ area theorem (I.37).",
          "No—this proposition is about parallels and area, not congruence.",
          "No."
        ]
      }
    },

    {
      kind: 'prop',
      statementParts: [
        {t:'Therefore triangle '},{t:'ABC', ref:['triABC']},{t:' equals triangle '},{t:'EBC', ref:['triEBC','ptE','lblB','lblC']},
        {t:' in area, for they are on the same base '},{t:'BC', ref:['BC']},{t:' and in the same parallels '},{t:'AE', ref:['AE']},{t:' and '},{t:'BC', ref:['BC']},{t:'.'}
      ],
      reason: { label:'I.37', kind:'prop', tooltip:'Triangles on the same base and in the same parallels are equal in area.' },
      coach: 'ABC and EBC share base BC and lie between the same parallels AE and BC.',
      announce: ['triangle ABC', 'triangle EBC', 'parallels AE and BC'],
      highlight: [
        {id:'AB', mode:'tri'},{id:'AC', mode:'tri'},{id:'BC', mode:'tri'},
        {id:'BE', mode:'tri'},{id:'EC', mode:'tri'},
        {id:'AE', mode:'strong'}
      ],
      focusKeep: ['BC'],
      onSelect: () => { Diagram.addTriangleHatch('ABC'); Diagram.addTriangleHatch('EBC'); },
      onDeselect: () => { Diagram.removeTriangleHatch('ABC'); Diagram.removeTriangleHatch('EBC'); }
    },

    {
      kind: 'def',
      statementParts: [
        {t:'But triangle '},{t:'ABC', ref:['triABC']},{t:' equals triangle '},{t:'DBC', ref:['triDBC']},{t:'; therefore triangle '},
        {t:'DBC', ref:['triDBC']},{t:' also equals triangle '},{t:'EBC', ref:['triEBC']},{t:' in area.'}
      ],
      reason: { label:'C.N. 1', kind:'def', tooltip:'Things equal to the same thing are equal to one another.' },
      coach: 'If ABC = DBC and ABC = EBC, then DBC = EBC.',
      announce: ['triangle DBC', 'triangle EBC'],
      highlight: [
        {id:'BD', mode:'tri'},{id:'DC', mode:'tri'},{id:'BC', mode:'tri'},
        {id:'BE', mode:'tri'},{id:'EC', mode:'tri'}
      ],
      focusKeep: ['BC']
    },

    {
      kind: 'prop',
      statementParts: [
        {t:'But triangle '},{t:'EBC', ref:['triEBC']},{t:' is greater than triangle '},{t:'DBC', ref:['triDBC']},{t:' (since '},
        {t:'E', ref:['ptE','lblE']},{t:' lies on '},{t:'BD', ref:['BD','BE']},{t:' produced); which is impossible.'}
      ],
      reason: { label:'C.N. 5 (Contradiction)', kind:'prop', tooltip:'The whole is greater than the part.' },
      coach: 'This is the contradiction: one triangle strictly contains the other, so they cannot be equal in area.',
      announce: ['contradiction'],
      highlight: [
        {id:'BE', mode:'strong'},{id:'BD', mode:'strong'},{id:'EC', mode:'strong'},
        {id:'DC', mode:'tri'},{id:'BC', mode:'tri'}
      ],
      focusKeep: ['BC']
    },

    {
      kind: 'thus',
      statementParts: [
        {t:'Therefore '},{t:'AD', ref:['AD']},{t:' is parallel to '},{t:'BC', ref:['BC']},{t:', and equal triangles on the same base and on the same side are in the same parallels. '},
        {t:'Q.E.D.', strong:true}
      ],
      reason: { label:'Reductio / Q.E.D.', kind:'thus', tooltip:'Since the assumption leads to an impossibility, AD ∥ BC.' },
      coach: 'Since the “not parallel” assumption leads to an impossibility, AD must be parallel to BC.',
      announce: ['AD parallel BC'],
      highlight: [{id:'AD', mode:'strong'},{id:'BC', mode:'strong'}],
      focusKeep: ['BC'],
      onSelect: () => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion && typeof confetti === 'function') {
          confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, colors: ['#2b6cb0', '#d97706', '#16a34a', '#7c3aed'] });
        }
        const stamp = document.getElementById('qed-stamp');
        stamp.classList.remove('hidden');
        stamp.classList.add('stamp-drop');
        stamp.setAttribute('aria-hidden','false');
      }
    }
  ]
};
