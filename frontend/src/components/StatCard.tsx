import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "income" | "expense" | "warning";
}

export default function StatCard({ title, value, icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "from-primary/10 to-primary/5",
    income: "from-income/10 to-income/5",
    expense: "from-expense/10 to-expense/5",
    warning: "from-warning/10 to-warning/5",
  };

  const iconStyles = {
    default: "bg-primary text-primary-foreground",
    income: "bg-income text-white",
    expense: "bg-expense text-white",
    warning: "bg-warning text-white",
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", variantStyles[variant])} />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-expense"
                  )}
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">vs mes anterior</span>
              </div>
            )}
          </div>
          <div className={cn("rounded-xl p-3 shadow-md", iconStyles[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
