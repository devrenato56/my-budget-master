import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, UserCircle, Calendar, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    email: user?.email || "",
    telefono: "",
  });

  const handleSave = () => {
    // Aquí iría la lógica para actualizar el perfil
    toast({
      title: "Perfil actualizado",
      description: "Los cambios se guardaron correctamente",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Mi Perfil</h2>
        <p className="text-muted-foreground mt-2">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary-hover">
                <UserCircle className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>{user?.nombre || "Usuario"}</CardTitle>
                <CardDescription>Información de tu cuenta</CardDescription>
              </div>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? "Guardar" : "Editar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre Completo
              </Label>
              {isEditing ? (
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              ) : (
                <div className="px-3 py-2 rounded-md bg-muted text-foreground">
                  {user?.nombre || "No disponible"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo Electrónico
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              ) : (
                <div className="px-3 py-2 rounded-md bg-muted text-foreground">
                  {user?.email || "No disponible"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usuario" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Nombre de Usuario
              </Label>
              <div className="px-3 py-2 rounded-md bg-muted text-foreground">
                {user?.usuario || "No disponible"}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Teléfono
              </Label>
              {isEditing ? (
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Opcional"
                />
              ) : (
                <div className="px-3 py-2 rounded-md bg-muted text-foreground">
                  {formData.telefono || "No especificado"}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Guardar Cambios
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    nombre: user?.nombre || "",
                    email: user?.email || "",
                    telefono: "",
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado de Cuenta</p>
                <p className="text-lg font-bold text-foreground">Activa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p className="text-lg font-bold text-foreground">2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID de Usuario</p>
                <p className="text-lg font-bold text-foreground">#{user?.idUsuario || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

