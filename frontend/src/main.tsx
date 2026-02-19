import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import GlobalErrorBoundary from "./components/error/GlobalErrorBoundary";
import "./index.css";

const container = document.getElementById("root");

if (!container) throw new Error("Root container not found in index.html");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
