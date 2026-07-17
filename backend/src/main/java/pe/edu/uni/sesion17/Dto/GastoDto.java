package pe.edu.uni.sesion17.Dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class GastoDto {
    private int id_usuario;
    private int id_categoria;
    private String fecha;         // "2025-11-15"
    private double monto;         // positivo (lo convertimos a negativo en el service)
    private String descripcion;

    // Opcional: alertas
    private String alertaUsuario;
    private String alertaCategoria;
}

