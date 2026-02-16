import React from "react";
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

// Lightweight placeholders for pages you haven't added yet.
const Placeholder: React.FC<{ title: string; note?: string }> = ({ title, note }) => (
  <div className="p-6">
    <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
    {note && <p className="mt-2 text-sm text-slate-600">{note}</p>}
    <div className="mt-6 text-slate-500">This is a simple placeholder for the {title} page.</div>
  </div>
);

const MoodLog: React.FC = () => <Placeholder title="Mood Log" note="Log or review mood entries." />;
const Insights: React.FC = () => <Placeholder title="Insights" note="Graphs and trends." />;
const Profile: React.FC = () => <Placeholder title="Profile" note="User profile and settings." />;

function mapPathToItem(pathname: string) {
  if (pathname.startsWith("/mood")) return "mood" as const;
  if (pathname.startsWith("/insights")) return "insights" as const;
  if (pathname.startsWith("/profile")) return "profile" as const;
  return "dashboard" as const;
}

const LayoutWithSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const active = mapPathToItem(location.pathname);

  const handleNavigate = (id: string) => {
    switch (id) {
      case "dashboard":
        return navigate("/dashboard");
      case "mood":
        return navigate("/mood");
      case "insights":
        return navigate("/insights");
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

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutWithSidebar />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="mood" element={<MoodLog />} />
          <Route path="insights" element={<Insights />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
