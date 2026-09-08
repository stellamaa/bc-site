"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AboutExpandValue = {
  openKey: string | null;
  toggle: (key: string) => void;
};

const AboutExpandContext = createContext<AboutExpandValue | null>(null);

/** Keeps the About page to one open "Read more" at a time. */
export function AboutExpandProvider({ children }: { children: ReactNode }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = useCallback((key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  }, []);
  const value = useMemo(() => ({ openKey, toggle }), [openKey, toggle]);

  return (
    <AboutExpandContext.Provider value={value}>
      {children}
    </AboutExpandContext.Provider>
  );
}

/** Falls back to standalone state when rendered outside the About page. */
export function useAboutExpand(key: string) {
  const shared = useContext(AboutExpandContext);
  const [ownOpen, setOwnOpen] = useState(false);

  if (shared) {
    return {
      expanded: shared.openKey === key,
      toggle: () => shared.toggle(key),
    };
  }

  return {
    expanded: ownOpen,
    toggle: () => setOwnOpen((open) => !open),
  };
}
