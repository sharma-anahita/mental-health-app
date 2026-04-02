import React, { useEffect } from "react";
import AppRoutes from "./AppRoutes";
import ThemeProvider from "./components/ui/ThemeProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import apiClient from "./services/apiClient";
import { getToken, TOKEN_CHANGED_EVENT } from "./services/tokenStorage";
import "./styles/themes.css";

type FontStyle = "Inter" | "Poppins" | "Roboto";

function applyGlobalTypography(fontStyle: FontStyle = "Inter", fontColor = "#ffffff"): void {
  const root = document.documentElement;
  root.style.setProperty("--app-font", `'${fontStyle}', sans-serif`);
  root.style.setProperty("--text-color", fontColor);
}

const App: React.FC = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    let cancelled = false;

    const syncPreferences = async () => {
      if (!getToken()) {
        applyGlobalTypography("Inter", "#ffffff");
        return;
      }

      try {
        const res = await apiClient.get<{ preferences?: { fontColor?: string; fontStyle?: FontStyle } }>(
          "/user/preferences"
        );
        if (cancelled) return;

        const fontStyle = res.preferences?.fontStyle ?? "Inter";
        const fontColor = res.preferences?.fontColor ?? "#ffffff";
        applyGlobalTypography(fontStyle, fontColor);
      } catch {
        if (!cancelled) {
          applyGlobalTypography("Inter", "#ffffff");
        }
      }
    };

    syncPreferences();

    window.addEventListener(TOKEN_CHANGED_EVENT, syncPreferences);
    window.addEventListener("storage", syncPreferences);

    return () => {
      cancelled = true;
      window.removeEventListener(TOKEN_CHANGED_EVENT, syncPreferences);
      window.removeEventListener("storage", syncPreferences);
    };
  }, []);

  const appShell = (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-b from-[var(--theme-bg-from)] via-[var(--theme-bg-via)] to-[var(--theme-bg-to)]">
        <AppRoutes />
      </div>
    </ThemeProvider>
  );

  if (!googleClientId) {
    return appShell;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {appShell}
    </GoogleOAuthProvider>
  );
};

export default App;