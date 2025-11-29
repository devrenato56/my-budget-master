package pe.edu.uni.sesion17.Dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoriaDto {
    private int idCategoria;
    private int idUsuario;
    private int idTipo; // 1 ingreso, 2 gasto
    private String tipoDescripcion;
    private String nombre;
    private String descripcion;
    private boolean activa;
}
