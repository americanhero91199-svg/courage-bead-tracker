import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Child, Bead } from "@/lib/types";

const STORE_KEY = "courage-bead-tracker:v1";

type State = {
  child: Child | null;
  beads: Bead[];
};

type BeadStoreContextType = {
  child: Child | null;
  beads: Bead[];
  setChildName: (name: string) => void;
  addBead: (bead: Omit<Bead, "id" | "childId">) => void;
  updateBead: (id: string, updates: Partial<Omit<Bead, "id" | "childId">>) => void;
  deleteBead: (id: string) => void;
  clearData: () => void;
  isLoaded: boolean;
};

const BeadStoreContext = createContext<BeadStoreContextType | null>(null);

export function BeadStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ child: null, beads: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
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

  const clearData = useCallback(() => {
    const newState = { child: null, beads: [] };
    saveState(newState);
  }, [saveState]);

  return (
    <BeadStoreContext.Provider value={{
      child: state.child,
      beads: state.beads,
      setChildName,
      addBead,
      updateBead,
      deleteBead,
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
