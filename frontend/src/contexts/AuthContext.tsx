import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  idUsuario: number;
  nombre: string;
  email: string;
  usuario: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (usuario: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

interface RegisterData {
  nombre: string;
  email: string;
  telefono?: string;
  usuario: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Función para extraer idUsuario del token JWT
  const extractUserIdFromToken = (token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.idUsuario || payload.id_usuario || null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // Cargar datos de autenticación del localStorage al iniciar
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("userData");

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);

        // Si el userData no tiene idUsuario, intentar extraerlo del token
        if (!userData.idUsuario) {
          const idUsuario = extractUserIdFromToken(savedToken);
          if (idUsuario) {
            userData.idUsuario = idUsuario;
            // Actualizar localStorage con el idUsuario
            localStorage.setItem("userData", JSON.stringify(userData));
          }
        }

        setToken(savedToken);
        setUser(userData);
      } catch (e) {
        // Si hay error, limpiar datos inválidos
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const login = async (usuario: string, password: string) => {
    try {
      const response = await authApi.login({ usuario, password });
      console.log("Login response:", response);

      // El backend devuelve en snake_case debido a la configuración de Jackson
      const idUsuario = response.idUsuario || response.id_usuario;

      const userData = {
        idUsuario: idUsuario,
        nombre: response.nombre,
        email: response.email,
        usuario: response.usuario,
      };

      setToken(response.token);
      setUser(userData);

      // Guardar en localStorage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userData", JSON.stringify(userData));

      toast({
        title: "Login exitoso",
        description: `Bienvenido, ${response.nombre}!`,
      });
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      console.log("Register response:", response);

      // El backend devuelve en snake_case debido a la configuración de Jackson
      const idUsuario = response.idUsuario || response.id_usuario;

      const userData = {
        idUsuario: idUsuario,
        nombre: response.nombre,
        email: response.email,
        usuario: response.usuario,
      };

      setToken(response.token);
      setUser(userData);

      // Guardar en localStorage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userData", JSON.stringify(userData));

      toast({
        title: "Registro exitoso",
        description: `Cuenta creada exitosamente. Bienvenido, ${response.nombre}!`,
      });
    } catch (error: any) {
      toast({
        title: "Error al registrar",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

