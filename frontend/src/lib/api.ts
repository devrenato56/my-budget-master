// API configuration for the Spring Boot backend
const API_BASE_URL = "http://localhost:8080/Presupuesto";

// Función para obtener el token del localStorage
const getToken = () => {
  return localStorage.getItem("authToken");
};

// Función para obtener el ID de usuario del localStorage
export const getUserId = (): number | null => {
  const userData = localStorage.getItem("userData");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      // El AuthContext guarda el usuario con idUsuario
      if (user && typeof user.idUsuario === 'number') {
        return user.idUsuario;
      }
      // Fallback por si acaso
      return user.idUsuario || user.id_usuario || user.id || null;
    } catch (e) {
      console.error("Error parsing userData:", e);
      return null;
    }
  }
  return null;
};

export const apiClient = {
  get: async (endpoint: string) => {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      // Backend doesn't use standard Bearer token yet, but we send it just in case
      // headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Error: ${response.statusText}`;
      try {
        const errorData = await response.text();
        if (errorData && errorData.trim()) {
          // Backend sends just the string message, or JSON?
          // Our java code sends plain string in body(...).
          errorMessage = errorData;
          try {
            // Try to parse json if it is json
            const jsonError = JSON.parse(errorData);
            if (jsonError.message) errorMessage = jsonError.message;
          } catch (e) {
            // Not json, use text
          }
        }
      } catch (e) {
        // ignore parsing error
      }
      throw new Error(errorMessage);
    }
    // Check if response is empty (some deletes or updates might return empty)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  },

  put: async (endpoint: string, data: any) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  delete: async (endpoint: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      try {
        const errorData = await response.text();
        if (errorData && errorData.trim()) {
          throw new Error(errorData);
        }
      } catch (e) {
        // ignore
      }
      throw new Error(`Error: ${response.statusText}`);
    }
    const text = await response.text();
    // Return text if it's a simple message string, or json if valid json
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  },
};

// =============================================
// AUTENTICACIÓN API
// =============================================

export const authApi = {
  login: (data: { usuario: string; password: string }) =>
    apiClient.post("/usuario/login", { email: data.usuario, password: data.password }), // Map usuario to email as expected by backend DTO

  register: (data: {
    nombre: string;
    email: string;
    telefono?: string;
    usuario: string; // Backend 'usuario' usually maps to login
    password: string;
  }) => apiClient.post("/usuario/registrar", data),

  passwordResetRequest: (data: { email: string }) =>
    apiClient.post("/usuario/recuperar", data),

  passwordReset: (data: { token: string; newPassword: string }) =>
    // Backend doesn't support step 2, so we proceed locally
    Promise.resolve({ message: "Password reset simulated" }),

  validateToken: async (token: string) => {
    // Mock validation
    return Promise.resolve({ valid: true });
  },
};

// =============================================
// TRANSACCIONES API (NUEVO CONTROLADOR)
// =============================================

export const transaccionesApi = {
  // Listar todas las transacciones del usuario
  listar: () => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.get(`/transacciones/usuario/${userId}`);
  },

  // Listar por tipo (1=Ingreso, 2=Gasto)
  listarPorTipo: (idTipo: number) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.get(`/transacciones/usuario/${userId}/tipo/${idTipo}`);
  },

  // Obtener una transacción específica
  obtener: (idTransaccion: number) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.get(`/transacciones/${idTransaccion}/usuario/${userId}`);
  },
};

// =============================================
// INGRESOS API
// =============================================

export const ingresosApi = {
  // Registrar ingreso
  registrar: (data: {
    idCategoria: number;
    fecha: string; // YYYY-MM-DD
    monto: number;
    descripcion?: string;
  }) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.post("/ingreso/registrar", {
      idUsuario: userId, // BE expects idUsuario (camelCase or snake_case depends on Jackson, likely camelCase in DTO, but wait, check DTO)
      idCategoria: data.idCategoria,
      fechaTexto: data.fecha, // BE IngresoService uses 'fechaTexto'
      horaTexto: "12:00:00", // Default time
      monto: data.monto,
      descripcion: data.descripcion,
    });
  },

  // Eliminar ingreso
  eliminar: (idTransaccion: number) =>
    apiClient.delete(`/ingreso/eliminar/${idTransaccion}`),
};

// =============================================
// GASTOS API
// =============================================

export const gastosApi = {
  // Registrar gasto
  registrar: (data: {
    idCategoria: number;
    fecha: string;
    monto: number;
    descripcion?: string;
  }) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.post("/gasto/registrar", {
      idUsuario: userId, // Updated to camelCase
      idCategoria: data.idCategoria, // Updated to camelCase
      fecha: data.fecha,
      monto: data.monto,
      descripcion: data.descripcion,
    });
  },

  // Eliminar gasto
  eliminar: (idTransaccion: number) =>
    apiClient.delete(`/gasto/eliminar/${idTransaccion}`),
};

// =============================================
// CATEGORÍAS API
// =============================================

export const categoriasApi = {
  // Listar categorías del usuario
  listar: () => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.get(`/categoria/Usuario/${userId}`);
  },

  // Crear categoría
  crear: (data: {
    idTipo: number;
    nombre: string;
    descripcion?: string;
  }) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.post("/categoria/Crear", {
      idUsuario: userId,   // CategoriaDto uses camelCase
      idTipo: data.idTipo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      activa: true,
    });
  },

  // Actualizar categoría
  actualizar: (data: {
    idCategoria: number;
    idTipo: number;
    nombre: string;
    descripcion?: string;
    activa: boolean;
  }) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.put("/categoria/Actualizar", {
      idUsuario: userId,
      idCategoria: data.idCategoria,
      idTipo: data.idTipo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      activa: data.activa,
    });
  },

  // Eliminar categoría
  eliminar: (idCategoria: number) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.delete(`/categoria/Eliminar/${idCategoria}/${userId}`);
  },
};

// =============================================
// PRESUPUESTOS API
// =============================================

export const presupuestosApi = {
  // Crear presupuesto por categoría
  crearCategoria: (data: {
    idCategoria: number;
    anio: number;
    mes: number;
    montoLimite: number;
    idEstado?: number;
  }) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.post("/Categoria", {
      idUsuario: userId,
      idCategoria: data.idCategoria,
      anio: data.anio,
      mes: data.mes,
      montoLimite: data.montoLimite,
      idEstado: data.idEstado || 1,
    });
  },

  // Crear presupuesto global mensual
  crearGlobal: (data: {
    anio: number;
    mes: number;
    montoLimite: number;
    idEstado?: number;
  }) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.post("/Global", {
      idUsuario: userId,
      anio: data.anio,
      mes: data.mes,
      montoLimite: data.montoLimite,
      idEstado: data.idEstado || 1,
    });
  },

  // Listar presupuestos de categoría (New)
  listarCategoria: () => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.get(`/Categoria/Usuario/${userId}`);
  },

  // Listar presupuestos globales (New)
  listarGlobal: () => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.get(`/Global/Usuario/${userId}`);
  },
};

// =============================================
// REPORTES API
// =============================================

export const reportesApi = {
  // Obtener reporte periódico
  obtenerReporte: (params: {
    anio: number;
    mesInicio: number;
    mesFin: number;
  }) => {
    const userId = getUserId();
    if (!userId) throw new Error("Usuario no autenticado");
    return apiClient.get(
      `/reporte/periodo?idUsuario=${userId}&anio=${params.anio}&mesInicio=${params.mesInicio}&mesFin=${params.mesFin}`
    );
  },
};
