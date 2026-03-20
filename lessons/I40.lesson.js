// Lesson: Euclid Book I Proposition 40
window.LESSON = {
  meta: {
    title: "Euclid’s Elements — Book I, Proposition 40",
    subtitle: "Equal triangles on equal bases and on the same side are in the same parallels."
  },

  guiding: {
    questionHTML: `If two equal triangles stand on equal bases <strong>BC</strong> and <strong>CE</strong> on the same side, what must be true about the line joining their vertices <strong>A</strong> and <strong>D</strong> relative to <strong>BE</strong>?`,
    hintsHTML: [
      `<strong>I.38</strong>: Triangles on equal bases and in the same parallels are equal in area.`,
      `<strong>C.N. 1</strong>: Things equal to the same thing are equal to one another.`,
      `<strong>C.N. 5</strong>: The whole is greater than the part (used for contradiction).`
    ]
  },

  diagram: {
    initialHidden: [
      "AD",
      "AF",
      "DF",
      "FE",
      "FC",
      "ptF",
      "lblF",
      "explore-handles"
    ]
  },

  explore: {
    enabled: true,
    handlesGroupId: "explore-handles",
    handles: {
      A: { handleId: "handleA", ringId: "handleA_ring", clampX: [230, 330], clampY: [90, 160] },
      D: { handleId: "handleD", ringId: "handleD_ring", clampX: [400, 500], clampY: [170, 240] }
    },

    onUpdate: (P, Diagram) => {
      try {
        const EPS = 0.001;

        const B = { x: 200, y: 360 };
        const C = { x: 360, y: 360 };
        const E = { x: 520, y: 360 };

        let A = { ...P.A };
        let D = { ...P.D };

        // Keep A above D so AF meets DE produced (beyond D)
        if (A.y >= D.y - 20) A.y = D.y - 20;

        // Prevent DE horizontal degeneracy
        if (Math.abs(E.y - D.y) < EPS) D.y = E.y - 20;

        // F = intersection of DE (produced) with horizontal through A (AF)
        const u = (A.y - D.y) / (E.y - D.y);
        const F = { x: D.x + u * (E.x - D.x), y: A.y };

        // Update triangle ABC
        Diagram.get("AB")?.setAttribute("x1", A.x);
        Diagram.get("AB")?.setAttribute("y1", A.y);
        Diagram.get("AC")?.setAttribute("x1", A.x);
        Diagram.get("AC")?.setAttribute("y1", A.y);

        // Update triangle DCE
        Diagram.get("DC")?.setAttribute("x1", D.x);
        Diagram.get("DC")?.setAttribute("y1", D.y);
        Diagram.get("DE")?.setAttribute("x1", D.x);
        Diagram.get("DE")?.setAttribute("y1", D.y);

        // AD
        Diagram.get("AD")?.setAttribute("x1", A.x);
        Diagram.get("AD")?.setAttribute("y1", A.y);
        Diagram.get("AD")?.setAttribute("x2", D.x);
        Diagram.get("AD")?.setAttribute("y2", D.y);

        // AF full width
        const AF = Diagram.get("AF");
        if (AF) {
          AF.setAttribute("x1", 0);
          AF.setAttribute("x2", 840);
          AF.setAttribute("y1", A.y);
          AF.setAttribute("y2", A.y);
        }

        // DF (DE produced)
        Diagram.get("DF")?.setAttribute("x1", D.x);
        Diagram.get("DF")?.setAttribute("y1", D.y);
        Diagram.get("DF")?.setAttribute("x2", F.x);
        Diagram.get("DF")?.setAttribute("y2", F.y);

        // FE and FC
        Diagram.get("FE")?.setAttribute("x1", F.x);
        Diagram.get("FE")?.setAttribute("y1", F.y);
        Diagram.get("FE")?.setAttribute("x2", E.x);
        Diagram.get("FE")?.setAttribute("y2", E.y);

        Diagram.get("FC")?.setAttribute("x1", F.x);
        Diagram.get("FC")?.setAttribute("y1", F.y);
        Diagram.get("FC")?.setAttribute("x2", C.x);
        Diagram.get("FC")?.setAttribute("y2", C.y);

        // Sync handles (if we adjusted A)
        Diagram.get("handleA")?.setAttribute("cx", A.x);
        Diagram.get("handleA")?.setAttribute("cy", A.y);
        Diagram.get("handleA_ring")?.setAttribute("cx", A.x);
        Diagram.get("handleA_ring")?.setAttribute("cy", A.y);

        Diagram.get("handleD")?.setAttribute("cx", D.x);
        Diagram.get("handleD")?.setAttribute("cy", D.y);
        Diagram.get("handleD_ring")?.setAttribute("cx", D.x);
        Diagram.get("handleD_ring")?.setAttribute("cy", D.y);

        // Labels
        Diagram.get("lblA")?.setAttribute("x", A.x - 6);
        Diagram.get("lblA")?.setAttribute("y", A.y - 10);
        Diagram.get("lblD")?.setAttribute("x", D.x - 6);
        Diagram.get("lblD")?.setAttribute("y", D.y - 10);

        Diagram.get("ptF")?.setAttribute("cx", F.x);
        Diagram.get("ptF")?.setAttribute("cy", F.y);
        Diagram.get("lblF")?.setAttribute("x", F.x + 7);
        Diagram.get("lblF")?.setAttribute("y", F.y - 10);
      } catch (e) {
        console.error("I40 explore.onUpdate error:", e);
      }
    }
  },

  steps: [
    {
      kind: "constr",
      statementParts: [
        { t: "Exposition. Let " },
        { t: "ABC", ref: ["triABC", "lblA", "lblB", "lblC"] },
        { t: " and " },
        { t: "DCE", ref: ["triDCE", "lblD", "lblC", "lblE"] },
        { t: " be equal triangles on equal bases " },
        { t: "BC", ref: ["BC", "lblB", "lblC"] },
        { t: " and " },
        { t: "CE", ref: ["CE", "lblC", "lblE"] },
        { t: " and on the same side of " },
        { t: "BE", ref: ["BE", "lblB", "lblE"] },
        { t: "." }
      ],
      reason: { label: "Exposition", kind: "constr", tooltip: "We set out the given configuration." },
      coach: "We are given two equal-area triangles on equal bases BC and CE, on the same side of the line BE.",
      announce: ["triangles ABC and DCE", "bases BC and CE", "line BE"],
      highlight: [
        { id: "BC", mode: "strong" },
        { id: "CE", mode: "strong" },
        { id: "BE", mode: "strong" },
        { id: "AB", mode: "tri" }, { id: "AC", mode: "tri" },
        { id: "DC", mode: "tri" }, { id: "DE", mode: "tri" }
      ],
      focusKeep: ["BE"]
    },

    {
      kind: "det",
      statementParts: [
        { t: "I say that " },
        { t: "AD", ref: ["AD"] },
        { t: " is parallel to " },
        { t: "BE", ref: ["BE"] },
        { t: "." }
      ],
      reason: { label: "Determination (I.40)", kind: "det" },
      coach: "Goal: show the segment joining the two vertices is parallel to the line containing the bases.",
      announce: ["AD", "BE"],
      highlight: [{ id: "AD", mode: "strong" }, { id: "BE", mode: "strong" }],
      focusKeep: ["BE"]
    },

    {
      kind: "constr",
      statementParts: [
        { t: "Join " },
        { t: "AD", ref: ["AD", "lblA", "lblD"] },
        { t: ". If not, draw " },
        { t: "AF", ref: ["AF", "lblA"] },
        { t: " through " },
        { t: "A", ref: ["lblA"] },
        { t: " parallel to " },
        { t: "BE", ref: ["BE"] },
        { t: ", meeting " },
        { t: "DE", ref: ["DE", "lblD", "lblE"] },
        { t: " produced at " },
        { t: "F", ref: ["ptF", "lblF"] },
        { t: ", and join " },
        { t: "FE", ref: ["FE", "lblF", "lblE"] },
        { t: " (and " },
        { t: "FC", ref: ["FC", "lblF", "lblC"] },
        { t: ")." }
      ],
      reason: { label: "I.Post.1 + I.31", kind: "constr", tooltip: "Join two points; draw a parallel through a point." },
      reveal: ["AD", "AF", "DF", "ptF", "lblF", "FE", "FC"],
      coach: "Assume AD is not parallel to BE. Draw AF through A parallel to BE, meeting DE produced at F; then join FE and FC to display triangle FCE.",
      announce: ["AD", "AF", "F", "FE", "FC"],
      highlight: [
        { id: "AD", mode: "strong" },
        { id: "AF", mode: "strong" },
        { id: "BE", mode: "strong" },
        { id: "DE", mode: "strong" },
        { id: "DF", mode: "strong" },
        { id: "FE", mode: "strong" },
        { id: "FC", mode: "strong" }
      ],
      focusKeep: ["BE"],
      mcq: {
        question: "Why do we draw the line AF through A parallel to BE?",
        choices: [
          "So we can apply I.38: triangles on equal bases and between the same parallels are equal in area.",
          "To prove BC is equal to CE by construction.",
          "To make triangles ABC and DCE congruent."
        ],
        correctIndex: 0,
        feedback: [
          "Correct: AF creates the ‘same parallels’ condition with BE.",
          "No—BC = CE is given, not constructed here.",
          "No—this proposition is about parallels and area, not congruence."
        ]
      }
    },

    {
      kind: "prop",
      statementParts: [
        { t: "Therefore triangle " },
        { t: "ABC", ref: ["triABC"] },
        { t: " equals triangle " },
        { t: "FCE", ref: ["FC", "FE", "CE", "ptF", "lblC", "lblE"] },
        { t: " in area, for they are on equal bases " },
        { t: "BC", ref: ["BC"] },
        { t: " and " },
        { t: "CE", ref: ["CE"] },
        { t: " and in the same parallels " },
        { t: "BE", ref: ["BE"] },
        { t: " and " },
        { t: "AF", ref: ["AF"] },
        { t: "." }
      ],
      reason: { label: "I.38", kind: "prop", tooltip: "Triangles on equal bases and in the same parallels are equal in area." },
      coach: "Apply I.38: equal bases (BC = CE) and same parallels (BE and AF) give equal areas.",
      announce: ["triangle ABC", "triangle FCE", "I.38"],
      highlight: [
        { id: "BC", mode: "strong" },
        { id: "CE", mode: "strong" },
        { id: "BE", mode: "strong" },
        { id: "AF", mode: "strong" },
        { id: "AB", mode: "tri" }, { id: "AC", mode: "tri" },
        { id: "FC", mode: "tri" }, { id: "FE", mode: "tri" }
      ],
      focusKeep: ["BE"],
      mcq: {
        question: "Which condition is essential for using Proposition I.38 here?",
        choices: [
          "The triangles must be right triangles.",
          "Their bases are equal and they lie between the same parallels.",
          "The triangles share the same base."
        ],
        correctIndex: 1,
        feedback: [
          "No—right angles are not required in I.38.",
          "Correct: equal bases + same parallels is exactly I.38.",
          "No—that would be I.37, not I.38."
        ]
      }
    },

    {
      kind: "def",
      statementParts: [
        { t: "But triangle " },
        { t: "ABC", ref: ["triABC"] },
        { t: " equals triangle " },
        { t: "DCE", ref: ["triDCE"] },
        { t: "; therefore triangle " },
        { t: "DCE", ref: ["triDCE"] },
        { t: " also equals triangle " },
        { t: "FCE", ref: ["FC", "FE", "CE"] },
        { t: " in area." }
      ],
      reason: { label: "C.N. 1", kind: "def", tooltip: "Things equal to the same thing are equal to one another." },
      coach: "Given ABC = DCE and ABC = FCE, we get DCE = FCE.",
      announce: ["triangle DCE", "triangle FCE"],
      highlight: [
        { id: "DC", mode: "tri" }, { id: "DE", mode: "tri" }, { id: "CE", mode: "tri" },
        { id: "FC", mode: "tri" }, { id: "FE", mode: "tri" }
      ],
      focusKeep: ["BE"]
    },

    {
      kind: "prop",
      statementParts: [
        { t: "But triangle " },
        { t: "FCE", ref: ["FC", "FE", "CE", "ptF"] },
        { t: " is greater than triangle " },
        { t: "DCE", ref: ["triDCE"] },
        { t: " (since " },
        { t: "F", ref: ["ptF", "lblF"] },
        { t: " lies on " },
        { t: "DE", ref: ["DE", "DF"] },
        { t: " produced); which is impossible." }
      ],
      reason: { label: "C.N. 5 (Contradiction)", kind: "prop", tooltip: "The whole is greater than the part." },
      coach: "Contradiction: FCE strictly contains DCE when F is beyond D on DE produced, so it cannot be equal in area.",
      announce: ["contradiction"],
      highlight: [
        { id: "DE", mode: "strong" }, { id: "DF", mode: "strong" },
        { id: "FE", mode: "strong" }, { id: "FC", mode: "strong" },
        { id: "CE", mode: "strong" }
      ],
      focusKeep: ["BE"]
    },

    {
      kind: "thus",
      statementParts: [
        { t: "Therefore " },
        { t: "AD", ref: ["AD"] },
        { t: " is parallel to " },
        { t: "BE", ref: ["BE"] },
        { t: ", and equal triangles on equal bases and on the same side are in the same parallels. " },
        { t: "Q.E.D.", strong: true }
      ],
      reason: { label: "Reductio / Q.E.D.", kind: "thus", tooltip: "Since the supposition leads to an impossibility, AD ∥ BE." },
      coach: "The assumption leads to an impossibility, so AD must be parallel to BE.",
      announce: ["AD parallel BE"],
      highlight: [{ id: "AD", mode: "strong" }, { id: "BE", mode: "strong" }],
      focusKeep: ["BE"],
      onSelect: () => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduceMotion && typeof confetti === "function") {
          confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
        }
        const stamp = document.getElementById("qed-stamp");
        if (stamp) {
          stamp.classList.remove("hidden");
          stamp.classList.add("stamp-drop");
          stamp.setAttribute("aria-hidden", "false");
        }
      }
    }
  ]
};
