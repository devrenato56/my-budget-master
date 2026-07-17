import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TransactionList from "@/components/TransactionList";
import { useToast } from "@/hooks/use-toast";
import { transaccionesApi, ingresosApi, gastosApi, categoriasApi } from "@/lib/api";
import type { Transaction, Category } from "@/types/budget";

export default function Transactions() {
  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"1" | "2">("2");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transaccionesData, categoriasData] = await Promise.all([
        transaccionesApi.listar(),
        categoriasApi.listar(),
      ]);
      console.log("Transacciones cargadas:", transaccionesData);
      console.log("Categorías cargadas:", categoriasData);
      setTransactions(transaccionesData || []);
      setCategories(categoriasData || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setTransactions([]);
      setCategories([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Verifica que el servidor esté funcionando.",
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
      const idCategoria = parseInt(formData.get("categoria") as string);
      console.log("Form Data - idCategoria:", idCategoria, "Raw:", formData.get("categoria"));

      const data = {
        idCategoria: idCategoria,
        fecha: formData.get("fecha") as string,
        monto: parseFloat(formData.get("monto") as string),
        descripcion: formData.get("descripcion") as string || undefined,
      };

      let result;
      if (transactionType === "1") {
        result = await ingresosApi.registrar(data);
      } else {
        result = await gastosApi.registrar(data);
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Transacción registrada",
        description: `${transactionType === "1" ? "Ingreso" : "Gasto"} de S/ ${data.monto} agregado exitosamente.`,
      });

      // Mostrar alertas si existen (solo para gastos)
      if (transactionType === "2" && result) {
        const alertas: string[] = [];

        if (result.alerta_usuario && result.alerta_usuario.includes("⚠️")) {
          alertas.push(result.alerta_usuario);
        }

        if (result.alerta_categoria && result.alerta_categoria.includes("⚠️")) {
          alertas.push(result.alerta_categoria);
        }

        if (alertas.length > 0) {
          toast({
            title: "⚠️ Alerta de Presupuesto",
            description: alertas.join("\n"),
            variant: "destructive",
            duration: 8000, // Mostrar por más tiempo
          });
        }
      }

      setOpen(false);
      loadData(); // Recargar transacciones
    } catch (error: any) {
      console.error("Error al registrar transacción:", error);
      // Si el error viene del backend con mensaje de presupuesto, mostrarlo completo
      const errorMessage = error?.message || error?.toString() || "No se pudo registrar la transacción. Intenta nuevamente.";

      toast({
        title: errorMessage.includes("⚠️") ? "⚠️ Presupuesto Excedido" : "Error",
        description: errorMessage, // Show the actual error message
        variant: "destructive",
        duration: 10000, // Mostrar por más tiempo si es error de presupuesto
      });
    } finally {
      setSubmitting(false);
    }
  };

  const incomeCategories = categories.filter((c) => c.idTipo === 1);
  const expenseCategories = categories.filter((c) => c.idTipo === 2);
  const currentCategories = transactionType === "1" ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Transacciones</h2>
          <p className="text-muted-foreground">
            Registra y gestiona tus ingresos y gastos
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Transacción
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Transacción</DialogTitle>
              <DialogDescription>
                Ingresa los detalles de tu ingreso o gasto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Transacción</Label>
                <Select
                  value={transactionType}
                  onValueChange={(value) => setTransactionType(value as "1" | "2")}
                >
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
                <Label htmlFor="categoria">Categoría</Label>
                <Select name="categoria" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCategories.map((cat) => (
                      <SelectItem key={cat.idCategoria} value={cat.idCategoria.toString()}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto (S/)</Label>
                  <Input
                    id="monto"
                    name="monto"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Agrega detalles sobre esta transacción (opcional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Registrando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar transacciones..." className="pl-9" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">Ingresos</SelectItem>
                  <SelectItem value="2">Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.idCategoria} value={cat.idCategoria.toString()}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Cargando transacciones...</p>
          </CardContent>
        </Card>
      ) : (
        <TransactionList transactions={transactions} />
      )}
    </div>
  );
}
