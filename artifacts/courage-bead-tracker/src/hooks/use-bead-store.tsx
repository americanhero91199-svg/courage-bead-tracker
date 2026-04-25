import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Child, Bead, JournalNote } from "@/lib/types";

const STORE_KEY = "courage-bead-tracker:v1";

type State = {
  child: Child | null;
  beads: Bead[];
  notes: JournalNote[];
};

type BeadStoreContextType = {
  child: Child | null;
  beads: Bead[];
  notes: JournalNote[];
  setChildName: (name: string) => void;
  addBead: (bead: Omit<Bead, "id" | "childId">) => void;
  updateBead: (id: string, updates: Partial<Omit<Bead, "id" | "childId">>) => void;
  deleteBead: (id: string) => void;
  addNote: (note: { date: string; text: string }) => JournalNote | null;
  updateNote: (id: string, updates: { date?: string; text?: string }) => void;
  deleteNote: (id: string) => void;
  clearData: () => void;
  isLoaded: boolean;
};

const BeadStoreContext = createContext<BeadStoreContextType | null>(null);

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

export function BeadStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(EMPTY_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        setState(normalizeState(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Failed to load store", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveState = useCallback((newState: State) => {
    setState(newState);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error("Failed to save store", e);
    }
  }, []);

  const setChildName = useCallback((name: string) => {
    setState(prev => {
      const newState = { ...prev };
      if (!newState.child) {
        newState.child = {
          id: crypto.randomUUID(),
          name,
          createdAt: new Date().toISOString(),
        };
      } else {
        newState.child = { ...newState.child, name };
      }
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const addBead = useCallback((beadData: Omit<Bead, "id" | "childId">) => {
    setState(prev => {
      if (!prev.child) return prev;
      const newBead: Bead = {
        ...beadData,
        id: crypto.randomUUID(),
        childId: prev.child.id,
      };
      const newState = {
        ...prev,
        beads: [newBead, ...prev.beads].sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()),
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const updateBead = useCallback((id: string, updates: Partial<Omit<Bead, "id" | "childId">>) => {
    setState(prev => {
      const newBeads = prev.beads.map(b => b.id === id ? { ...b, ...updates } : b)
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
      const newState = { ...prev, beads: newBeads };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const deleteBead = useCallback((id: string) => {
    setState(prev => {
      const newState = { ...prev, beads: prev.beads.filter(b => b.id !== id) };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const addNote = useCallback((note: { date: string; text: string }): JournalNote | null => {
    let created: JournalNote | null = null;
    setState(prev => {
      if (!prev.child) return prev;
      const now = new Date().toISOString();
      const newNote: JournalNote = {
        id: crypto.randomUUID(),
        childId: prev.child.id,
        date: note.date,
        text: note.text,
        createdAt: now,
        updatedAt: now,
      };
      created = newNote;
      const newState = {
        ...prev,
        notes: [...prev.notes, newNote].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      };
      saveState(newState);
      return newState;
    });
    return created;
  }, [saveState]);

  const updateNote = useCallback((id: string, updates: { date?: string; text?: string }) => {
    setState(prev => {
      const now = new Date().toISOString();
      const newNotes = prev.notes
        .map(n => n.id === id ? { ...n, ...updates, updatedAt: now } : n)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const newState = { ...prev, notes: newNotes };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const deleteNote = useCallback((id: string) => {
    setState(prev => {
      const newState = { ...prev, notes: prev.notes.filter(n => n.id !== id) };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const clearData = useCallback(() => {
    saveState(EMPTY_STATE);
  }, [saveState]);

  return (
    <BeadStoreContext.Provider value={{
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
    }}>
      {children}
    </BeadStoreContext.Provider>
  );
}

export function useBeadStore() {
  const context = useContext(BeadStoreContext);
  if (!context) {
    throw new Error("useBeadStore must be used within a BeadStoreProvider");
  }
  return context;
}
