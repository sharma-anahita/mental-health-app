import React from "react";
import AppRoutes from "./AppRoutes";
import ThemeProvider from "./components/ui/ThemeProvider";
import "./styles/themes.css";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-b from-[var(--theme-bg-from)] via-[var(--theme-bg-via)] to-[var(--theme-bg-to)]">
        <AppRoutes />
      </div>
    </ThemeProvider>
  );
};

export default App;