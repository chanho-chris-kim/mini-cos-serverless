import { Routes, Route, Navigate } from "react-router-dom";
import { useUserStore } from "./lib/store";
import { useAuthSync } from "./hooks/useAuthSync";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Tasks from "./pages/Tasks";
import Scan from "./pages/Scan";
import ReturnsPage from "./pages/Returns";
import Warehouses from "./pages/Warehouses";
import Workers from "./pages/Workers";
import Analytics from "./pages/Analytics";

import { getHomeRouteFor } from "./lib/roleHome";

export default function App() {
  const { loading } = useAuthSync();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  if (loading)
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-semibold text-slate-800 tracking-tight">
            Cozey Operating System
          </div>

          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-slate-300 border-t-slate-900 rounded-full"></div>
          </div>

          <div className="text-xs text-slate-500 tracking-wide">
            Syncing secure session…
          </div>
        </div>
      </div>
    );
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* All protected routes live inside Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={() => setUser(null)} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard user={user} />} />

        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        <Route path="/tasks" element={<Tasks user={user} />} />
        <Route path="/scan" element={<Scan user={user} />} />
        <Route path="/returns" element={<ReturnsPage />} />

        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>

      {/* Fallback redirect */}
      <Route
        path="*"
        element={<Navigate to={getHomeRouteFor(user)} replace />}
      />
    </Routes>
  );
}
