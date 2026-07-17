package pe.edu.uni.sesion17.Dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class TransaccionDto {
    private int idTransaccion;
    private int idUsuario;
    private int idCategoria;
    private String nombreCategoria;
    private int idTipo;              // 1 = Ingreso, 2 = Gasto
    private String tipoDescripcion;
    private String fecha;
    private double monto;
    private String descripcion;
}
