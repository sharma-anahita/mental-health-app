import React from "react";
import AppRoutes from "./AppRoutes";
import ThemeProvider from "./components/ui/ThemeProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./styles/themes.css";

const App: React.FC = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

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