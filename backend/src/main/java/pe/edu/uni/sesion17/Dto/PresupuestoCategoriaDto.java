package pe.edu.uni.sesion17.Dto;

import lombok.Data;

@Data
public class PresupuestoCategoriaDto {
    private int idPresupuesto;   // solo se completa al listar
    private int idUsuario;
    private int idCategoria;
    private String nombreCategoria; // solo se completa al listar
    private int anio;
    private int mes;
    private double montoLimite;
    private int idEstado;  // 1 = Dentro del límite, 2 = Presupuesto excedido
}