package pe.edu.uni.sesion17.Dto;

import lombok.Data;

@Data
public class PresupuestoCategoriaDto {
    private int idUsuario;
    private int idCategoria;
    private int anio;
    private int mes;
    private int montoLimite;
    private int idEstado;  // Ejemplo: 1 = Activo, 0 = Inactivo
}