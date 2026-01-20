// src/RequireAuth.tsx
import { isAuthed } from "@/auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const loc = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return <Outlet />;
}
