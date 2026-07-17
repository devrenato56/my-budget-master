package pe.edu.uni.sesion17.Dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder

public class ReporteDto {
    private String periodo;
    private String tipoPeriodo;
    private double totalIngresos;
    private double totalGastos;
    private double saldo;
    private List<ReporteCategoriaDto> categorias;          // desglose de gastos por categoría
    private List<ReporteCategoriaDto> categoriasIngresos;  // desglose de ingresos por categoría
}