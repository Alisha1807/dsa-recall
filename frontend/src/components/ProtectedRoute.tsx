
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../services/authService";

export default function ProtectedRoute() {
  return authService.isLoggedIn()
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
