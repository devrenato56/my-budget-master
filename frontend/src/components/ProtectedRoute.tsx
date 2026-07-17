import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user, token } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar que realmente hay usuario y token
  if (!isAuthenticated || !user || !token) {
    // Limpiar datos inválidos si existen
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

