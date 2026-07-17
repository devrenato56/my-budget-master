import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { User, Palette, Bell, Shield, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("es");

  const themes = [
    { value: "light", label: "Claro", description: "Tema claro y limpio" },
    { value: "dark", label: "Oscuro", description: "Tema oscuro para reducir fatiga visual" },
    { value: "blue", label: "Azul", description: "Tema azul profesional" },
    { value: "green", label: "Verde", description: "Tema verde relajante" },
    { value: "purple", label: "Morado", description: "Tema morado creativo" },
    { value: "orange", label: "Naranja", description: "Tema naranja energético" },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    toast({
      title: "Tema actualizado",
      description: `El tema ha sido cambiado a ${themes.find(t => t.value === newTheme)?.label}`,
    });
  };

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    toast({
      title: "Notificaciones",
      description: notifications ? "Notificaciones desactivadas" : "Notificaciones activadas",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Configuración</h2>
        <p className="text-muted-foreground mt-2">
          Personaliza tu experiencia en BudgetMaster
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Gestiona tu información personal</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label>Nombre</Label>
              <div className="mt-1 px-3 py-2 rounded-md bg-muted text-foreground">
                {user?.nombre || "No disponible"}
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="mt-1 px-3 py-2 rounded-md bg-muted text-foreground">
                {user?.email || "No disponible"}
              </div>
            </div>
            <div>
              <Label>Usuario</Label>
              <div className="mt-1 px-3 py-2 rounded-md bg-muted text-foreground">
                {user?.usuario || "No disponible"}
              </div>
            </div>
          </div>
          <Separator />
          <Button onClick={() => navigate("/profile")} variant="outline" className="w-full">
            Ver Perfil Completo
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza los colores y el tema de la aplicación</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vista Previa de Temas</Label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleThemeChange(t.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme === t.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div
                    className="h-12 rounded-md mb-2"
                    style={{
                      background: `linear-gradient(135deg, hsl(${
                        t.value === "light" ? "217 91% 35%" :
                        t.value === "dark" ? "217 91% 60%" :
                        t.value === "blue" ? "217 91% 50%" :
                        t.value === "green" ? "158 64% 45%" :
                        t.value === "purple" ? "280 65% 60%" :
                        "25 95% 53%"
                      }), hsl(${
                        t.value === "light" ? "217 91% 45%" :
                        t.value === "dark" ? "217 91% 70%" :
                        t.value === "blue" ? "217 91% 60%" :
                        t.value === "green" ? "158 64% 55%" :
                        t.value === "purple" ? "280 65% 70%" :
                        "25 95% 63%"
                      }))`,
                    }}
                  ></div>
                  <div className="text-xs font-medium text-center">{t.label}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Preferencias</CardTitle>
              <CardDescription>Configura tus preferencias de uso</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones</Label>
              <p className="text-sm text-muted-foreground">
                Recibe alertas sobre presupuestos y transacciones
              </p>
            </div>
            <Button
              variant={notifications ? "default" : "outline"}
              onClick={handleNotificationToggle}
            >
              {notifications ? "Activadas" : "Desactivadas"}
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={() => navigate("/forgot-password")}>
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

