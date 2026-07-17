export interface User {
  idUsuario: number;
  nombre: string;
  email: string;
  telefono?: string;
  usuario: string;
  fechaRegistro: string;
}

export interface TransactionType {
  idTipo: number;
  descripcion: "Ingreso" | "Gasto";
}

export interface Category {
  idCategoria: number; // camelCase matching backend
  idUsuario: number;
  idTipo: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  // Support legacy snake_case for now if needed, but better to migrate
  // id_categoria?: number;
  // id_tipo?: number;
}

export interface Transaction {
  idTransaccion: number; // camelCase
  idUsuario: number;
  idCategoria: number;
  idTipo: number; // Added from flat DTO
  nombreCategoria: string; // Added from flat DTO
  fecha: string;
  monto: number;
  descripcion?: string;
  fechaRegistro?: string;
  categoria?: Category; // Optional, might not be populated by backend
}

export interface BudgetState {
  idEstado: number;
  descripcion: string;
}

export interface Budget {
  idPresupuesto: number;
  idUsuario: number;
  idCategoria: number;
  anio: number;
  mes: number;
  montoLimite: number;
  activo: boolean;
  idEstado: number;
  categoria?: Category;
  estado?: BudgetState;
}

export interface GlobalBudget {
  idPresupuestoGlobal: number;
  idUsuario: number;
  anio: number;
  mes: number;
  montoLimite: number;
  idEstado: number;
  estado?: BudgetState;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyChange: number;
}

export interface CategoryReport {
  categoria: string;
  monto: number;
  porcentaje: number;
}

export interface MonthlyReport {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
}
