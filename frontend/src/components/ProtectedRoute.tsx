import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../lib/store";
import { canAccess } from "../lib/permissions";
import { getHomeRouteFor } from "../lib/roleHome";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = useUserStore((s) => s.user);
  const location = useLocation();

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Check access
  if (!canAccess(user, location.pathname)) {
    // Send them to THEIR home page
    return <Navigate to={getHomeRouteFor(user)} replace />;
  }

  return children;
}
