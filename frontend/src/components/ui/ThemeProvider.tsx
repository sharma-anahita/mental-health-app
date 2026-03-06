import { useEffect } from "react";
import useThemeStore from "../../store/themeStore";

/**
 * ThemeProvider
 * Mount once at the app root. Reads the persisted theme from localStorage
 * and applies it to <html> immediately so there's no flash on load.
 *
 * If a server-side preference is available later (e.g. after login),
 * call `useThemeStore.getState().initTheme(serverTheme)` to reconcile it.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    // Apply on first mount without a server preference — uses localStorage
    initTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}