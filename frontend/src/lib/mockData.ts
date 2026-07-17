// Mock data for demonstration purposes until backend is connected
import { Transaction, Category, Budget, DashboardStats } from "@/types/budget";

export const mockCategories: Category[] = [
  { id_categoria: 1, id_usuario: 1, id_tipo: 1, nombre: "Salario", descripcion: "Ingreso mensual", activa: true },
  { id_categoria: 2, id_usuario: 1, id_tipo: 1, nombre: "Freelance", descripcion: "Trabajos independientes", activa: true },
  { id_categoria: 3, id_usuario: 1, id_tipo: 2, nombre: "Alimentación", descripcion: "Comidas y supermercado", activa: true },
  { id_categoria: 4, id_usuario: 1, id_tipo: 2, nombre: "Transporte", descripcion: "Transporte público y combustible", activa: true },
  { id_categoria: 5, id_usuario: 1, id_tipo: 2, nombre: "Entretenimiento", descripcion: "Ocio y diversión", activa: true },
  { id_categoria: 6, id_usuario: 1, id_tipo: 2, nombre: "Servicios", descripcion: "Luz, agua, internet", activa: true },
];

export const mockTransactions: Transaction[] = [
  {
    id_transaccion: 1,
    id_usuario: 1,
    id_categoria: 1,
    fecha: "2025-11-01T00:00:00",
    monto: 3500.00,
    descripcion: "Salario noviembre",
    fecha_registro: "2025-11-01T00:00:00",
    categoria: mockCategories[0],
  },
  {
    id_transaccion: 2,
    id_usuario: 1,
    id_categoria: 3,
    fecha: "2025-11-05T00:00:00",
    monto: 250.50,
    descripcion: "Compra en supermercado",
    fecha_registro: "2025-11-05T00:00:00",
    categoria: mockCategories[2],
  },
  {
    id_transaccion: 3,
    id_usuario: 1,
    id_categoria: 4,
    fecha: "2025-11-10T00:00:00",
    monto: 150.00,
    descripcion: "Recarga de combustible",
    fecha_registro: "2025-11-10T00:00:00",
    categoria: mockCategories[3],
  },
  {
    id_transaccion: 4,
    id_usuario: 1,
    id_categoria: 2,
    fecha: "2025-11-15T00:00:00",
    monto: 800.00,
    descripcion: "Proyecto freelance",
    fecha_registro: "2025-11-15T00:00:00",
    categoria: mockCategories[1],
  },
  {
    id_transaccion: 5,
    id_usuario: 1,
    id_categoria: 5,
    fecha: "2025-11-20T00:00:00",
    monto: 120.00,
    descripcion: "Cine y cena",
    fecha_registro: "2025-11-20T00:00:00",
    categoria: mockCategories[4],
  },
];

export const mockBudgets: Budget[] = [
  {
    id_presupuesto: 1,
    id_usuario: 1,
    id_categoria: 3,
    año: 2025,
    mes: 11,
    monto_limite: 500.00,
    activo: true,
    id_estado: 2,
    categoria: mockCategories[2],
  },
  {
    id_presupuesto: 2,
    id_usuario: 1,
    id_categoria: 4,
    año: 2025,
    mes: 11,
    monto_limite: 300.00,
    activo: true,
    id_estado: 1,
    categoria: mockCategories[3],
  },
];

export const mockDashboardStats: DashboardStats = {
  totalIncome: 4300.00,
  totalExpenses: 520.50,
  balance: 3779.50,
  monthlyChange: 15.5,
};
