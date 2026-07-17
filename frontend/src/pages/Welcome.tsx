import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiggyBank, TrendingUp, Shield, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
            <PiggyBank className="h-10 w-10 text-primary animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">¡Bienvenido de nuevo!</h2>
          <p className="text-muted-foreground">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: TrendingUp,
      title: "Control Total",
      description: "Gestiona tus ingresos y gastos de manera inteligente",
    },
    {
      icon: BarChart3,
      title: "Reportes Detallados",
      description: "Visualiza tu situación financiera con gráficos y análisis",
    },
    {
      icon: Shield,
      title: "Presupuestos",
      description: "Establece límites y recibe alertas cuando los excedas",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {/* Header */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary-hover shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300">
              <PiggyBank className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-hover to-secondary bg-clip-text text-transparent">
              BudgetMaster
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Toma el control de tus finanzas personales con la herramienta más completa y fácil de usar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Iniciar Sesión
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/register")}
                className="text-lg px-8 py-6 h-auto border-2 hover:bg-accent transition-all duration-300 transform hover:scale-105"
              >
                Crear Cuenta
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group relative p-8 rounded-2xl bg-card border border-border shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats or additional info */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Gestiona tus finanzas de forma inteligente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

