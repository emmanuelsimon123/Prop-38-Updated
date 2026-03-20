// Euclid Book I Proposition 42
window.LESSON = {
  meta: {
    title: "Euclid’s Elements — Book I, Proposition 42",
    subtitle: "To construct a parallelogram equal to a given triangle in a given rectilinear angle.",
    stampText: "Q.E.F."
  },

  guiding: {
    questionHTML: `Given triangle <strong>ABC</strong> and a rectilinear angle <strong>D</strong>, how can we construct a parallelogram equal (in area) to <strong>ABC</strong>, with one angle equal to <strong>D</strong>?`,
    hintsHTML: [
      `<strong>I.10</strong>: Bisect <strong>BC</strong> at <strong>E</strong>.`,
      `<strong>I.Post.1</strong>: Join <strong>AE</strong>.`,
      `<strong>I.23</strong>: Copy the given angle <strong>D</strong> at <strong>E</strong> to get <strong>∠CEF</strong>.`,
      `<strong>I.31</strong>: Use parallels to complete parallelogram <strong>FECG</strong>.`
    ]
  },

  // Summary is now its own box (not in the hint list)
  summaryHTML: `
    <h2 style="margin:.2rem 0 .4rem;">Summary (Steps 3–12)</h2>
    <p style="margin:.2rem 0 .8rem;color:var(--muted);font-weight:800;">
      Three moves: halve the triangle, build a parallelogram that is double the half, conclude equality.
    </p>

    <div style="display:grid;gap:.8rem;">
      <div style="padding:.75rem .9rem;background:#f7f7f9;border-left:4px solid #4a90e2;border-radius:6px;">
        <div style="font-weight:900;margin-bottom:.2rem;">1) Split triangle ABC into two equal-area halves (Steps 3–6)</div>
        <div>Bisect <strong>BC</strong> at <strong>E</strong> and join <strong>AE</strong>. Then triangles <strong>ABE</strong> and <strong>AEC</strong> are equal in area (I.38), so <strong>ABC is double AEC</strong>.</div>
      </div>

      <div style="padding:.75rem .9rem;background:#f7f7f9;border-left:4px solid #7ed321;border-radius:6px;">
        <div style="font-weight:900;margin-bottom:.2rem;">2) Force the required angle and form a parallelogram (Steps 7–8)</div>
        <div>Copy the given angle <strong>D</strong> at <strong>E</strong> to make <strong>∠CEF</strong>, then draw parallels to complete parallelogram <strong>FECG</strong>.</div>
      </div>

      <div style="padding:.75rem .9rem;background:#f7f7f9;border-left:4px solid #f5a623;border-radius:6px;">
        <div style="font-weight:900;margin-bottom:.2rem;">3) Match “double the same triangle” (Steps 9–12)</div>
        <div>Parallelogram <strong>FECG</strong> is double triangle <strong>AEC</strong> (I.41). Triangle <strong>ABC</strong> is also double <strong>AEC</strong>. So the parallelogram equals the given triangle (C.N.1), and its angle matches <strong>D</strong> by construction.</div>
      </div>
    </div>
  `,

  diagram: {
    initialHidden: [
      'ptE','lblE','tickBE','tickEC',
      'AE','EF','AG','CG','FG',
      'ptF','lblF','ptG','lblG',
      'paraFECG',
      'explore-handles'
    ]
  },

  explore: {
    enabled: true,
    handlesGroupId: 'explore-handles',
    handles: {
      A: { handleId: 'handleA', ringId: 'handleA_ring', clampX: [185, 320], clampY: [110, 240] }
    },

    // Keep the construction consistent as A moves.
    onUpdate: (P, Diagram) => {
      const B = { x: 150, y: 380 };
      const C = { x: 370, y: 380 };
      const E = { x: 260, y: 380 };

      // EF direction (represents copied angle D)
      const dir = { dx: 170, dy: -240 }; // up-right

      const A = P.A;

      // Update triangle sides AB and AC (A is x1,y1; B/C fixed)
      Diagram.get('AB')?.setAttribute('x1', A.x);
      Diagram.get('AB')?.setAttribute('y1', A.y);

      Diagram.get('AC')?.setAttribute('x1', A.x);
      Diagram.get('AC')?.setAttribute('y1', A.y);

      // Update AE (median)
      Diagram.get('AE')?.setAttribute('x1', A.x);
      Diagram.get('AE')?.setAttribute('y1', A.y);

      // AG is horizontal through A (parallel to EC)
      Diagram.get('AG')?.setAttribute('y1', A.y);
      Diagram.get('AG')?.setAttribute('y2', A.y);

      // Intersection F of ray (E + t*dir) with y = A.y
      const tE = (A.y - E.y) / dir.dy; // dir.dy < 0; A.y < E.y => positive
      const F = { x: E.x + tE * dir.dx, y: A.y };

      // Intersection G of line through C parallel to EF with y = A.y
      const tC = (A.y - C.y) / dir.dy;
      const G = { x: C.x + tC * dir.dx, y: A.y };

      // Update EF endpoint at F
      Diagram.get('EF')?.setAttribute('x2', F.x);
      Diagram.get('EF')?.setAttribute('y2', F.y);

      // Update CG endpoint at G
      Diagram.get('CG')?.setAttribute('x2', G.x);
      Diagram.get('CG')?.setAttribute('y2', G.y);

      // Update FG (top side)
      Diagram.get('FG')?.setAttribute('x1', F.x);
      Diagram.get('FG')?.setAttribute('y1', F.y);
      Diagram.get('FG')?.setAttribute('x2', G.x);
      Diagram.get('FG')?.setAttribute('y2', G.y);

      // Update parallelogram polygon (F-E-C-G)
      Diagram.get('paraFECG')?.setAttribute('points', `${F.x},${F.y} ${E.x},${E.y} ${C.x},${C.y} ${G.x},${G.y}`);

      // Update points/labels
      Diagram.get('ptF')?.setAttribute('cx', F.x);
      Diagram.get('ptF')?.setAttribute('cy', F.y);
      Diagram.get('lblF')?.setAttribute('x', F.x + 6);
      Diagram.get('lblF')?.setAttribute('y', F.y - 10);

      Diagram.get('ptG')?.setAttribute('cx', G.x);
      Diagram.get('ptG')?.setAttribute('cy', G.y);
      Diagram.get('lblG')?.setAttribute('x', G.x + 6);
      Diagram.get('lblG')?.setAttribute('y', G.y - 10);

      Diagram.get('lblA')?.setAttribute('x', A.x - 12);
      Diagram.get('lblA')?.setAttribute('y', A.y - 12);
    }
  },

  steps: [
    {
      kind: 'given',
      statementParts: [
        {t:'Let '},
        {t:'ABC', ref:['triABC_parts','lblA','lblB','lblC']},
        {t:' be the given triangle, and '},
        {t:'D', ref:['angleD_parts','lblD']},
        {t:' the given rectilinear angle.'}
      ],
      reason: { label:'Given (I.42)', kind:'given' },
      coach: 'We are given an area target (triangle ABC) and an angle constraint (angle D).',
      announce: ['triangle ABC', 'given angle D'],
      highlight: [
        {id:'triABC_parts', mode:'tri'},
        {id:'angleD_parts', mode:'strong'}
      ],
      focusKeep: ['BC','angleD_parts']
    },

    {
      kind: 'det',
      statementParts: [
        {t:'It is required to construct a parallelogram equal to triangle '},
        {t:'ABC', ref:['triABC_parts']},
        {t:' in an angle equal to the given angle '},
        {t:'D', ref:['angleD_parts']},
        {t:'.'}
      ],
      reason: { label:'Determination', kind:'det' },
      coach: 'We must make a parallelogram with the correct angle AND the same area as triangle ABC.',
      announce: ['goal: parallelogram equal in area', 'goal: angle matches D'],
      highlight: [
        {id:'triABC_parts', mode:'tri'},
        {id:'angleD_parts', mode:'strong'}
      ],
      focusKeep: ['BC','angleD_parts']
    },

    {
      kind: 'constr',
      statementParts: [
        {t:'Bisect '},{t:'BC', ref:['BC','BE','EC','lblB','lblC']},{t:' at '},{t:'E', ref:['ptE','lblE']},{t:'.'}
      ],
      reason: { label:'I.10', kind:'constr', tooltip:'To bisect a given finite straight line.' },
      reveal: ['ptE','lblE','tickBE','tickEC'],
      coach: 'Midpoint E gives BE = EC, which will help compare areas using I.38.',
      announce: ['midpoint E', 'BE = EC'],
      highlight: [
        {id:'BE', mode:'strong'}, {id:'EC', mode:'strong'},
        {id:'tickBE', mode:'strong'}, {id:'tickEC', mode:'strong'}
      ],
      focusKeep: ['BC']
    },

    {
      kind: 'constr',
      statementParts: [
        {t:'Join '},{t:'AE', ref:['AE','lblA','ptE','lblE']},{t:'.'}
      ],
      reason: { label:'I.Post.1', kind:'constr', tooltip:'To draw a straight line from any point to any point.' },
      reveal: ['AE'],
      coach: 'AE splits triangle ABC into two smaller triangles ABE and AEC.',
      announce: ['segment AE'],
      highlight: [{id:'AE', mode:'strong'}],
      focusKeep: ['AE','BC'],
      mcq: {
        question: 'Which statement best describes why we draw AE?',
        choices: [
          'To split triangle ABC into two parts so we can compare areas.',
          'To copy the given angle D.',
          'To prove BC is parallel to another line.'
        ],
        correctIndex: 0,
        feedback: [
          'Yes: AE creates triangles ABE and AEC.',
          'No: copying angle D happens at E with I.23.',
          'No: parallels are drawn later (I.31).'
        ]
      }
    },

    {
      kind: 'prop',
      statementParts: [
        {t:'Since '},{t:'BE', ref:['BE']},{t:' equals '},{t:'EC', ref:['EC']},{t:', triangle '},
        {t:'ABE', ref:['AB','AE','BE']},{t:' equals triangle '},{t:'AEC', ref:['AC','AE','EC']},{t:' in area.'}
      ],
      reason: { label:'I.38', kind:'prop', tooltip:'Triangles on equal bases and in the same parallels are equal in area.' },
      coach: 'With BE=EC and the same height from A to BC, the two triangles have equal area.',
      announce: ['triangle ABE equals triangle AEC (area)'],
      highlight: [
        {id:'AB', mode:'tri'},{id:'AE', mode:'tri'},{id:'BE', mode:'tri'},
        {id:'AC', mode:'tri'},{id:'EC', mode:'tri'}
      ],
      focusKeep: ['AE','BC']
    },

    {
      kind: 'thus',
      statementParts: [
        {t:'Therefore triangle '},{t:'ABC', ref:['triABC_parts']},{t:' is '},{t:'double', strong:true},{t:' triangle '},{t:'AEC', ref:['AC','AE','EC']},{t:'.'}
      ],
      reason: { label:'Therefore', kind:'thus', tooltip:'ABC is made of two equal-area triangles ABE and AEC, hence it is double AEC.' },
      coach: 'ABC = ABE + AEC, and ABE = AEC, so ABC is double AEC.',
      announce: ['triangle ABC is double triangle AEC'],
      highlight: [{id:'triABC_parts', mode:'tri'},{id:'AE', mode:'strong'}],
      focusKeep: ['triABC_parts','AE']
    },

    {
      kind: 'constr',
      statementParts: [
        {t:'Construct angle '},{t:'CEF', ref:['EC','EF','lblE','lblC','lblF']},{t:' equal to the given angle '},{t:'D', ref:['angleD_parts','lblD']},{t:'.'}
      ],
      reason: { label:'I.23', kind:'constr', tooltip:'On a given line at a point, to construct an angle equal to a given rectilinear angle.' },
      reveal: ['EF','AG','ptF','lblF'],
      coach: 'We copy angle D at E so the constructed parallelogram will have the required angle.',
      announce: ['angle CEF copied from D'],
      highlight: [
        {id:'EF', mode:'strong'},{id:'EC', mode:'strong'},
        {id:'rayD1', mode:'strong'},{id:'rayD2', mode:'strong'}
      ],
      focusKeep: ['EC','angleD_parts']
    },

    {
      kind: 'constr',
      statementParts: [
        {t:'Draw '},{t:'AG', ref:['AG','lblA']},{t:' through A parallel to '},{t:'EC', ref:['EC']},{t:', and draw '},
        {t:'CG', ref:['CG','lblC','lblG']},{t:' through C parallel to '},{t:'EF', ref:['EF']},{t:'.'}
      ],
      reason: { label:'I.31', kind:'constr', tooltip:'Through a given point, to draw a straight line parallel to a given straight line.' },
      reveal: ['CG','FG','ptG','lblG'],
      coach: 'Using parallels completes the “frame” of the parallelogram.',
      announce: ['AG ∥ EC', 'CG ∥ EF'],
      highlight: [
        {id:'AG', mode:'strong'},{id:'EC', mode:'strong'},
        {id:'CG', mode:'strong'},{id:'EF', mode:'strong'}
      ],
      focusKeep: ['EC','EF','AG']
    },

    {
      kind: 'def',
      statementParts: [
        {t:'Then '},{t:'FECG', ref:['paraFECG','FG','EF','EC','CG','lblF','lblE','lblC','lblG']},{t:' is a parallelogram.'}
      ],
      reason: { label:'Definition', kind:'def', tooltip:'Opposite sides parallel implies a parallelogram.' },
      reveal: ['paraFECG'],
      coach: 'By construction, EC ∥ FG and EF ∥ CG, so FECG is a parallelogram.',
      announce: ['parallelogram FECG'],
      highlight: [
        {id:'paraFECG', mode:'para'},
        {id:'EC', mode:'strong'},{id:'FG', mode:'strong'},
        {id:'EF', mode:'strong'},{id:'CG', mode:'strong'}
      ],
      focusKeep: ['paraFECG']
    },

    {
      kind: 'prop',
      statementParts: [
        {t:'Parallelogram '},{t:'FECG', ref:['paraFECG']},{t:' is also '},{t:'double', strong:true},{t:' triangle '},
        {t:'AEC', ref:['AC','AE','EC']},{t:' (same base '},{t:'EC', ref:['EC']},{t:' and same parallels).'}
      ],
      reason: { label:'I.41', kind:'prop', tooltip:'A parallelogram on the same base with a triangle and in the same parallels is double the triangle.' },
      coach: 'FECG and triangle AEC share base EC and lie between the same parallels EC and FG (since FG is parallel to EC).',
      announce: ['parallelogram is double triangle AEC'],
      highlight: [{id:'paraFECG', mode:'para'},{id:'EC', mode:'strong'},{id:'AE', mode:'tri'},{id:'AC', mode:'tri'}],
      focusKeep: ['paraFECG','EC']
    },

    {
      kind: 'thus',
      statementParts: [
        {t:'Therefore parallelogram '},{t:'FECG', ref:['paraFECG']},{t:' equals triangle '},{t:'ABC', ref:['triABC_parts']},{t:' in area.'}
      ],
      reason: { label:'C.N. 1', kind:'thus', tooltip:'Things equal to the same thing are equal to one another.' },
      coach: 'Both are double triangle AEC, so they are equal in area.',
      announce: ['parallelogram equals triangle ABC (area)'],
      highlight: [{id:'paraFECG', mode:'para'},{id:'triABC_parts', mode:'tri'}],
      focusKeep: ['paraFECG','triABC_parts']
    },

    {
      kind: 'thus',
      statementParts: [
        {t:'And angle '},{t:'CEF', ref:['EC','EF']},{t:' equals the given angle '},{t:'D', ref:['angleD_parts']},{t:'.'}
      ],
      reason: { label:'I.23', kind:'thus', tooltip:'Angle CEF was constructed equal to D.' },
      coach: 'The angle requirement is satisfied by construction.',
      announce: ['angle CEF equals D'],
      highlight: [{id:'EC', mode:'strong'},{id:'EF', mode:'strong'},{id:'rayD1', mode:'strong'},{id:'rayD2', mode:'strong'}],
      focusKeep: ['EF','EC','angleD_parts']
    },

    {
      kind: 'thus',
      statementParts: [
        {t:'Therefore the parallelogram '},{t:'FECG', ref:['paraFECG']},{t:' has been constructed equal to the given triangle '},
        {t:'ABC', ref:['triABC_parts']},{t:' in the angle '},{t:'CEF', ref:['EC','EF']},{t:' equal to '},{t:'D', ref:['angleD_parts']},{t:'. '},
        {t:'Q.E.F.', strong:true}
      ],
      reason: { label:'Q.E.F.', kind:'thus', tooltip:'Construction complete (equal area + correct angle).' },
      coach: 'We built the required parallelogram: equal area and correct angle.',
      announce: ['Q.E.F.'],
      highlight: [{id:'paraFECG', mode:'para'},{id:'triABC_parts', mode:'tri'}],
      focusKeep: ['paraFECG','triABC_parts','angleD_parts'],
      onSelect: () => {
        const stamp = document.getElementById('qed-stamp');
        if (stamp) {
          stamp.textContent = window.LESSON?.meta?.stampText || 'Q.E.D.';
          stamp.classList.remove('hidden');
          stamp.classList.add('stamp-drop');
          stamp.setAttribute('aria-hidden','false');
        }
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion && typeof confetti === 'function') {
          confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });
        }
      },
      onDeselect: () => {
        const stamp = document.getElementById('qed-stamp');
        if (stamp) {
          stamp.classList.add('hidden');
          stamp.classList.remove('stamp-drop');
          stamp.setAttribute('aria-hidden','true');
          stamp.textContent = window.LESSON?.meta?.stampText || 'Q.E.D.';
        }
      }
    }
  ]
};
