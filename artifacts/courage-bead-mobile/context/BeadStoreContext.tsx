import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Bead, Child, JournalNote } from "@/types";

const STORE_KEY = "courage-bead-tracker:v1";

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

type State = {
  child: Child | null;
  beads: Bead[];
  notes: JournalNote[];
};

const EMPTY_STATE: State = { child: null, beads: [], notes: [] };

function normalizeState(raw: unknown): State {
  if (!raw || typeof raw !== "object") return EMPTY_STATE;
  const r = raw as Partial<State>;
  return {
    child: r.child ?? null,
    beads: Array.isArray(r.beads) ? r.beads : [],
    notes: Array.isArray(r.notes) ? r.notes : [],
  };
}

type BeadStoreContextType = {
  child: Child | null;
  beads: Bead[];
  notes: JournalNote[];
  setChildName: (name: string) => void;
  addBead: (bead: Omit<Bead, "id" | "childId">) => void;
  updateBead: (id: string, updates: Partial<Omit<Bead, "id" | "childId">>) => void;
  deleteBead: (id: string) => void;
  addNote: (note: { date: string; text: string }) => void;
  updateNote: (id: string, updates: { date?: string; text?: string }) => void;
  deleteNote: (id: string) => void;
  clearData: () => void;
  isLoaded: boolean;
};

const BeadStoreContext = createContext<BeadStoreContextType | null>(null);

export function BeadStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(EMPTY_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY)
      .then((stored) => {
        if (stored) {
          setState(normalizeState(JSON.parse(stored)));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const saveState = useCallback((newState: State) => {
    setState(newState);
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(newState)).catch(() => {});
  }, []);

  const setChildName = useCallback(
    (name: string) => {
      setState((prev) => {
        const newState = { ...prev };
        if (!newState.child) {
          newState.child = { id: genId(), name, createdAt: new Date().toISOString() };
        } else {
          newState.child = { ...newState.child, name };
        }
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const addBead = useCallback(
    (beadData: Omit<Bead, "id" | "childId">) => {
      setState((prev) => {
        if (!prev.child) return prev;
        const newBead: Bead = { ...beadData, id: genId(), childId: prev.child.id };
        const newState = {
          ...prev,
          beads: [newBead, ...prev.beads].sort(
            (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime(),
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const updateBead = useCallback(
    (id: string, updates: Partial<Omit<Bead, "id" | "childId">>) => {
      setState((prev) => {
        const newBeads = prev.beads
          .map((b) => (b.id === id ? { ...b, ...updates } : b))
          .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
        const newState = { ...prev, beads: newBeads };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const deleteBead = useCallback(
    (id: string) => {
      setState((prev) => {
        const newState = { ...prev, beads: prev.beads.filter((b) => b.id !== id) };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const addNote = useCallback(
    (note: { date: string; text: string }) => {
      setState((prev) => {
        if (!prev.child) return prev;
        const now = new Date().toISOString();
        const newNote: JournalNote = {
          id: genId(),
          childId: prev.child.id,
          date: note.date,
          text: note.text,
          createdAt: now,
          updatedAt: now,
        };
        const newState = {
          ...prev,
          notes: [...prev.notes, newNote].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const updateNote = useCallback(
    (id: string, updates: { date?: string; text?: string }) => {
      setState((prev) => {
        const now = new Date().toISOString();
        const newNotes = prev.notes
          .map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const newState = { ...prev, notes: newNotes };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const deleteNote = useCallback(
    (id: string) => {
      setState((prev) => {
        const newState = { ...prev, notes: prev.notes.filter((n) => n.id !== id) };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const clearData = useCallback(() => {
    saveState(EMPTY_STATE);
  }, [saveState]);

  return (
    <BeadStoreContext.Provider
      value={{
        child: state.child,
        beads: state.beads,
        notes: state.notes,
        setChildName,
        addBead,
        updateBead,
        deleteBead,
        addNote,
        updateNote,
        deleteNote,
        clearData,
        isLoaded,
      }}
    >
      {children}
    </BeadStoreContext.Provider>
  );
}

export function useBeadStore() {
  const ctx = useContext(BeadStoreContext);
  if (!ctx) throw new Error("useBeadStore must be used within BeadStoreProvider");
  return ctx;
}
