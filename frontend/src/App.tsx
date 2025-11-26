import { Routes, Route, Navigate } from "react-router-dom";
import { useUserStore } from "./lib/store";

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
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

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
