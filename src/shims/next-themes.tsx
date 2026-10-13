import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = { theme: string; resolvedTheme: string; setTheme: (t: string) => void; themes: string[]; systemTheme?: string };
const ThemeCtx = createContext<Ctx>({ theme: "dark", resolvedTheme: "dark", setTheme: () => {}, themes: ["light", "dark"] });

export function ThemeProvider({ children, defaultTheme = "dark" }: { children: ReactNode; defaultTheme?: string; attribute?: string; enableSystem?: boolean; disableTransitionOnChange?: boolean }) {
  const [theme, setThemeState] = useState(defaultTheme);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setThemeState(saved);
  }, []);
  useEffect(() => {
    const resolved = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.classList.toggle("light", resolved !== "dark");
  }, [theme]);
  const setTheme = useCallback((t: string) => {
    localStorage.setItem("theme", t);
    setThemeState(t);
  }, []);
  const resolvedTheme = theme === "system" ? "dark" : theme;
  return <ThemeCtx.Provider value={{ theme, resolvedTheme, setTheme, themes: ["light", "dark", "system"] }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
export type ThemeProviderProps = { children?: import("react").ReactNode; [k: string]: any };
