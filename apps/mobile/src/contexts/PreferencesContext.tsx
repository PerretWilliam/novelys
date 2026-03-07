import type { SearchLang, ThemeMode } from "@readingos/shared";
import { useColorScheme } from "nativewind";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useApiClient } from "../hooks/useApiClient";

type PreferencesValue = {
  searchLang: SearchLang;
  setSearchLang: (lang: SearchLang) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
  isLoading: boolean;
  error: string | null;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useApiClient();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [searchLang, setSearchLangState] = useState<SearchLang>("fr");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setColorScheme(themeMode);
    // Intentionally only react to themeMode changes to avoid render loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeMode]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    void api
      .getPreferences()
      .then((prefs) => {
        if (!mounted) {
          return;
        }
        setSearchLangState(prefs.searchLang);
        setThemeModeState(prefs.themeMode);
      })
      .catch((err) => {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : "Impossible de charger les préférences");
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [api]);

  const persist = useCallback(
    async (payload: Partial<{ searchLang: SearchLang; themeMode: ThemeMode }>) => {
      setError(null);
      try {
        const next = await api.updatePreferences(payload);
        setSearchLangState(next.searchLang);
        setThemeModeState(next.themeMode);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de sauvegarder les préférences");
      }
    },
    [api],
  );

  const setSearchLang = useCallback(
    (lang: SearchLang) => {
      setSearchLangState(lang);
      void persist({ searchLang: lang });
    },
    [persist],
  );

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      void persist({ themeMode: mode });
    },
    [persist],
  );

  const resolvedTheme: "light" | "dark" =
    themeMode === "system" ? (colorScheme === "dark" ? "dark" : "light") : themeMode;

  const value = useMemo(
    () => ({
      searchLang,
      setSearchLang,
      themeMode,
      setThemeMode,
      resolvedTheme,
      isLoading,
      error,
    }),
    [
      searchLang,
      setSearchLang,
      themeMode,
      setThemeMode,
      resolvedTheme,
      isLoading,
      error,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
  const value = useContext(PreferencesContext);
  if (!value) {
    throw new Error("usePreferences doit être utilisé dans PreferencesProvider");
  }
  return value;
};
