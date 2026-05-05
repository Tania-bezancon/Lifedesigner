"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dictionaries, type DictKey, type Lang } from "@/lib/i18n/dictionaries";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: DictKey) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);

  // Read the lang attribute set by the pre-paint script in layout.tsx.
  useEffect(() => {
    const attr =
      document.documentElement.getAttribute("data-lang") === "fr" ? "fr" : "en";
    setLangState(attr);
    setMounted(true);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.documentElement.setAttribute("data-lang", next);
    document.documentElement.setAttribute("lang", next);
    try {
      localStorage.setItem("ld-lang", next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "fr" : "en");
  }, [lang, setLang]);

  const t = useCallback(
    (key: DictKey) => {
      // Fall back to en if a key is somehow missing in fr.
      return dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
    },
    [lang],
  );

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, toggle, t }),
    [lang, setLang, toggle, t],
  );

  return (
    <I18nContext.Provider value={value}>
      {/* During SSR / pre-mount, render in en (matches the SSR HTML). After
          mount, the real language takes over. */}
      <span data-i18n-mounted={mounted ? "1" : "0"} style={{ display: "none" }} />
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}
