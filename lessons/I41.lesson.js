// Lesson: Euclid Book I Proposition 41
// Exposes window.LESSON for the engine loader.
window.LESSON = {
  meta: {
    title: "Euclid’s Elements — Book I, Proposition 41",
    subtitle: "A parallelogram on the same base with a triangle and in the same parallels is double the triangle."
  },

  guiding: {
    questionHTML: `If a <strong>parallelogram</strong> and a <strong>triangle</strong> share the same base and lie between the same parallels, why is the parallelogram <strong>double</strong> the triangle?`,
    hintsHTML: [
      `<strong>I.37</strong>: Triangles on the same base and in the same parallels are equal (in area).`,
      `<strong>I.34</strong>: A diagonal bisects a parallelogram; each half-triangle is equal in area.`
    ]
  },

  diagram: {
    initialHidden: ['AC', 'explore-handles']
  },

  explore: {
    enabled: true,
    handlesGroupId: 'explore-handles',
    handles: {
      E: { handleId: 'handleE', ringId: 'handleE_ring', clampX: [90, 330], clampY: [140, 140] }
    },

    onUpdate: (P, Diagram) => {
      const B = { x: 220, y: 380 };
      const C = { x: 460, y: 380 };
      const yTop = 140;

      const E = P.E;

      // Keep the handle pinned on the top parallel
      E.y = yTop;

      // Update triangle EBC
      Diagram.get('EB')?.setAttribute('x1', E.x);
      Diagram.get('EB')?.setAttribute('y1', E.y);

      Diagram.get('EC')?.setAttribute('x1', E.x);
      Diagram.get('EC')?.setAttribute('y1', E.y);

      // Update label E
      Diagram.get('lblE')?.setAttribute('x', E.x - 6);
      Diagram.get('lblE')?.setAttribute('y', E.y - 10);

      // Optional: keep an (invisible) helper point for accessibility/selection consistency
      Diagram.get('ptE')?.setAttribute('cx', E.x);
      Diagram.get('ptE')?.setAttribute('cy', E.y);
    }
  },

  steps: [
    {
      kind: 'given',
      statementParts: [
        { t: 'Let the parallelogram ' },
        { t: 'ABCD', ref: ['paraABCD', 'lblA', 'lblB', 'lblC', 'lblD'] },
        { t: ' have the same base ' },
        { t: 'BC', ref: ['BC', 'lblB', 'lblC'] },
        { t: ' with the triangle ' },
        { t: 'EBC', ref: ['triE_parts', 'lblE', 'lblB', 'lblC'] },
        { t: ', and let them be in the same parallels ' },
        { t: 'BC', ref: ['BC'] },
        { t: ' and ' },
        { t: 'AE', ref: ['lineAE', 'lblA', 'lblE'] },
        { t: '.' }
      ],
      reason: { label: 'Given (I.41)', kind: 'given' },
      coach: 'We are given a parallelogram and a triangle on the same base BC, between the same parallels BC and AE.',
      announce: ['base BC', 'parallel AE', 'parallelogram ABCD', 'triangle EBC'],
      highlight: [
        { id: 'BC', mode: 'strong' },
        { id: 'lineAE', mode: 'strong' },
        { id: 'paraABCD', mode: 'para' },
        { id: 'triE_parts', mode: 'tri' }
      ],
      focusKeep: ['BC', 'lineAE']
    },

    {
      kind: 'det',
      statementParts: [
        { t: 'I say that the parallelogram ' },
        { t: 'ABCD', ref: ['paraABCD'] },
        { t: ' is ' },
        { t: 'double', strong: true },
        { t: ' the triangle ' },
        { t: 'EBC', ref: ['triE_parts'] },
        { t: ' (in area).' }
      ],
      reason: { label: 'Determination', kind: 'det' },
      coach: 'This is an area ratio claim: area(ABCD) = 2 × area(EBC).',
      announce: ['parallelogram ABCD', 'triangle EBC'],
      highlight: [
        { id: 'paraABCD', mode: 'para' },
        { id: 'triE_parts', mode: 'tri' }
      ],
      focusKeep: ['BC', 'lineAE']
    },

    {
      kind: 'constr',
      statementParts: [
        { t: 'Join ' },
        { t: 'AC', ref: ['AC', 'lblA', 'lblC'] },
        { t: '.' }
      ],
      reason: { label: 'I.Post.1', kind: 'constr', tooltip: 'To draw a straight line from any point to any point.' },
      reveal: ['AC'],
      coach: 'Drawing the diagonal AC will let us relate the parallelogram to a triangle (I.34).',
      announce: ['diagonal AC'],
      highlight: [
        { id: 'AC', mode: 'strong' },
        { id: 'paraABCD', mode: 'para' }
      ],
      focusKeep: ['BC', 'lineAE'],
      mcq: {
        question: 'What is the purpose of joining AC?',
        choices: [
          'To use the fact that a diagonal bisects a parallelogram into two equal triangles.',
          'To show BC is parallel to AE.',
          'To mark BC and AE as equal in length.'
        ],
        correctIndex: 0,
        feedback: [
          'Yes—this sets up I.34 (the diagonal bisects the parallelogram).',
          'No—the parallels are given, not proved here.',
          'No—this proposition is about area, not equal lengths of BC and AE.'
        ]
      }
    },

    {
      kind: 'prop',
      statementParts: [
        { t: 'Then triangle ' },
        { t: 'ABC', ref: ['AB', 'BC', 'AC'] },
        { t: ' equals triangle ' },
        { t: 'EBC', ref: ['triE_parts'] },
        { t: ' in area, for they are on the same base ' },
        { t: 'BC', ref: ['BC'] },
        { t: ' and in the same parallels ' },
        { t: 'BC', ref: ['BC'] },
        { t: ' and ' },
        { t: 'AE', ref: ['lineAE'] },
        { t: '.' }
      ],
      reason: { label: 'I.37', kind: 'prop', tooltip: 'Triangles on the same base and in the same parallels are equal to one another (in area).' },
      coach: 'Triangles ABC and EBC share base BC, and A and E lie on the same line AE parallel to BC.',
      announce: ['triangle ABC equals triangle EBC in area'],
      highlight: [
        { id: 'AB', mode: 'tri' },
        { id: 'BC', mode: 'tri' },
        { id: 'AC', mode: 'tri' },
        { id: 'triE_parts', mode: 'tri' },
        { id: 'lineAE', mode: 'strong' }
      ],
      focusKeep: ['BC', 'lineAE']
    },

    {
      kind: 'prop',
      statementParts: [
        { t: 'But the parallelogram ' },
        { t: 'ABCD', ref: ['paraABCD'] },
        { t: ' is double the triangle ' },
        { t: 'ABC', ref: ['AB', 'BC', 'AC'] },
        { t: ', for the diagonal ' },
        { t: 'AC', ref: ['AC'] },
        { t: ' bisects the parallelogram; therefore the parallelogram ' },
        { t: 'ABCD', ref: ['paraABCD'] },
        { t: ' is also double the triangle ' },
        { t: 'EBC', ref: ['triE_parts'] },
        { t: '.' }
      ],
      reason: { label: 'I.34', kind: 'prop', tooltip: 'In a parallelogram, the diagonal bisects the area (each triangle is half the parallelogram).' },
      coach: 'I.34 gives area(ABCD) = 2·area(ABC). Since area(ABC)=area(EBC) by I.37, the result follows.',
      announce: ['diagonal AC bisects parallelogram', 'double-area conclusion'],
      highlight: [
        { id: 'paraABCD', mode: 'para' },
        { id: 'AC', mode: 'strong' },
        { id: 'AB', mode: 'tri' },
        { id: 'BC', mode: 'tri' },
        { id: 'CD', mode: 'strong' },
        { id: 'AD', mode: 'strong' },
        { id: 'triE_parts', mode: 'tri' }
      ],
      focusKeep: ['BC', 'lineAE']
    },

    {
      kind: 'thus',
      statementParts: [
        { t: 'Therefore, if a parallelogram has the same base with a triangle and is in the same parallels, then the parallelogram is double the triangle. ' },
        { t: 'Q.E.D.', strong: true }
      ],
      reason: {
        label: 'Q.E.D.',
        kind: 'thus',
        tooltip: 'From I.37 (equal triangles in same parallels) and I.34 (diagonal bisects a parallelogram), the area ratio is 2:1.'
      },
      coach: 'The parallelogram is twice triangle ABC, and triangle ABC equals triangle EBC, so the parallelogram is twice triangle EBC.',
      announce: ['parallelogram ABCD is double triangle EBC'],
      highlight: [
        { id: 'paraABCD', mode: 'para' },
        { id: 'triE_parts', mode: 'tri' },
        { id: 'BC', mode: 'strong' },
        { id: 'lineAE', mode: 'strong' }
      ],
      focusKeep: ['BC', 'lineAE'],
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
