import { useEffect } from "react";

/**
 * ThemeProvider component that forces light theme across the entire application
 * Dark mode is disabled to maintain consistent light theme appearance
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;

    // Remove any existing theme classes
    root.classList.remove("light", "dark");

    // Always force light theme
    root.classList.add("light");

    // Set data attribute for light theme
    root.setAttribute("data-theme", "light");

    // Set color scheme for browser UI elements
    root.style.colorScheme = "light";
  }, []);

  return <>{children}</>;
}
