import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { categoriasApi } from "@/lib/api";
import type { Category } from "@/types/budget";

export default function Categories() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCategories();
    }
  }, [isAuthenticated, user]);

  const loadCategories = async () => {
    if (!user) {
      console.error("Usuario no autenticado");
      return;
    }

    try {
      setLoading(true);
      const data = await categoriasApi.listar();
      setCategories(data || []);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setCategories([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      setSubmitting(true);
      await categoriasApi.crear({
        idTipo: parseInt(formData.get("tipo") as string),
        nombre: formData.get("nombre") as string,
        descripcion: formData.get("descripcion") as string || undefined,
      });

      toast({
        title: "Categoría creada",
        description: `La categoría "${formData.get("nombre")}" ha sido agregada exitosamente.`,
      });

      setOpen(false);
      loadCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;

    const formData = new FormData(e.currentTarget);

    try {
      setSubmitting(true);
      await categoriasApi.actualizar({
        idCategoria: editingCategory.idCategoria,
        idTipo: parseInt(formData.get("tipo") as string),
        nombre: formData.get("nombre") as string,
        descripcion: formData.get("descripcion") as string || undefined,
        activa: true,
      });

      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente.",
      });

      setEditOpen(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await categoriasApi.eliminar(id);
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente.",
      });
      setDeleteId(null);
      loadCategories();
    } catch (error: any) {
      // Mostrar el mensaje de error del backend si está disponible
      const errorMessage = error?.message || "No se pudo eliminar la categoría.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 6000, // Mostrar por más tiempo para que el usuario lea el mensaje
      });
    }
  };

  const incomeCategories = categories.filter((c) => c.idTipo === 1);
  const expenseCategories = categories.filter((c) => c.idTipo === 2);

  const CategoryCard = ({ category }: { category: Category }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${category.idTipo === 1 ? "bg-income/10" : "bg-expense/10"}`}>
              <FolderOpen className={`h-5 w-5 ${category.idTipo === 1 ? "text-income" : "text-expense"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{category.nombre}</h3>
              <Badge variant="outline" className="mt-1">
                {category.idTipo === 1 ? "Ingreso" : "Gasto"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEdit(category)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeleteId(category.idCategoria)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {category.descripcion && (
          <p className="text-sm text-muted-foreground">{category.descripcion}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Categorías</h2>
          <p className="text-muted-foreground">
            Organiza tus transacciones con categorías personalizadas
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Categoría</DialogTitle>
              <DialogDescription>
                Agrega una nueva categoría para clasificar tus transacciones
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select name="tipo" defaultValue="2" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ingreso</SelectItem>
                    <SelectItem value="2">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Categoría</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Alquiler, Salario, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Agrega una descripción para esta categoría"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Creando..." : "Crear Categoría"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Income Categories */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Cargando categorías...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-income">Categorías de Ingreso</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incomeCategories.length > 0 ? (
                incomeCategories.map((category) => (
                  <CategoryCard key={category.idCategoria} category={category} />
                ))
              ) : (
                <p className="text-muted-foreground">No hay categorías de ingreso.</p>
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-expense">Categorías de Gasto</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.length > 0 ? (
                expenseCategories.map((category) => (
                  <CategoryCard key={category.idCategoria} category={category} />
                ))
              ) : (
                <p className="text-muted-foreground">No hay categorías de gasto.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la categoría
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo</Label>
                <Select name="tipo" defaultValue={editingCategory.id_tipo.toString()} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ingreso</SelectItem>
                    <SelectItem value="2">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre de la Categoría</Label>
                <Input
                  id="edit-nombre"
                  name="nombre"
                  defaultValue={editingCategory.nombre}
                  placeholder="Ej: Alquiler, Salario, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-descripcion">Descripción (opcional)</Label>
                <Textarea
                  id="edit-descripcion"
                  name="descripcion"
                  defaultValue={editingCategory.descripcion || ""}
                  placeholder="Agrega una descripción para esta categoría"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
