package pe.edu.uni.sesion17.Dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder

    public class ReporteCategoriaDto {
        private String categoria;
        private double monto;
    }
