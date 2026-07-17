import { useState, useEffect } from "react";
import { Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { presupuestosApi, categoriasApi, transaccionesApi } from "@/lib/api";
import type { Category } from "@/types/budget";

interface BudgetWithSpent {
  id_presupuesto: number;
  id_categoria: number;
  nombre_categoria: string;
  año: number;
  mes: number;
  monto_limite: number;
  id_estado: number;
  spent: number;
}

export default function Budgets() {
  const [open, setOpen] = useState(false);
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [presupuestosData, categoriasData, transaccionesData] = await Promise.all([
        presupuestosApi.listarCategoria(),
        categoriasApi.listar(),
        transaccionesApi.listar(),
      ]);

      setCategories(categoriasData);

      // Calcular gastos por categoría
      const budgetsWithSpent = presupuestosData.map((budget: any) => {
        const gastos = transaccionesData
          .filter((t: any) =>
            t.idCategoria === budget.id_categoria &&
            t.idTipo === 2 && // solo gastos
            new Date(t.fecha).getFullYear() === budget.año &&
            new Date(t.fecha).getMonth() + 1 === budget.mes
          )
          .reduce((sum: number, t: any) => sum + Math.abs(t.monto), 0);

        return {
          id_presupuesto: budget.id_presupuesto,
          id_categoria: budget.id_categoria,
          nombre_categoria: budget.nombre_categoria,
          año: budget.año,
          mes: budget.mes,
          monto_limite: budget.monto_limite,
          id_estado: budget.id_estado,
          spent: gastos,
        };
      });

      setBudgets(budgetsWithSpent);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los presupuestos.",
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
      await presupuestosApi.crearCategoria({
        idCategoria: parseInt(formData.get("categoria") as string),
        anio: parseInt(formData.get("año") as string),
        mes: parseInt(formData.get("mes") as string),
        montoLimite: parseFloat(formData.get("monto_limite") as string),
      });

      toast({
        title: "Presupuesto creado",
        description: `Presupuesto de S/ ${formData.get("monto_limite")} establecido exitosamente.`,
      });

      setOpen(false);
      loadData();
      setOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error al crear presupuesto:", error);
      const errorMessage = error?.message || error?.toString() || "No se pudo crear el presupuesto.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const expenseCategories = categories.filter((c) => c.idTipo === 2);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Presupuestos</h2>
          <p className="text-muted-foreground">
            Establece límites de gasto y mantén tus finanzas bajo control
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Presupuesto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Presupuesto</DialogTitle>
              <DialogDescription>
                Define un límite de gasto para una categoría específica
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría de Gasto</Label>
                <Select name="categoria" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.idCategoria} value={cat.idCategoria.toString()}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="año">Año</Label>
                  <Select name="año" defaultValue="2025" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mes">Mes</Label>
                  <Select name="mes" defaultValue="11" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Enero</SelectItem>
                      <SelectItem value="2">Febrero</SelectItem>
                      <SelectItem value="3">Marzo</SelectItem>
                      <SelectItem value="4">Abril</SelectItem>
                      <SelectItem value="5">Mayo</SelectItem>
                      <SelectItem value="6">Junio</SelectItem>
                      <SelectItem value="7">Julio</SelectItem>
                      <SelectItem value="8">Agosto</SelectItem>
                      <SelectItem value="9">Septiembre</SelectItem>
                      <SelectItem value="10">Octubre</SelectItem>
                      <SelectItem value="11">Noviembre</SelectItem>
                      <SelectItem value="12">Diciembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto_limite">Monto Límite (S/)</Label>
                <Input
                  id="monto_limite"
                  name="monto_limite"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Creando..." : "Crear Presupuesto"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Overview */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Cargando presupuestos...</p>
          </CardContent>
        </Card>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No hay presupuestos registrados. Crea uno para comenzar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.monto_limite) * 100;
            const isOverBudget = percentage > 100;
            const isWarning = percentage > 80 && percentage <= 100;
            const remaining = budget.monto_limite - budget.spent;

            return (
              <Card key={budget.id_presupuesto} className="overflow-hidden">
                <div
                  className={`h-1 ${isOverBudget ? "bg-expense" : isWarning ? "bg-warning" : "bg-success"
                    }`}
                />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{budget.nombre_categoria}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {monthNames[budget.mes - 1]} {budget.año}
                      </p>
                    </div>
                    {isOverBudget ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Excedido
                      </Badge>
                    ) : isWarning ? (
                      <Badge className="bg-warning text-white gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Alerta
                      </Badge>
                    ) : (
                      <Badge className="bg-success text-white gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Bien
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gastado</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Límite</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(budget.monto_limite)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Restante</span>
                      <span
                        className={`text-lg font-bold ${isOverBudget ? "text-expense" : "text-success"
                          }`}
                      >
                        {isOverBudget ? "-" : ""}
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                    {isOverBudget && (
                      <p className="text-xs text-expense mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Has excedido el presupuesto en {percentage.toFixed(0)}%
                      </p>
                    )}
                    {isWarning && (
                      <p className="text-xs text-warning mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Cerca del límite ({percentage.toFixed(0)}% usado)
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Budget Tips Card */}
      <Card className="bg-accent/50 border-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Consejos para Gestionar tu Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Revisa tus presupuestos semanalmente para evitar sorpresas al final del mes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Ajusta los límites basándote en tus patrones de gasto reales</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Recibe alertas cuando alcances el 80% de tu límite presupuestario</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Considera crear presupuestos separados para diferentes objetivos financieros</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
