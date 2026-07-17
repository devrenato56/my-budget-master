import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { PiggyBank, Lock, User, Sparkles } from "lucide-react";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(usuario, password);
      // Navigation handled by useEffect
    } catch (error) {
      // El error ya se maneja en el contexto
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-lg transform hover:scale-110 transition-transform duration-300">
                <PiggyBank className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Bienvenido de nuevo
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="usuario" className="flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4" />
                  Usuario o Email
                </Label>
                <Input
                  id="usuario"
                  type="text"
                  placeholder="usuario o email@ejemplo.com"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-foreground">
                  <Lock className="h-4 w-4" />
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
            <div className="mt-6 space-y-3 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
              >
                ¿Olvidaste tu contraseña?
              </Link>
              <div className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link to="/register" className="text-primary font-medium hover:text-primary-hover transition-colors">
                  Regístrate aquí
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

