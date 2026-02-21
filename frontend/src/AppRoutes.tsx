import type { FC } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";
import AppLayout from "./app/layout/AppLayout";
import Sidebar from "./components/dashboard/Sidebar";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import MoodLogPage from "./pages/MoodLog/MoodLogPage";
import InsightsPage from "./pages/Insights/InsightsPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import GoalsPage from "./pages/Goals/GoalsPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ProtectedRoute from "./app/routes/ProtectedRoute";

// Placeholder removed — it was declared but never used by routes.

function mapPathToItem(pathname: string) {
  if (pathname.startsWith("/mood-log")) return "mood" as const;
  if (pathname.startsWith("/insights")) return "insights" as const;
  if (pathname.startsWith("/goals")) return "goals" as const;
  if (pathname.startsWith("/profile")) return "profile" as const;
  return "dashboard" as const;
}

const LayoutWithSidebar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const active = mapPathToItem(location.pathname);

  const handleNavigate = (id: string) => {
    switch (id) {
      case "dashboard":
        return navigate("/dashboard");
      case "mood":
        return navigate("/mood-log");
      case "insights":
        return navigate("/insights");
      case "goals":
        return navigate("/goals");
      case "profile":
        return navigate("/profile");
      default:
        return navigate("/dashboard");
    }
  };

  return (
    <AppLayout sidebar={<Sidebar active={active} onNavigate={(id) => handleNavigate(id as any)} />}>
      <Outlet />
    </AppLayout>
  );
};

const AppRoutes: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected application routes */}
        <Route
          element={
            <ProtectedRoute>
              <LayoutWithSidebar />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="mood-log" element={<MoodLogPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
