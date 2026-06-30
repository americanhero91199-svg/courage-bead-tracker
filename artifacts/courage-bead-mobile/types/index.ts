export type Child = {
  id: string;
  name: string;
  createdAt: string;
};

export type Bead = {
  id: string;
  childId: string;
  color: string;
  colorName: string;
  name: string;
  reason: string;
  earnedAt: string;
  notes?: string;
};

export type JournalNote = {
  id: string;
  childId: string;
  date: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// BeadDefinition — the full shape of a bead entry in data/beads.ts.
//
// Fields:
//   id           — stable identifier; never change after release (used as a key)
//   name         — full display name shown in detail views, e.g. "Red Bead"
//   colorName    — short label shown in the picker grid, e.g. "Red"
//   color        — hex color string used by BeadBubble for rendering
//   isGlow       — if true, BeadBubble renders the glow-in-the-dark effect
//   category     — grouping label shown in future filter/search UIs
//   reason       — short default reason pre-filled in the Add Bead form
//   description  — one or two sentences explaining what this bead represents
//   meaning      — optional quote, scripture, or encouraging phrase
//   displayOrder — controls sort order in the picker; lower = first
// ---------------------------------------------------------------------------
export type BeadDefinition = {
  id: string;
  name: string;
  colorName: string;
  color: string;
  isGlow?: boolean;
  category: string;
  reason: string;
  description: string;
  meaning?: string;
  displayOrder: number;
};
