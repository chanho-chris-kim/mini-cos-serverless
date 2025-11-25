import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Tasks from "./pages/Tasks";
import Scan from "./pages/Scan";
import Returns from "./pages/Returns";
import Warehouses from "./pages/Warehouses";
import Workers from "./pages/Workers";
import Analytics from "./pages/Analytics";

import { useMemo, useState } from "react";
import { mockUsers } from "./lib/mockData";
import type { User } from "./lib/types";

export default function App() {
  // mock auth for UI preview
  const [user, setUser] = useState<User | null>(mockUsers[0]);

  const roleHome = useMemo(() => {
    if (!user) return "/login";
    if (user.role === "WORKER") return "/scan";
    if (user.role === "QA") return "/returns";
    return "/dashboard";
  }, [user]);

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route element={<Layout user={user} onLogout={() => setUser(null)} />}>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/tasks" element={<Tasks user={user} />} />
        <Route path="/scan" element={<Scan user={user} />} />
        <Route path="/returns" element={<Returns user={user} />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>

      <Route path="*" element={<Navigate to={roleHome} replace />} />
    </Routes>
  );
}
