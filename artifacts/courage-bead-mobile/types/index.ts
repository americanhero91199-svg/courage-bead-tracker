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

export type PresetBead = {
  color: string;
  colorName: string;
  name: string;
  reason: string;
  isGlow?: boolean;
};

export const BEAD_PRESETS: PresetBead[] = [
  { color: "#e81c24", colorName: "Red", name: "Red Bead", reason: "Blood Transfusion" },
  { color: "#ffe600", colorName: "Yellow", name: "Yellow Bead", reason: "Overnight Stay" },
  { color: "#222222", colorName: "Black", name: "Black Bead", reason: "Needle Poke" },
  { color: "#E8E8E8", colorName: "White", name: "White Bead", reason: "Chemotherapy" },
  { color: "#005baa", colorName: "Blue", name: "Blue Bead", reason: "Clinic Visit" },
  { color: "#8a2be2", colorName: "Purple", name: "Purple Bead", reason: "IV Fluids / Antibiotics" },
  { color: "#1fa12e", colorName: "Green", name: "Green Bead", reason: "Radiation" },
  { color: "#c8adf5", colorName: "Light Purple", name: "Light Purple Bead", reason: "Isolation" },
  { color: "#ff8c00", colorName: "Orange", name: "Orange Bead", reason: "Line Placement" },
  { color: "#f06292", colorName: "Magenta", name: "Magenta Bead", reason: "Emergency Room Visit" },
  { color: "#ccff00", colorName: "Glow", name: "Glow-in-the-dark Bead", reason: "Radiation", isGlow: true },
  { color: "#a0522d", colorName: "Brown", name: "Brown Bead", reason: "Hair Changes" },
];
