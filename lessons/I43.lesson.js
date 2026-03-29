// Lesson: Euclid Book I Proposition 43
// Exposes window.LESSON for the engine loader.
window.LESSON = {
  meta: {
    title: "Euclid's Elements — Book I, Proposition 43",
    subtitle: "In any parallelogram the complements of the parallelograms about the diameter are equal to one another."
  },

  guiding: {
    questionHTML: `In parallelogram <strong>ABCD</strong>, if <strong>AEKH</strong> and <strong>KGCF</strong> are parallelograms about the diameter <strong>AC</strong>, why are the complements <strong>EBGK</strong> and <strong>HKFD</strong> equal in area?`,
    hintsHTML: [
      `<strong>I.34</strong>: The diameter of a parallelogram bisects it into two equal triangles.`,
      `Apply I.34 three times: to <strong>ABCD</strong>, to <strong>AEKH</strong>, and to <strong>KGCF</strong>.`,
      `Subtract the smaller triangles from the larger to get the complements.`
    ]
  },

  diagram: {
    initialHidden: [
      'AC', 'EF', 'HG', 'EK', 'KF', 'HK', 'KG',
      'compEBGK', 'compHKFD',
      'paraAEKH', 'paraKGCF',
      'triABC', 'triACD',
      'triAEK', 'triAHK', 'triKGC', 'triKFC',
      'ptE', 'lblE', 'ptF', 'lblF', 'ptG', 'lblG', 'ptH', 'lblH', 'ptK', 'lblK',
      'explore-handles'
    ]
  },

  explore: {
    enabled: true,
    handlesGroupId: 'explore-handles',
    handles: {
      K: { handleId: 'handleK', ringId: 'handleK_ring', clampX: [180, 470], clampY: [100, 400] }
    },

    onUpdate: (P, Diagram) => {
      // Fixed outer vertices
      const A = { x: 130, y: 80 };
      const B = { x: 70,  y: 440 };
      const C = { x: 520, y: 440 };
      const D = { x: 580, y: 80 };

      // Project P.K onto diagonal AC and clamp t in [0.15, 0.85]
      const dx = C.x - A.x; // 390
      const dy = C.y - A.y; // 360
      const len2 = dx * dx + dy * dy;
      const kx = P.K.x - A.x;
      const ky = P.K.y - A.y;
      let t = (kx * dx + ky * dy) / len2;
      t = Math.max(0.15, Math.min(0.85, t));

      const K = { x: A.x + t * dx, y: A.y + t * dy };

      // E: on AB at same height (y) as K
      const tAB = (K.y - A.y) / (B.y - A.y);
      const E = { x: A.x + tAB * (B.x - A.x), y: K.y };

      // F: on CD at same height as K
      const tCD = (K.y - C.y) / (D.y - C.y);
      const F = { x: C.x + tCD * (D.x - C.x), y: K.y };

      // H: on AD (y=80) along line through K parallel to AB
      // AB direction: (B.x-A.x, B.y-A.y) = (-60, 360)
      const H = {
        x: K.x + ((A.y - K.y) / (B.y - A.y)) * (B.x - A.x),
        y: A.y
      };

      // G: on BC (y=440) along line through K parallel to AB
      const G = {
        x: K.x + ((B.y - K.y) / (B.y - A.y)) * (B.x - A.x),
        y: B.y
      };

      // Keep handle snapped to the projected K
      P.K.x = K.x;
      P.K.y = K.y;

      // Update lines
      Diagram.get('EK')?.setAttribute('x1', E.x);
      Diagram.get('EK')?.setAttribute('y1', E.y);
      Diagram.get('EK')?.setAttribute('x2', K.x);
      Diagram.get('EK')?.setAttribute('y2', K.y);

      Diagram.get('KF')?.setAttribute('x1', K.x);
      Diagram.get('KF')?.setAttribute('y1', K.y);
      Diagram.get('KF')?.setAttribute('x2', F.x);
      Diagram.get('KF')?.setAttribute('y2', F.y);

      Diagram.get('EF')?.setAttribute('x1', E.x);
      Diagram.get('EF')?.setAttribute('y1', E.y);
      Diagram.get('EF')?.setAttribute('x2', F.x);
      Diagram.get('EF')?.setAttribute('y2', F.y);

      Diagram.get('HK')?.setAttribute('x1', H.x);
      Diagram.get('HK')?.setAttribute('y1', H.y);
      Diagram.get('HK')?.setAttribute('x2', K.x);
      Diagram.get('HK')?.setAttribute('y2', K.y);

      Diagram.get('KG')?.setAttribute('x1', K.x);
      Diagram.get('KG')?.setAttribute('y1', K.y);
      Diagram.get('KG')?.setAttribute('x2', G.x);
      Diagram.get('KG')?.setAttribute('y2', G.y);

      Diagram.get('HG')?.setAttribute('x1', H.x);
      Diagram.get('HG')?.setAttribute('y1', H.y);
      Diagram.get('HG')?.setAttribute('x2', G.x);
      Diagram.get('HG')?.setAttribute('y2', G.y);

      // Update complement polygons
      Diagram.get('compEBGK')?.setAttribute('points',
        `${E.x},${E.y} ${B.x},${B.y} ${G.x},${G.y} ${K.x},${K.y}`);
      Diagram.get('compHKFD')?.setAttribute('points',
        `${H.x},${H.y} ${K.x},${K.y} ${F.x},${F.y} ${D.x},${D.y}`);

      // Update inner parallelogram polygons
      Diagram.get('paraAEKH')?.setAttribute('points',
        `${A.x},${A.y} ${E.x},${E.y} ${K.x},${K.y} ${H.x},${H.y}`);
      Diagram.get('paraKGCF')?.setAttribute('points',
        `${K.x},${K.y} ${G.x},${G.y} ${C.x},${C.y} ${F.x},${F.y}`);

      // Update triangle fills
      Diagram.get('triAEK')?.setAttribute('points',
        `${A.x},${A.y} ${E.x},${E.y} ${K.x},${K.y}`);
      Diagram.get('triAHK')?.setAttribute('points',
        `${A.x},${A.y} ${H.x},${H.y} ${K.x},${K.y}`);
      Diagram.get('triKGC')?.setAttribute('points',
        `${K.x},${K.y} ${G.x},${G.y} ${C.x},${C.y}`);
      Diagram.get('triKFC')?.setAttribute('points',
        `${K.x},${K.y} ${F.x},${F.y} ${C.x},${C.y}`);

      // Update inner points
      Diagram.get('ptE')?.setAttribute('cx', E.x);
      Diagram.get('ptE')?.setAttribute('cy', E.y);
      Diagram.get('ptF')?.setAttribute('cx', F.x);
      Diagram.get('ptF')?.setAttribute('cy', F.y);
      Diagram.get('ptG')?.setAttribute('cx', G.x);
      Diagram.get('ptG')?.setAttribute('cy', G.y);
      Diagram.get('ptH')?.setAttribute('cx', H.x);
      Diagram.get('ptH')?.setAttribute('cy', H.y);
      Diagram.get('ptK')?.setAttribute('cx', K.x);
      Diagram.get('ptK')?.setAttribute('cy', K.y);

      // Update labels
      Diagram.get('lblE')?.setAttribute('x', E.x - 22);
      Diagram.get('lblE')?.setAttribute('y', E.y + 6);
      Diagram.get('lblF')?.setAttribute('x', F.x + 6);
      Diagram.get('lblF')?.setAttribute('y', F.y - 10);
      Diagram.get('lblG')?.setAttribute('x', G.x + 4);
      Diagram.get('lblG')?.setAttribute('y', G.y + 22);
      Diagram.get('lblH')?.setAttribute('x', H.x + 4);
      Diagram.get('lblH')?.setAttribute('y', H.y - 10);
      Diagram.get('lblK')?.setAttribute('x', K.x - 18);
      Diagram.get('lblK')?.setAttribute('y', K.y - 8);
    }
  },

  steps: [
    {
      kind: 'given',
      statementParts: [
        { t: 'Let ' },
        { t: 'ABCD', ref: ['paraABCD', 'lblA', 'lblB', 'lblC', 'lblD'] },
        { t: ' be a parallelogram and ' },
        { t: 'AC', ref: ['lblA', 'lblC'] },
        { t: ' its diameter. Let ' },
        { t: 'AEKH', ref: ['EK', 'HK', 'lblA', 'lblE', 'lblK', 'lblH'] },
        { t: ' and ' },
        { t: 'KGCF', ref: ['KG', 'KF', 'lblK', 'lblG', 'lblC', 'lblF'] },
        { t: ' be parallelograms about the diameter. Then ' },
        { t: 'EBGK', ref: ['lblE', 'lblB', 'lblG', 'lblK'] },
        { t: ' and ' },
        { t: 'HKFD', ref: ['lblH', 'lblK', 'lblF', 'lblD'] },
        { t: ' are the complements.' }
      ],
      reason: { label: 'Given (I.43)', kind: 'given' },
      reveal: [
        'ptE', 'lblE', 'ptF', 'lblF', 'ptG', 'lblG', 'ptH', 'lblH', 'ptK', 'lblK',
        'EK', 'KF', 'HK', 'KG'
      ],
      coach: 'ABCD is the outer parallelogram. AEKH and KGCF are smaller parallelograms whose diagonals lie along AC. EBGK and HKFD are the leftover (complement) regions.',
      announce: ['parallelogram ABCD', 'inner parallelograms AEKH and KGCF', 'complements EBGK and HKFD'],
      highlight: [
        { id: 'paraABCD', mode: 'para' },
        { id: 'EK', mode: 'strong' },
        { id: 'KF', mode: 'strong' },
        { id: 'HK', mode: 'strong' },
        { id: 'KG', mode: 'strong' }
      ],
      focusKeep: ['paraABCD']
    },

    {
      kind: 'det',
      statementParts: [
        { t: 'I say that complement ' },
        { t: 'EBGK', ref: ['lblE', 'lblB', 'lblG', 'lblK'] },
        { t: ' equals complement ' },
        { t: 'HKFD', ref: ['lblH', 'lblK', 'lblF', 'lblD'] },
        { t: ' in area.' }
      ],
      reason: { label: 'Determination', kind: 'det' },
      coach: 'We claim the two shaded complement regions are equal in area — even though they look different.',
      announce: ['complement EBGK equals complement HKFD'],
      highlight: [
        { id: 'EK', mode: 'strong' },
        { id: 'KF', mode: 'strong' },
        { id: 'HK', mode: 'strong' },
        { id: 'KG', mode: 'strong' }
      ],
      focusKeep: ['paraABCD']
    },

    {
      kind: 'constr',
      statementParts: [
        { t: 'For ' },
        { t: 'AC', ref: ['AC', 'lblA', 'lblC'] },
        { t: ' is the diameter of parallelogram ' },
        { t: 'ABCD', ref: ['paraABCD'] },
        { t: '.' }
      ],
      reason: { label: 'I.Post.1', kind: 'constr', tooltip: 'To draw a straight line from any point to any point.' },
      reveal: ['AC'],
      coach: 'The diagonal AC is the diameter of ABCD. We draw it explicitly so we can apply I.34 to each of the three parallelograms.',
      announce: ['diagonal AC'],
      highlight: [
        { id: 'AC', mode: 'strong' },
        { id: 'paraABCD', mode: 'para' }
      ],
      focusKeep: ['AC', 'paraABCD'],
      mcq: {
        question: 'Why do we draw the diagonal AC?',
        choices: [
          'To use I.34: a diagonal bisects a parallelogram into two equal triangles.',
          'To prove that ABCD is a parallelogram.',
          'To show that EF is parallel to HG.'
        ],
        correctIndex: 0,
        feedback: [
          'Correct — I.34 will be applied to all three parallelograms.',
          'No — ABCD is given as a parallelogram.',
          'No — the inner parallels are given by construction.'
        ]
      }
    },

    {
      kind: 'prop',
      statementParts: [
        { t: 'Since ' },
        { t: 'ABCD', ref: ['paraABCD'] },
        { t: ' is a parallelogram and ' },
        { t: 'AC', ref: ['AC'] },
        { t: ' its diameter, triangle ' },
        { t: 'ABC', ref: ['triABC', 'lblA', 'lblB', 'lblC'] },
        { t: ' equals triangle ' },
        { t: 'ACD', ref: ['triACD', 'lblA', 'lblC', 'lblD'] },
        { t: '.' }
      ],
      reason: { label: 'I.34', kind: 'prop', tooltip: 'In parallelograms, the diameter bisects them, that is, makes the triangles equal to one another.' },
      reveal: ['triABC', 'triACD'],
      coach: 'I.34 applied to ABCD: the diagonal AC splits ABCD into two triangles of equal area.',
      announce: ['triangle ABC equals triangle ACD in area'],
      highlight: [
        { id: 'triABC', mode: 'tri' },
        { id: 'triACD', mode: 'tri' },
        { id: 'AC', mode: 'strong' }
      ],
      focusKeep: ['AC', 'paraABCD']
    },

    {
      kind: 'prop',
      statementParts: [
        { t: 'Since ' },
        { t: 'AEKH', ref: ['paraAEKH', 'EK', 'HK', 'lblA', 'lblE', 'lblK', 'lblH'] },
        { t: ' is a parallelogram and ' },
        { t: 'AK', ref: ['AC', 'lblA', 'lblK'] },
        { t: ' its diameter, triangle ' },
        { t: 'AEK', ref: ['triAEK', 'lblA', 'lblE', 'lblK'] },
        { t: ' equals triangle ' },
        { t: 'AHK', ref: ['triAHK', 'lblA', 'lblH', 'lblK'] },
        { t: '.' }
      ],
      reason: { label: 'I.34', kind: 'prop', tooltip: 'In parallelograms, the diameter bisects them, that is, makes the triangles equal to one another.' },
      reveal: ['paraAEKH', 'triAEK', 'triAHK'],
      coach: 'I.34 applied to AEKH: the diagonal AK (part of AC) bisects it into two equal triangles AEK and AHK.',
      announce: ['triangle AEK equals triangle AHK in area'],
      highlight: [
        { id: 'triAEK', mode: 'tri' },
        { id: 'triAHK', mode: 'tri' },
        { id: 'paraAEKH', mode: 'para' },
        { id: 'AC', mode: 'strong' }
      ],
      focusKeep: ['AC', 'EK', 'HK']
    },

    {
      kind: 'prop',
      statementParts: [
        { t: 'Since ' },
        { t: 'KGCF', ref: ['paraKGCF', 'KG', 'KF', 'lblK', 'lblG', 'lblC', 'lblF'] },
        { t: ' is a parallelogram and ' },
        { t: 'KC', ref: ['AC', 'lblK', 'lblC'] },
        { t: ' its diameter, triangle ' },
        { t: 'KGC', ref: ['triKGC', 'lblK', 'lblG', 'lblC'] },
        { t: ' equals triangle ' },
        { t: 'KFC', ref: ['triKFC', 'lblK', 'lblF', 'lblC'] },
        { t: '.' }
      ],
      reason: { label: 'I.34', kind: 'prop', tooltip: 'In parallelograms, the diameter bisects them, that is, makes the triangles equal to one another.' },
      reveal: ['paraKGCF', 'triKGC', 'triKFC'],
      coach: 'I.34 applied to KGCF: the diagonal KC (part of AC) bisects it into two equal triangles KGC and KFC.',
      announce: ['triangle KGC equals triangle KFC in area'],
      highlight: [
        { id: 'triKGC', mode: 'tri' },
        { id: 'triKFC', mode: 'tri' },
        { id: 'paraKGCF', mode: 'para' },
        { id: 'AC', mode: 'strong' }
      ],
      focusKeep: ['AC', 'KG', 'KF']
    },

    {
      kind: 'thus',
      statementParts: [
        { t: 'Therefore triangle ' },
        { t: 'AEK', ref: ['triAEK'] },
        { t: ' + triangle ' },
        { t: 'KGC', ref: ['triKGC'] },
        { t: ' = triangle ' },
        { t: 'AHK', ref: ['triAHK'] },
        { t: ' + triangle ' },
        { t: 'KFC', ref: ['triKFC'] },
        { t: ' (adding the equal pairs).' }
      ],
      reason: { label: 'C.N. 2', kind: 'thus', tooltip: 'If equals are added to equals, the wholes are equal.' },
      coach: 'AEK = AHK and KGC = KFC (from I.34). Adding equals to equals gives equal sums.',
      announce: ['AEK plus KGC equals AHK plus KFC'],
      highlight: [
        { id: 'triAEK', mode: 'tri' },
        { id: 'triKGC', mode: 'tri' },
        { id: 'triAHK', mode: 'tri' },
        { id: 'triKFC', mode: 'tri' }
      ],
      focusKeep: ['AC']
    },

    {
      kind: 'thus',
      statementParts: [
        { t: 'Since triangle ' },
        { t: 'ABC', ref: ['triABC'] },
        { t: ' = triangle ' },
        { t: 'ACD', ref: ['triACD'] },
        { t: ', subtracting the equal sums yields: ' },
        { t: 'ABC', ref: ['triABC'] },
        { t: ' − (AEK + KGC) = ' },
        { t: 'ACD', ref: ['triACD'] },
        { t: ' − (AHK + KFC).' }
      ],
      reason: { label: 'C.N. 3', kind: 'thus', tooltip: 'If equals are subtracted from equals, the remainders are equal.' },
      coach: 'ABC = ACD (from step 4). We subtract the smaller equal triangle sums from each. The remainders must be equal.',
      announce: ['remainders after subtraction are equal'],
      highlight: [
        { id: 'triABC', mode: 'tri' },
        { id: 'triACD', mode: 'tri' },
        { id: 'triAEK', mode: 'tri' },
        { id: 'triKGC', mode: 'tri' },
        { id: 'triAHK', mode: 'tri' },
        { id: 'triKFC', mode: 'tri' }
      ],
      focusKeep: ['AC']
    },

    {
      kind: 'thus',
      statementParts: [
        { t: 'But triangle ABC − (AEK + KGC) is complement ' },
        { t: 'EBGK', ref: ['compEBGK', 'lblE', 'lblB', 'lblG', 'lblK'] },
        { t: ', and triangle ACD − (AHK + KFC) is complement ' },
        { t: 'HKFD', ref: ['compHKFD', 'lblH', 'lblK', 'lblF', 'lblD'] },
        { t: '. Therefore ' },
        { t: 'EBGK', ref: ['compEBGK'] },
        { t: ' = ' },
        { t: 'HKFD', ref: ['compHKFD'] },
        { t: '.' }
      ],
      reason: { label: 'Definition', kind: 'thus', tooltip: 'The complement is the part of the large triangle not occupied by the smaller triangles about the diameter.' },
      reveal: ['compEBGK', 'compHKFD'],
      coach: 'The complement EBGK is what remains of triangle ABC after removing triangles AEK and KGC. Likewise for HKFD. Both remainders are equal.',
      announce: ['complement EBGK equals complement HKFD'],
      highlight: [
        { id: 'compEBGK', mode: 'para' },
        { id: 'compHKFD', mode: 'para' }
      ],
      focusKeep: ['compEBGK', 'compHKFD']
    },

    {
      kind: 'thus',
      statementParts: [
        { t: 'Therefore in any parallelogram the complements of the parallelograms about the diameter are equal to one another. ' },
        { t: 'Q.E.D.', strong: true }
      ],
      reason: {
        label: 'Q.E.D.',
        kind: 'thus',
        tooltip: 'Applying I.34 three times and using C.N.2–3, the two complements EBGK and HKFD are proved equal in area.'
      },
      coach: 'The result follows by applying I.34 to each of the three parallelograms and using the common-notion rules of adding and subtracting equals.',
      announce: ['Q.E.D. — complements EBGK and HKFD are equal in area'],
      highlight: [
        { id: 'compEBGK', mode: 'para' },
        { id: 'compHKFD', mode: 'para' },
        { id: 'paraABCD', mode: 'para' }
      ],
      focusKeep: ['compEBGK', 'compHKFD'],
      onSelect: () => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion && typeof confetti === 'function') {
          confetti({
            particleCount: 140,
            spread: 85,
            origin: { y: 0.6 },
            colors: ['#2b6cb0', '#d97706', '#16a34a', '#7c3aed']
          });
        }
        const stamp = document.getElementById('qed-stamp');
        if (stamp) {
          stamp.classList.remove('hidden');
          stamp.classList.add('stamp-drop');
          stamp.setAttribute('aria-hidden', 'false');
        }
      },
      onDeselect: () => {
        const stamp = document.getElementById('qed-stamp');
        if (stamp) {
          stamp.classList.add('hidden');
          stamp.classList.remove('stamp-drop');
          stamp.setAttribute('aria-hidden', 'true');
        }
      }
    }
  ]
};
