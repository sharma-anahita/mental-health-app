import React from "react";
import AppRoutes from "./AppRoutes";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
      <AppRoutes />
    </div>
  );
};

export default App;
