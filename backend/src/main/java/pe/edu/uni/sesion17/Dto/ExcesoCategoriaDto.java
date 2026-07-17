package pe.edu.uni.sesion17.Dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExcesoCategoriaDto {
    private int idUsuario;
    private int idCategoria;
    private int anio;
    private int mes;
    private double montoLimite;
    private int idEstado;
}

