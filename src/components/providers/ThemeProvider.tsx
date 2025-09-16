import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

/**
 * ThemeProvider component that applies the current theme to the document
 * This ensures the dark mode classes work properly across the application
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSelector((state: RootState) => state.ui.theme);

  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Add the current theme class
    root.classList.add(theme);

    // Also update the data attribute for CSS targeting if needed
    root.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
