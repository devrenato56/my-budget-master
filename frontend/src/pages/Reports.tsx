import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reportesApi } from "@/lib/api";

interface CategoryData {
  nombre: string;
  valor: number;
  color: string;
  tipo?: string; // "Ingreso", "Gasto", "Mixto"
  saldo?: number; // Saldo de la categoría (ingresos - gastos)
}

export default function Reports() {
  const [periodo, setPeriodo] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [balance, setBalance] = useState(0);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      
      let mesInicio = mes;
      let mesFin = mes;

      if (periodo === "quarterly") {
        const quarter = Math.ceil(mes / 3);
        mesInicio = (quarter - 1) * 3 + 1;
        mesFin = quarter * 3;
      } else if (periodo === "yearly") {
        mesInicio = 1;
        mesFin = 12;
      }

      const data = await reportesApi.obtenerReporte({
        anio,
        mesInicio,
        mesFin,
      });

      setTotalIngresos(data.totalIngresos || 0);
      setTotalGastos(Math.abs(data.totalGastos || 0));
      setBalance(data.saldo || 0);

      // Preparar datos de categorías para el gráfico
      const colors = [
        "hsl(var(--expense))",
        "hsl(217, 91%, 35%)",
        "hsl(158, 64%, 45%)",
        "hsl(38, 92%, 50%)",
        "hsl(280, 65%, 60%)",
        "hsl(var(--muted-foreground))",
      ];

      const catData = (data.categorias || []).map((cat: any, index: number) => {
        // Determinar color según tipo
        let color = colors[index % colors.length];
        if (cat.tipo === "Ingreso") {
          color = "hsl(var(--income))";
        } else if (cat.tipo === "Gasto") {
          color = "hsl(var(--expense))";
        } else if (cat.tipo === "Mixto") {
          color = "hsl(280, 65%, 60%)";
        }
        
        return {
          nombre: cat.categoria || cat.nombre,
          valor: Math.abs(cat.monto || 0),
          color: color,
          tipo: cat.tipo || "Gasto",
          saldo: cat.saldo || 0,
        };
      });

      setCategoryData(catData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Reportes Financieros</h2>
        <p className="text-muted-foreground">
          Analiza tus patrones de ingreso y gasto
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Año</Label>
              <Select value={anio.toString()} onValueChange={(value) => setAnio(parseInt(value))}>
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
              <Label>Mes</Label>
              <Select 
                value={mes.toString()} 
                onValueChange={(value) => setMes(parseInt(value))}
                disabled={periodo === "yearly"}
              >
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

            <div className="space-y-2">
              <Label className="invisible">Acción</Label>
              <Button onClick={loadReport} disabled={loading} className="w-full">
                {loading ? "Cargando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-income/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-income" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ingresos</p>
                <p className="text-2xl font-bold text-income">{formatCurrency(totalIngresos)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {periodo === "monthly" ? "Mensual" : periodo === "quarterly" ? "Trimestral" : "Anual"} - {anio}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-expense/10 rounded-xl">
                <TrendingDown className="h-6 w-6 text-expense" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gastos</p>
                <p className="text-2xl font-bold text-expense">{formatCurrency(totalGastos)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {periodo === "monthly" ? "Mensual" : periodo === "quarterly" ? "Trimestral" : "Anual"} - {anio}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance Neto</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(balance)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {periodo === "monthly" ? "Mensual" : periodo === "quarterly" ? "Trimestral" : "Anual"} - {anio}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Generando gráficos...</p>
          </CardContent>
        </Card>
      ) : categoryData.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No hay datos de gastos por categoría para mostrar.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.nombre}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown Table */}
      {!loading && categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Desglose Detallado por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Categoría</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Tipo</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Monto</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Saldo</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((category) => {
                    const total = categoryData.reduce((sum, cat) => sum + cat.valor, 0);
                    const percentage = total > 0 ? ((category.valor / total) * 100).toFixed(1) : "0";
                    const saldo = category.saldo || 0;
                    return (
                      <tr key={category.nombre} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-foreground font-medium">{category.nombre}</td>
                        <td className="text-center py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            category.tipo === "Ingreso" 
                              ? "bg-income/10 text-income" 
                              : category.tipo === "Gasto"
                              ? "bg-expense/10 text-expense"
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {category.tipo || "Gasto"}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 font-medium text-foreground">
                          {formatCurrency(category.valor)}
                        </td>
                        <td className={`text-right py-3 px-4 font-medium ${
                          saldo >= 0 ? "text-income" : "text-expense"
                        }`}>
                          {formatCurrency(saldo)}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
