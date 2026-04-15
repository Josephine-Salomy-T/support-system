import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "admin" | "agent"; // optional role
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {

    return <Navigate to="/login" />;
  }

  if (role && user.role.toLowerCase() !== role) {

    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
