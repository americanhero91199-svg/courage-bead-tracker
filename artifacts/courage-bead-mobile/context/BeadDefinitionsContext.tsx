import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Platform, Share } from "react-native";

import { z } from "zod";

import { BEAD_DEFINITIONS } from "@/data/beads";
import type { BeadDefinition } from "@/types";

// ---------------------------------------------------------------------------
// AsyncStorage key — bump the suffix if the schema ever changes
// ---------------------------------------------------------------------------
const CUSTOM_DEFS_KEY = "bead-definitions:custom:v1";
const CUSTOM_META_KEY = "bead-definitions:meta:v1";

// ---------------------------------------------------------------------------
// Zod validation schema for an imported bead definitions file
// ---------------------------------------------------------------------------
const BeadDefSchema = z.object({
  id: z.string().min(1, "id must not be empty"),
  name: z.string().min(1, "name must not be empty"),
  colorName: z.string().min(1, "colorName must not be empty"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{3,8}$/, "color must be a hex value like #FF0000"),
  isGlow: z.boolean().optional(),
  category: z.string().min(1, "category must not be empty"),
  reason: z.string().min(1, "reason must not be empty"),
  description: z.string().min(1, "description must not be empty"),
  meaning: z.string().optional(),
  displayOrder: z
    .number()
    .int("displayOrder must be an integer")
    .nonnegative("displayOrder must be 0 or greater"),
});

export type ImportResult =
  | { success: true; count: number }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------
type BeadDefinitionsContextType = {
  /** Active sorted bead definitions — custom if imported, otherwise default */
  definitions: BeadDefinition[];
  /** Alias for definitions — for use in picker UIs */
  presets: BeadDefinition[];
  /** True when custom definitions are in use */
  isCustom: boolean;
  /** ISO timestamp of the most recent successful import, or null */
  importedAt: string | null;
  /** Look up a definition by colorName (the value stored on saved beads) */
  getBeadDef: (colorName: string) => BeadDefinition | undefined;
  /** Returns true if the bead with this colorName has isGlow === true */
  isGlowBead: (colorName: string) => boolean;
  /** Parse, validate, and save a JSON string as the new bead definitions */
  importDefinitions: (json: string) => ImportResult;
  /** Share/download the current active definitions as bead-definitions.json */
  exportDefinitions: () => Promise<void>;
  /** Open the system document picker to pick a .json file, then import it */
  pickAndImport: () => Promise<ImportResult>;
  /** Clear custom definitions and revert to the compiled defaults */
  resetToDefault: () => void;
};

const BeadDefinitionsContext =
  createContext<BeadDefinitionsContextType | null>(null);

// ---------------------------------------------------------------------------
// Helper: sort by displayOrder
// ---------------------------------------------------------------------------
function sorted(defs: BeadDefinition[]): BeadDefinition[] {
  return [...defs].sort((a, b) => a.displayOrder - b.displayOrder);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function BeadDefinitionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customDefs, setCustomDefs] = useState<BeadDefinition[] | null>(null);
  const [importedAt, setImportedAt] = useState<string | null>(null);

  // On mount: load any previously imported definitions from AsyncStorage
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(CUSTOM_DEFS_KEY),
      AsyncStorage.getItem(CUSTOM_META_KEY),
    ])
      .then(([defsJson, metaJson]) => {
        if (defsJson) {
          try {
            const parsed = JSON.parse(defsJson) as BeadDefinition[];
            setCustomDefs(parsed);
          } catch {
            // Corrupted — fall back to defaults silently
          }
        }
        if (metaJson) {
          try {
            const meta = JSON.parse(metaJson) as { importedAt: string };
            setImportedAt(meta.importedAt);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const definitions: BeadDefinition[] = sorted(
    customDefs ?? BEAD_DEFINITIONS
  );
  const isCustom = customDefs !== null;

  // Lookup helpers derived from active definitions
  const getBeadDef = useCallback(
    (colorName: string) => definitions.find((d) => d.colorName === colorName),
    [definitions]
  );

  const isGlowBead = useCallback(
    (colorName: string) =>
      definitions.find((d) => d.colorName === colorName)?.isGlow === true,
    [definitions]
  );

  // -------------------------------------------------------------------------
  // importDefinitions — validate a JSON string and save if valid
  // -------------------------------------------------------------------------
  const importDefinitions = useCallback(
    (json: string): ImportResult => {
      let raw: unknown;
      try {
        raw = JSON.parse(json);
      } catch {
        return { success: false, error: "File is not valid JSON." };
      }

      // Allow the file to be either a plain array OR wrapped in { beads: [...] }
      const arrayCandidate = Array.isArray(raw)
        ? raw
        : raw &&
            typeof raw === "object" &&
            "beads" in (raw as object) &&
            Array.isArray((raw as { beads: unknown }).beads)
          ? (raw as { beads: unknown[] }).beads
          : null;

      if (!arrayCandidate) {
        return {
          success: false,
          error:
            "File must contain a JSON array of bead definitions, or an object with a \"beads\" array.",
        };
      }

      if (arrayCandidate.length === 0) {
        return {
          success: false,
          error: "File must include at least one bead definition.",
        };
      }

      // Validate each item with Zod
      const validDefs: BeadDefinition[] = [];
      const errors: string[] = [];

      for (let i = 0; i < arrayCandidate.length; i++) {
        const result = BeadDefSchema.safeParse(arrayCandidate[i]);
        if (result.success) {
          validDefs.push(result.data as BeadDefinition);
        } else {
          const item = arrayCandidate[i] as { id?: unknown };
          const label =
            typeof item?.id === "string" ? `"${item.id}"` : `index ${i}`;
          const msgs = result.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join("; ");
          errors.push(`Bead ${label} — ${msgs}`);
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          error:
            `${errors.length} bead(s) failed validation:\n` +
            errors.slice(0, 5).join("\n") +
            (errors.length > 5 ? `\n…and ${errors.length - 5} more` : ""),
        };
      }

      // Check for duplicate ids and colorNames
      const ids = validDefs.map((d) => d.id);
      const colorNames = validDefs.map((d) => d.colorName);
      const dupId = ids.find((id, i) => ids.indexOf(id) !== i);
      if (dupId) {
        return {
          success: false,
          error: `Duplicate id found: "${dupId}". Each bead must have a unique id.`,
        };
      }
      const dupColor = colorNames.find((c, i) => colorNames.indexOf(c) !== i);
      if (dupColor) {
        return {
          success: false,
          error: `Duplicate colorName found: "${dupColor}". Each bead must have a unique colorName.`,
        };
      }

      // Save to AsyncStorage
      const now = new Date().toISOString();
      AsyncStorage.setItem(CUSTOM_DEFS_KEY, JSON.stringify(validDefs)).catch(
        () => {}
      );
      AsyncStorage.setItem(
        CUSTOM_META_KEY,
        JSON.stringify({ importedAt: now })
      ).catch(() => {});

      setCustomDefs(validDefs);
      setImportedAt(now);

      return { success: true, count: validDefs.length };
    },
    []
  );

  // -------------------------------------------------------------------------
  // pickAndImport — open document picker and import the chosen file
  // -------------------------------------------------------------------------
  const pickAndImport = useCallback(async (): Promise<ImportResult> => {
    let fileJson: string;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "public.json", "text/plain"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) {
        return { success: false, error: "No file selected." };
      }
      // fetch() works for local file:// URIs on iOS when copyToCacheDirectory is true
      const response = await fetch(result.assets[0].uri);
      fileJson = await response.text();
    } catch (e) {
      return {
        success: false,
        error: "Could not read the file. Make sure it is a valid .json file.",
      };
    }
    return importDefinitions(fileJson);
  }, [importDefinitions]);

  // -------------------------------------------------------------------------
  // exportDefinitions — share the current definitions as a JSON text
  // -------------------------------------------------------------------------
  const exportDefinitions = useCallback(async (): Promise<void> => {
    const exportData = definitions.map((d) => ({ ...d }));
    const json = JSON.stringify(exportData, null, 2);

    if (Platform.OS === "web") {
      // Web: create a blob and trigger a download
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "bead-definitions.json";
      anchor.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Native (iOS): use the system Share sheet.
    // Users can save to Notes, Files app, email, AirDrop, etc.
    await Share.share(
      {
        title: "bead-definitions.json",
        message: json,
      },
      { dialogTitle: "Export Bead Definitions" }
    );
  }, [definitions]);

  // -------------------------------------------------------------------------
  // resetToDefault — remove custom definitions from AsyncStorage
  // -------------------------------------------------------------------------
  const resetToDefault = useCallback(() => {
    AsyncStorage.removeItem(CUSTOM_DEFS_KEY).catch(() => {});
    AsyncStorage.removeItem(CUSTOM_META_KEY).catch(() => {});
    setCustomDefs(null);
    setImportedAt(null);
  }, []);

  return (
    <BeadDefinitionsContext.Provider
      value={{
        definitions,
        presets: definitions,
        isCustom,
        importedAt,
        getBeadDef,
        isGlowBead,
        importDefinitions,
        exportDefinitions,
        pickAndImport,
        resetToDefault,
      }}
    >
      {children}
    </BeadDefinitionsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useBeadDefinitions(): BeadDefinitionsContextType {
  const ctx = useContext(BeadDefinitionsContext);
  if (!ctx) {
    throw new Error(
      "useBeadDefinitions must be used inside BeadDefinitionsProvider"
    );
  }
  return ctx;
}
