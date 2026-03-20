// Lesson: Euclid Book I Proposition 42
// Exposes window.LESSON for the engine loader.
window.LESSON = {
  meta: {
    title: "Euclid’s Elements — Book I, Proposition 42",
    subtitle: "To construct a parallelogram equal to a given triangle in a given rectilinear angle."
  },

  guiding: {
    questionHTML: `
      You are given a triangle <strong>ABC</strong> and a rectilinear angle <strong>D</strong>.
      How can you build a parallelogram in an angle equal to <strong>D</strong> whose area equals the triangle?
    `,
    hintsHTML: [
      `<strong>I.10</strong>: Bisect the base <strong>BC</strong> at <strong>E</strong>, then join <strong>AE</strong>.`,
      `<strong>I.23</strong>: Copy the given angle <strong>D</strong> at point <strong>E</strong> to make angle <strong>CEF</strong>.`,
      `<strong>I.31</strong>: Use parallels through <strong>A</strong> and <strong>C</strong> to complete a parallelogram <strong>FECG</strong>.`,
      `<hr style="border:none;border-top:1px solid rgba(0,0,0,.15);margin:.6rem 0;">`,
      `
      <h3 style="margin:.2rem 0 .4rem;color:var(--accent);">Summary (low cognitive load)</h3>
      <div style="display:grid;gap:.7rem;">
        <div style="padding:.75rem .9rem;background:#f7f7f9;border-left:4px solid #4a90e2;border-radius:6px;">
          <div style="font-weight:900;margin-bottom:.2rem;">1) Cut the triangle into two equal halves.</div>
          <div>Bisect <strong>BC</strong> at <strong>E</strong> and join <strong>AE</strong>. This splits triangle <strong>ABC</strong> into triangles <strong>ABE</strong> and <strong>AEC</strong>, which are equal in area (I.38).</div>
        </div>
        <div style="padding:.75rem .9rem;background:#f7f7f9;border-left:4px solid #7ed321;border-radius:6px;">
          <div style="font-weight:900;margin-bottom:.2rem;">2) Build a parallelogram that is double one half.</div>
          <div>Copy the given angle <strong>D</strong> at <strong>E</strong> to make <strong>∠CEF</strong>, then draw parallels to form parallelogram <strong>FECG</strong>. By I.41, the parallelogram is double triangle <strong>AEC</strong>.</div>
        </div>
        <div style="padding:.75rem .9rem;background:#f7f7f9;border-left:4px solid #f5a623;border-radius:6px;">
          <div style="font-weight:900;margin-bottom:.2rem;">3) Match the “double” facts to get equality.</div>
          <div>Triangle <strong>ABC</strong> is double triangle <strong>AEC</strong>, and parallelogram <strong>FECG</strong> is also double triangle <strong>AEC</strong>. So the parallelogram equals the original triangle (Common Notion 1).</div>
        </div>
      </div>
      `
    ]
  },

  diagram: {
    initialHidden: [
      'ptE','lblE','tickBE','tickEC',
      'AE','EF','AG','CG','FG',
      'ptF','lblF','ptG','lblG',
      'paraFECG','AC',
      'explore-handles'
    ]
  },

  explore: {
    enabled: true,
    handlesGroupId: 'explore-handles',
    handles: {
      A: { handleId: 'handleA', ringId: 'handleA_ring', clampX: [180, 320], clampY: [90, 220] }
    },

    // Dragging A changes the construction height; the parallelogram updates to stay equal-area.
    onUpdate: (P, Diagram) => {
      const B = { x: 150, y: 380 };
      const C = { x: 370, y: 380 };
      const E = { x: 260, y: 380 };

      // direction of EF (fixed “copied angle” direction)
      // chosen so EF meets the line AG through A: dy negative (up), dx positive (right)
      const dir = { dx: 170, dy: -240 };

      const A = P.A;

      // AG is the horizontal line through A (parallel to EC, which is horizontal)
      const yAG = A.y;

      // Intersection F of the ray from E in direction dir with y = yAG
      const tE = (yAG - E.y) / dir.dy; // dir.dy < 0, yAG < E.y => positive
      const F = { x: E.x + tE * dir.dx, y: yAG };

      // Intersection G of line through C parallel to EF with y = yAG
      const tC = (yAG - C.y) / dir.dy;
      const G = { x: C.x + tC * dir.dx, y: yAG };

      // Update triangle sides AB and AC
      Diagram.get('AB')?.setAttribute('x1', A.x);
      Diagram.get('AB')?.setAttribute('y1', A.y);

      Diagram.get('AC')?.setAttribute('x1', A.x);
      Diagram.get('AC')?.setAttribute('y1', A.y);

      // Update median AE
      Diagram.get('AE')?.setAttribute('x1', A.x);
      Diagram.get('AE')?.setAttribute('y1', A.y);

      // Update diagonal AC (if visible)
      Diagram.get('AC')?.setAttribute('x1', A.x);
      Diagram.get('AC')?.setAttribute('y1', A.y);

      // Update line AG (through A, horizontal)
      Diagram.get('AG')?.setAttribute('y1', yAG);
      Diagram.get('AG')?.setAttribute('y2', yAG);

      // Update EF (E -> F)
      Diagram.get('EF')?.setAttribute('x2', F.x);
      Diagram.get('EF')?.setAttribute('y2', F.y);

      // Update CG (C -> G)
      Diagram.get('CG')?.setAttribute('x2', G.x);
      Diagram.get('CG')?.setAttribute('y2', G.y);

      // Update FG (F -> G)
      Diagram.get('FG')?.setAttribute('x1', F.x);
      Diagram.get('FG')?.setAttribute('y1', F.y);
      Diagram.get('FG')?.setAttribute('x2', G.x);
      Diagram.get('FG')?.setAttribute('y2', G.y);

      // Update parallelogram polygon (F-E-C-G)
      Diagram.get('paraFECG')?.setAttribute(
        'points',
        `${F.x},${F.y} ${E.x},${E.y} ${C.x},${C.y} ${G.x},${G.y}`
      );

      // Labels + points
      Diagram.get('lblA')?.setAttribute('x', A.x - 12);
      Diagram.get('lblA')?.setAttribute('y', A.y - 12);

      Diagram.get('ptF')?.setAttribute('cx', F.x);
      Diagram.get('ptF')?.setAttribute('cy', F.y);
      Diagram.get('lblF')?.setAttribute('x', F.x + 6);
      Diagram.get('lblF')?.setAttribute('y', F.y - 10);

      Diagram.get('ptG')?.setAttribute('cx', G.x);
      Diagram.get('ptG')?.setAttribute('cy', G.y);
      Diagram.get('lblG')?.setAttribute('x', G.x + 6);
      Diagram.get('lblG')?.setAttribute('y', G.y - 10);
    }
  },

  steps: [
    {
      kind: 'given',
      statementParts: [
        { t: 'Let ' },
        { t: 'ABC', ref: ['triABC_parts','lblA','lblB','lblC'] },
        { t: ' be the given triangle, and ' },
        { t: 'D', ref: ['angleD_parts','lblD'] },
        { t: ' the given rectilinear angle.' }
      ],
      reason: { label: 'Given (I.42)', kind: 'given' },
      coach: 'We are given a triangle (area target) and a separate angle (shape constraint).',
      announce: ['triangle ABC', 'given angle D'],
      highlight: [
        { id: 'triABC_parts', mode: 'tri' },
        { id: 'angleD_parts', mode: 'strong' }
      ],
      focusKeep: ['BC','angleD_parts']
    },

    {
      kind: 'det',
      statementParts: [
        { t: 'It is required to construct at ' },
        { t: 'E', ref: ['ptE'] },
        { t: ' a parallelogram equal to triangle ' },
        { t: 'ABC', ref: ['triABC_parts'] },
        { t: ' in an angle equal to the given angle ' },
        { t: 'D', ref: ['angleD_parts'] },
        { t: '.' }
      ],
      reason: { label: 'Determination', kind: 'det' },
      coach: 'We must match BOTH: (1) area equals triangle ABC, and (2) one angle equals the given angle D.',
      announce: ['goal: equal area', 'goal: given angle'],
      highlight: [
        { id: 'triABC_parts', mode: 'tri' },
        { id: 'angleD_parts', mode: 'strong' }
      ],
      focusKeep: ['BC']
    },

    {
      kind: 'constr',
      statementParts: [
        { t: 'Bisect ' },
        { t: 'BC', ref: ['BC','BE','EC','lblB','lblC'] },
        { t: ' at ' },
        { t: 'E', ref: ['ptE','lblE'] },
        { t: '.' }
      ],
      reason: { label: 'I.10', kind: 'constr', tooltip: 'To bisect a given finite straight line.' },
      reveal: ['ptE','lblE','tickBE','tickEC'],
      coach: 'Midpoint E lets us compare triangles on equal bases BE and EC later (I.38).',
      announce: ['midpoint E'],
      highlight: [
        { id: 'BE', mode: 'strong' }, { id: 'EC', mode: 'strong' },
        { id: 'tickBE', mode: 'strong' }, { id: 'tickEC', mode: 'strong' }
      ],
      focusKeep: ['BC']
    },

    {
      kind: 'constr',
      statementParts: [
        { t: 'Join ' },
        { t: 'AE', ref: ['AE','lblA','ptE','lblE'] },
        { t: '.' }
      ],
      reason: { label: 'I.Post.1', kind: 'constr', tooltip: 'To draw a straight line from any point to any point.' },
      reveal: ['AE'],
      coach: 'AE splits triangle ABC into two triangles ABE and AEC.',
      announce: ['segment AE'],
      highlight: [
        { id: 'AE', mode: 'strong' },
        { id: 'triABC_parts', mode: 'tri' }
      ],
      focusKeep: ['BC'],
      mcq: {
        question: 'Which postulate justifies drawing the segment AE?',
        choices: [
          'Postulate 1: draw a straight line from any point to any point.',
          'Proposition I.31: draw a parallel through a point.',
          'Proposition I.10: bisect a segment.'
        ],
        correctIndex: 0,
        feedback: [
          'Correct: joining A to E is exactly Postulate 1.',
          'No: parallels are used later for AG and CG.',
          'No: bisection was used in the previous step.'
        ]
      }
    },

    {
      kind: 'constr',
      statementParts: [
        { t: 'Construct the angle ' },
        { t: 'CEF', ref: ['EC','EF','lblE','lblC','lblF'] },
        { t: ' on the line ' },
        { t: 'EC', ref: ['EC'] },
        { t: ' equal to the given angle ' },
        { t: 'D', ref: ['angleD_parts','lblD'] },
        { t: '.' }
      ],
      reason: { label: 'I.23', kind: 'constr', tooltip: 'On a given straight line and at a point on it, to construct an angle equal to a given rectilinear angle.' },
      reveal: ['EF','ptF','lblF'],
      coach: 'This forces our final parallelogram to have an angle matching the given angle D.',
      announce: ['angle CEF copied from D'],
      highlight: [
        { id: 'EF', mode: 'strong' }, { id: 'EC', mode: 'strong' },
        { id: 'rayD1', mode: 'strong' }, { id: 'rayD2', mode: 'strong' }
      ],
      focusKeep: ['EC','angleD_parts'],
      mcq: {
        question: 'Which proposition lets us copy angle D at point E?',
        choices: [
          'I.23 (copy an angle onto a given line at a point).',
          'I.10 (bisect a segment).',
          'I.41 (parallelogram double a triangle).'
        ],
        correctIndex: 0,
        feedback: [
          'Correct: I.23 is the angle-copy construction.',
          'No: I.10 bisects BC but does not copy angles.',
          'No: I.41 is an area theorem, not an angle construction.'
        ]
      }
    },

    {
      kind: 'constr',
      statementParts: [
        { t: 'Draw ' },
        { t: 'AG', ref: ['AG','lblA','lblG'] },
        { t: ' through A parallel to ' },
        { t: 'EC', ref: ['EC'] },
        { t: ', and draw ' },
        { t: 'CG', ref: ['CG','lblC','lblG'] },
        { t: ' through C parallel to ' },
        { t: 'EF', ref: ['EF'] },
        { t: '.' }
      ],
      reason: { label: 'I.31', kind: 'constr', tooltip: 'Through a given point, to draw a straight line parallel to a given straight line.' },
      reveal: ['AG','CG','ptG','lblG'],
      coach: 'These parallels set up the sides of the desired parallelogram in the copied angle.',
      announce: ['AG ∥ EC', 'CG ∥ EF'],
      highlight: [
        { id: 'AG', mode: 'strong' }, { id: 'EC', mode: 'strong' },
        { id: 'CG', mode: 'strong' }, { id: 'EF', mode: 'strong' }
      ],
      focusKeep: ['EC','EF']
    },

    {
      kind: 'def',
      statementParts: [
        { t: 'Then ' },
        { t: 'FECG', ref: ['paraFECG','FG','EF','EC','CG','lblF','lblE','lblC','lblG'] },
        { t: ' is a parallelogram.' }
      ],
      reason: { label: 'Definition', kind: 'def', tooltip: 'A quadrilateral with both pairs of opposite sides parallel is a parallelogram.' },
      reveal: ['FG','paraFECG'],
      coach: 'Opposite sides are parallel by construction: EC ∥ FG and EF ∥ CG.',
      announce: ['parallelogram FECG'],
      highlight: [
        { id: 'paraFECG', mode: 'para' },
        { id: 'EC', mode: 'strong' }, { id: 'FG', mode: 'strong' },
        { id: 'EF', mode: 'strong' }, { id: 'CG', mode: 'strong' }
      ],
      focusKeep: ['paraFECG']
    },

    {
      kind: 'prop',
      statementParts: [
        { t: 'Since ' },
        { t: 'BE', ref: ['BE'] },
        { t: ' equals ' },
        { t: 'EC', ref: ['EC'] },
        { t: ', triangle ' },
        { t: 'ABE', ref: ['AB','AE','BE'] },
        { t: ' equals triangle ' },
        { t: 'AEC', ref: ['AC','AE','EC'] },
        { t: ' in area (same parallels).' }
      ],
      reason: { label: 'I.38', kind: 'prop', tooltip: 'Triangles on equal bases and in the same parallels are equal in area.' },
      coach: 'With E the midpoint, BE=EC. Triangles ABE and AEC share the same height (between BC and AG), so they are equal in area.',
      announce: ['triangle ABE equals triangle AEC (area)'],
      highlight: [
        { id: 'AE', mode: 'strong' },
        { id: 'AB', mode: 'tri' }, { id: 'BE', mode: 'tri' },
        { id: 'AC', mode: 'tri' }, { id: 'EC', mode: 'tri' },
        { id: 'BC', mode: 'strong' }, { id: 'AG', mode: 'strong' }
      ],
      focusKeep: ['AE','BC','AG']
    },

    {
      kind: 'thus',
      statementParts: [
        { t: 'Therefore triangle ' },
        { t: 'ABC', ref: ['triABC_parts'] },
        { t: ' is ' },
        { t: 'double', strong: true },
        { t: ' triangle ' },
        { t: 'AEC', ref: ['AC','AE','EC'] },
        { t: '.' }
      ],
      reason: { label: 'Therefore', kind: 'thus', tooltip: 'Triangle ABC is made of two equal-area triangles ABE and AEC, so it is double AEC.' },
      coach: 'ABC is the sum of two equal halves (ABE and AEC), so ABC is double AEC.',
      announce: ['triangle ABC is double triangle AEC'],
      highlight: [
        { id: 'triABC_parts', mode: 'tri' },
        { id: 'AE', mode: 'strong' }
      ],
      focusKeep: ['triABC_parts','AE']
    },

    {
      kind: 'prop',
      statementParts: [
        { t: 'But parallelogram ' },
        { t: 'FECG', ref: ['paraFECG'] },
        { t: ' is also ' },
        { t: 'double', strong: true },
        { t: ' triangle ' },
        { t: 'AEC', ref: ['AC','AE','EC'] },
        { t: ' (same base ' },
        { t: 'EC', ref: ['EC'] },
        { t: ' and same parallels).' }
      ],
      reason: { label: 'I.41', kind: 'prop', tooltip: 'A parallelogram on the same base with a triangle and in the same parallels is double the triangle.' },
      coach: 'FECG and triangle AEC share base EC and lie between EC and the top parallel (AG/FG), so the parallelogram is double the triangle.',
      announce: ['parallelogram FECG is double triangle AEC'],
      highlight: [
        { id: 'paraFECG', mode: 'para' },
        { id: 'EC', mode: 'strong' },
        { id: 'AE', mode: 'tri' }, { id: 'AC', mode: 'tri' }
      ],
      focusKeep: ['paraFECG','EC']
    },

    {
      kind: 'thus',
      statementParts: [
        { t: 'Therefore parallelogram ' },
        { t: 'FECG', ref: ['paraFECG'] },
        { t: ' equals triangle ' },
        { t: 'ABC', ref: ['triABC_parts'] },
        { t: ' in area.' }
      ],
      reason: { label: 'C.N. 1', kind: 'thus', tooltip: 'Things equal to the same thing are equal to one another.' },
      coach: 'Both are double triangle AEC, so they are equal to each other.',
      announce: ['parallelogram equals given triangle (area)'],
      highlight: [
        { id: 'paraFECG', mode: 'para' },
        { id: 'triABC_parts', mode: 'tri' }
      ],
      focusKeep: ['paraFECG','triABC_parts']
    },

    {
      kind: 'thus',
      statementParts: [
        { t: 'And angle ' },
        { t: 'CEF', ref: ['EC','EF'] },
        { t: ' equals the given angle ' },
        { t: 'D', ref: ['angleD_parts'] },
        { t: '.' }
      ],
      reason: { label: 'I.23', kind: 'thus', tooltip: 'By construction, we made ∠CEF equal to the given angle D.' },
      coach: 'We copied the given angle D at E, so the parallelogram is built in the required angle.',
      announce: ['constructed angle matches D'],
      highlight: [
        { id: 'EC', mode: 'strong' }, { id: 'EF', mode: 'strong' },
        { id: 'rayD1', mode: 'strong' }, { id: 'rayD2', mode: 'strong' }
      ],
      focusKeep: ['EF','EC','angleD_parts']
    },

    {
      kind: 'thus',
      statementParts: [
        { t: 'Therefore the parallelogram ' },
        { t: 'FECG', ref: ['paraFECG'] },
        { t: ' has been constructed equal to the given triangle ' },
        { t: 'ABC', ref: ['triABC_parts'] },
        { t: ' in the angle ' },
        { t: 'CEF', ref: ['EC','EF'] },
        { t: ' which equals ' },
        { t: 'D', ref: ['angleD_parts'] },
        { t: '. ' },
        { t: 'Q.E.F.', strong: true }
      ],
      reason: { label: 'Q.E.F.', kind: 'thus', tooltip: 'Construction complete: equal area and correct angle.' },
      coach: 'We achieved both constraints: equal area to triangle ABC and angle CEF matching the given angle D.',
      announce: ['Q.E.F.'],
      highlight: [
        { id: 'paraFECG', mode: 'para' },
        { id: 'triABC_parts', mode: 'tri' },
        { id: 'EC', mode: 'strong' }, { id: 'EF', mode: 'strong' }
      ],
      focusKeep: ['paraFECG','triABC_parts','angleD_parts'],
      onSelect: () => {
        // Show stamp, but change its text to Q.E.F. for this proposition
        const stamp = document.getElementById('qed-stamp');
        if (stamp) {
          stamp.textContent = 'Q.E.F.';
          stamp.classList.remove('hidden');
          stamp.classList.add('stamp-drop');
          stamp.setAttribute('aria-hidden', 'false');
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
          stamp.setAttribute('aria-hidden', 'true');
          stamp.textContent = 'Q.E.D.'; // reset default text
        }
      }
    }
  ]
};
