import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Sparkles } from "lucide-react";
import StatCard from "@/components/StatCard";
import TransactionList from "@/components/TransactionList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { transaccionesApi, presupuestosApi, reportesApi } from "@/lib/api";
import type { Transaction } from "@/types/budget";

interface BudgetWithSpent {
  id_presupuesto: number;
  nombre_categoria: string;
  monto_limite: number;
  spent: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const [transaccionesData, presupuestosData, reporteData] = await Promise.all([
        transaccionesApi.listar(),
        presupuestosApi.listarCategoria(),
        reportesApi.obtenerReporte({
          anio: currentYear,
          mesInicio: currentMonth,
          mesFin: currentMonth,
        }),
      ]);

      setTransactions(transaccionesData);
      setTotalIncome(reporteData.totalIngresos || 0);
      setTotalExpenses(Math.abs(reporteData.totalGastos || 0));
      setBalance(reporteData.saldo || 0);

      // Calcular gastos por presupuesto
      const budgetsWithSpent = presupuestosData
        .filter((budget: any) => budget.año === currentYear && budget.mes === currentMonth)
        .map((budget: any) => {
          const gastos = transaccionesData
            .filter((t: any) => 
              t.idCategoria === budget.id_categoria &&
              t.idTipo === 2 &&
              new Date(t.fecha).getFullYear() === currentYear &&
              new Date(t.fecha).getMonth() + 1 === currentMonth
            )
            .reduce((sum: number, t: any) => sum + Math.abs(t.monto), 0);

          return {
            id_presupuesto: budget.id_presupuesto,
            nombre_categoria: budget.nombre_categoria,
            monto_limite: budget.monto_limite,
            spent: gastos,
          };
        });

      setBudgets(budgetsWithSpent);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-hover shadow-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              {getGreeting()}, {user?.nombre?.split(" ")[0] || "Usuario"}
            </h2>
            <p className="text-muted-foreground">
              Resumen general de tus finanzas personales
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Cargando estadísticas...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Balance Total"
            value={formatCurrency(balance)}
            icon={<Wallet className="h-6 w-6" />}
            variant="default"
          />
          <StatCard
            title="Ingresos del Mes"
            value={formatCurrency(totalIncome)}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="income"
          />
          <StatCard
            title="Gastos del Mes"
            value={formatCurrency(totalExpenses)}
            icon={<TrendingDown className="h-6 w-6" />}
            variant="expense"
          />
          <StatCard
            title="Presupuestos Activos"
            value={budgets.length.toString()}
            icon={<PiggyBank className="h-6 w-6" />}
            variant="warning"
          />
        </div>
      )}

      {/* Charts Section */}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Mes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ingresos</span>
                  <span className="font-semibold text-income">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gastos</span>
                  <span className="font-semibold text-expense">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between">
                  <span className="font-semibold">Balance</span>
                  <span className={`font-bold ${balance >= 0 ? "text-income" : "text-expense"}`}>
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
          <CardHeader>
            <CardTitle>Estado de Presupuestos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay presupuestos activos este mes.</p>
            ) : (
              budgets.map((budget) => {
                const percentage = (budget.spent / budget.monto_limite) * 100;
              const isOverBudget = percentage > 100;

                return (
                  <div key={budget.id_presupuesto} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {budget.nombre_categoria}
                      </span>
                      <span
                        className={`font-semibold ${
                          isOverBudget ? "text-expense" : "text-muted-foreground"
                        }`}
                      >
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.monto_limite)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isOverBudget ? "bg-expense" : "bg-income"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {isOverBudget && (
                    <p className="text-xs text-expense font-medium">
                      ⚠️ Has excedido el presupuesto en {percentage.toFixed(0)}%
                    </p>
                  )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
        </div>
      )}

      {/* Recent Transactions */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Cargando transacciones...</p>
          </CardContent>
        </Card>
      ) : (
        <TransactionList transactions={transactions} limit={5} />
      )}
    </div>
  );
}
