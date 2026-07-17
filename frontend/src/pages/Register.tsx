import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { PiggyBank, User, Mail, Phone, UserCircle, Lock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    usuario: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || undefined,
        usuario: formData.usuario,
        password: formData.password,
      });
      // Navigation is handled by useEffect
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
                Crear Cuenta
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Regístrate para comenzar a gestionar tus finanzas
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4" />
                  Nombre Completo
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-2 text-foreground">
                  <Phone className="h-4 w-4" />
                  Teléfono (Opcional)
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usuario" className="flex items-center gap-2 text-foreground">
                  <UserCircle className="h-4 w-4" />
                  Nombre de Usuario
                </Label>
                <Input
                  id="usuario"
                  type="text"
                  placeholder="juanperez"
                  value={formData.usuario}
                  onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-foreground">
                  <Lock className="h-4 w-4" />
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                    Creando cuenta...
                  </span>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <Link to="/login" className="text-primary font-medium hover:text-primary-hover transition-colors">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

