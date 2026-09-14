import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuthStore";
import type { Role } from "@/lib/types";

export function RequireRole({ roles }: { roles: Role[] }) {
  const { session } = useAuth();

  if (!session || !roles.includes(session.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
