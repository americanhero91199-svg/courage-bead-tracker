// =============================================================================
// BEAD DEFINITIONS — The single source of truth for all bead types.
//
// HOW TO ADD A NEW BEAD:
//   1. Copy an existing entry below and paste it inside BEAD_DEFINITIONS.
//   2. Give it a unique `id` (lowercase, no spaces — e.g. "silver").
//   3. Set `displayOrder` to the next number in sequence (or any number —
//      lower = appears earlier in the picker grid).
//   4. Fill in every required field (id, name, colorName, color, category,
//      reason, description, displayOrder). `meaning` and `isGlow` are optional.
//   5. Save. Every screen in the app picks this up automatically.
//
// HOW TO EDIT A BEAD:
//   - Change any field below directly.
//   - ⚠️  Do NOT change `colorName` on a bead that is already saved to users'
//     devices. Saved beads store `colorName` as their link back to this list.
//     Changing it will cause existing beads to lose their definition.
//     Only rename if you are intentionally doing a migration.
//
// HOW TO REMOVE A BEAD:
//   - Delete the entry. It will disappear from the picker.
//   - Already-saved beads of that type will still display correctly using
//     the color and colorName stored on the bead itself.
//
// HOW TO REORDER THE PICKER GRID:
//   - Change the `displayOrder` numbers. Lower = first.
//     Gaps are fine — e.g. 10, 20, 30 leaves room for insertions.
// =============================================================================

import type { BeadDefinition } from "@/types";

export const BEAD_DEFINITIONS: BeadDefinition[] = [
  // ─── Treatment ──────────────────────────────────────────────────────────────

  {
    id: "white",
    name: "White Bead",
    colorName: "White",
    color: "#E8E8E8",
    category: "Treatment",
    reason: "Chemotherapy",
    description: "Awarded for each chemotherapy treatment — one of the most common beads in the journey.",
    meaning: "Every round of chemo is an act of extraordinary courage.",
    displayOrder: 1,
  },
  {
    id: "green",
    name: "Green Bead",
    colorName: "Green",
    color: "#1fa12e",
    category: "Treatment",
    reason: "Radiation",
    description: "Awarded for radiation therapy sessions.",
    meaning: "Strength that glows from the inside out.",
    displayOrder: 2,
  },
  {
    id: "glow",
    name: "Glow-in-the-Dark Bead",
    colorName: "Glow",
    color: "#ccff00",
    isGlow: true,
    category: "Treatment",
    reason: "Radiation",
    description: "A special glow-in-the-dark bead also given for radiation therapy.",
    meaning: "Even in the dark, you shine.",
    displayOrder: 3,
  },
  {
    id: "purple",
    name: "Purple Bead",
    colorName: "Purple",
    color: "#8a2be2",
    category: "Treatment",
    reason: "IV Fluids / Antibiotics",
    description: "Given for IV fluids or antibiotic infusions.",
    meaning: "Royalty — because fighting this hard deserves a crown.",
    displayOrder: 4,
  },
  {
    id: "red",
    name: "Red Bead",
    colorName: "Red",
    color: "#e81c24",
    category: "Treatment",
    reason: "Blood Transfusion",
    description: "Awarded for each blood transfusion received.",
    meaning: "The gift of life, bravely accepted.",
    displayOrder: 5,
  },

  // ─── Procedures ─────────────────────────────────────────────────────────────

  {
    id: "black",
    name: "Black Bead",
    colorName: "Black",
    color: "#222222",
    category: "Procedure",
    reason: "Needle Poke",
    description: "Given for every needle poke or blood draw — these add up fast, and every single one counts.",
    meaning: "Small but mighty. Every poke is a tiny act of bravery.",
    displayOrder: 6,
  },
  {
    id: "orange",
    name: "Orange Bead",
    colorName: "Orange",
    color: "#ff8c00",
    category: "Procedure",
    reason: "Line Placement",
    description: "Awarded for surgical procedures, line placements, or port accesses.",
    meaning: "Warmth and courage in equal measure.",
    displayOrder: 7,
  },

  // ─── Hospital Visits & Stays ─────────────────────────────────────────────────

  {
    id: "blue",
    name: "Blue Bead",
    colorName: "Blue",
    color: "#005baa",
    category: "Hospital Visit",
    reason: "Clinic Visit",
    description: "Given for each clinic or outpatient visit — even routine check-ins take strength.",
    meaning: "Showing up, even when it's hard.",
    displayOrder: 8,
  },
  {
    id: "yellow",
    name: "Yellow Bead",
    colorName: "Yellow",
    color: "#ffe600",
    category: "Hospital Stay",
    reason: "Overnight Stay",
    description: "Awarded for each overnight hospital stay.",
    meaning: "Every night away from home is a night of quiet bravery.",
    displayOrder: 9,
  },
  {
    id: "lightpurple",
    name: "Light Purple Bead",
    colorName: "Light Purple",
    color: "#c8adf5",
    category: "Hospital Stay",
    reason: "Isolation",
    description: "Given during isolation periods when the immune system needs extra protection.",
    meaning: "Stillness is its own kind of strength.",
    displayOrder: 10,
  },
  {
    id: "magenta",
    name: "Magenta Bead",
    colorName: "Magenta",
    color: "#f06292",
    category: "Hospital Visit",
    reason: "Emergency Room Visit",
    description: "Awarded for emergency room visits — unexpected moments that required extra courage.",
    meaning: "Brave even when there was no time to prepare.",
    displayOrder: 11,
  },

  // ─── Milestones ──────────────────────────────────────────────────────────────

  {
    id: "brown",
    name: "Brown Bead",
    colorName: "Brown",
    color: "#a0522d",
    category: "Milestone",
    reason: "Hair Changes",
    description: "Given to mark hair changes — a visible sign of the treatment journey.",
    meaning: "What grows back is not the same as what was lost — it's stronger.",
    displayOrder: 12,
  },
];

// =============================================================================
// HELPER UTILITIES
// You do not need to edit these — they are used by the app screens.
// =============================================================================

/** Look up a full bead definition by its colorName (the value stored on saved beads). */
export function getBeadDef(colorName: string): BeadDefinition | undefined {
  return BEAD_DEFINITIONS.find((d) => d.colorName === colorName);
}

/** Look up a full bead definition by its stable `id` field. */
export function getBeadDefById(id: string): BeadDefinition | undefined {
  return BEAD_DEFINITIONS.find((d) => d.id === id);
}

/**
 * Returns true if a bead should be rendered with a glow effect.
 * Use this everywhere instead of hardcoding `colorName === "Glow"`.
 */
export function isGlowBead(colorName: string): boolean {
  return getBeadDef(colorName)?.isGlow === true;
}

/**
 * BEAD_PRESETS — sorted list of bead definitions for picker UIs.
 * Import this from @/data/beads, not from @/types.
 */
export const BEAD_PRESETS: BeadDefinition[] = [...BEAD_DEFINITIONS].sort(
  (a, b) => a.displayOrder - b.displayOrder
);
