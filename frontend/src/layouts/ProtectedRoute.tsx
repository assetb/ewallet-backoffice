import React from "react";
import { useAppSelector, RootState } from "../store";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  roles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
