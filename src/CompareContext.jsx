// Shared "compare tray" state. Any page can add/remove oils; the tray and the
// compare page read the same list.
// CONCEPT: React context lets distant components share state without passing
// props down through every layer in between.
import { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);
const MAX = 4;

export function CompareProvider({ children }) {
  // CONCEPT: useState gives a component a piece of memory that survives
  // re-renders; calling the setter re-renders everything that reads it.
  const [ids, setIds] = useState([]);

  const has = (id) => ids.includes(id);
  const toggle = (id) =>
    setIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < MAX ? [...cur, id] : cur
    );
  const remove = (id) => setIds((cur) => cur.filter((x) => x !== id));
  const clear = () => setIds([]);

  return (
    <CompareContext.Provider value={{ ids, has, toggle, remove, clear }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
