package pe.edu.uni.sesion17.Dto;


import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class IngresoDto {

    private int idUsuario;
    private int idCategoria;

    private String fechaTexto;   // yyyy-MM-dd
    private String horaTexto;    // HH:mm

    private String fecha;        // fecha final combinada yyyy-MM-dd HH:mm:ss
    private double monto;
    private String descripcion;     // Fecha en formato YYYY-MM-DD (String, no Date)
}