package pe.edu.uni.sesion17.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import pe.edu.uni.sesion17.Dto.ReporteDto;
import pe.edu.uni.sesion17.Dto.ReporteCategoriaDto;

import java.sql.Date;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
public class ReporteService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * RF4 – Reporte mensual, trimestral o personalizado
     */
    public ReporteDto obtenerReportePeriodico(
            int idUsuario,
            int anio,
            int mesInicio,
            int mesFin
    ) {

        if (anio <= 0) {
            throw new IllegalArgumentException("El año debe ser mayor que 0.");
        }

        if (mesInicio < 1 || mesFin > 12 || mesInicio > mesFin) {
            throw new IllegalArgumentException("Rango de meses inválido.");
        }

        validarUsuarioExistente(idUsuario);

        // Rango de fechas [inicio, fin) en vez de YEAR()/MONTH() para que las
        // consultas puedan usar el índice IX_TRANSACCION_USUARIO_FECHA (sargable).
        Date fechaInicio = Date.valueOf(LocalDate.of(anio, mesInicio, 1));
        Date fechaFin = Date.valueOf(LocalDate.of(anio, mesFin, 1).plusMonths(1));

        // ===========================
        // 1. Total ingresos
        // ===========================
        String sqlIngresos = """
            SELECT ISNULL(SUM(t.monto),0)
            FROM TRANSACCION t
            JOIN CATEGORIA c ON t.id_categoria = c.id_categoria
            WHERE t.id_usuario = ?
              AND t.fecha >= ? AND t.fecha < ?
              AND c.id_tipo = 1
        """;

        double ingresos = jdbcTemplate.queryForObject(
                sqlIngresos,
                Double.class,
                idUsuario, fechaInicio, fechaFin
        );

        // ===========================
        // 2. Total gastos
        // ===========================
        String sqlGastos = """
            SELECT ISNULL(SUM(ABS(t.monto)),0)
            FROM TRANSACCION t
            JOIN CATEGORIA c ON t.id_categoria = c.id_categoria
            WHERE t.id_usuario = ?
              AND t.fecha >= ? AND t.fecha < ?
              AND c.id_tipo = 2
        """;

        double gastos = jdbcTemplate.queryForObject(
                sqlGastos,
                Double.class,
                idUsuario, fechaInicio, fechaFin
        );

        // ===========================
        // 3. Saldo
        // ===========================
        double saldo = ingresos - gastos;

        // ===========================
        // 4. Desglose por categoría
        // ===========================
        String sqlDesglose = """
            SELECT c.nombre,
                   ISNULL(SUM(ABS(t.monto)),0) AS total
            FROM TRANSACCION t
            JOIN CATEGORIA c ON t.id_categoria = c.id_categoria
            WHERE t.id_usuario = ?
              AND t.fecha >= ? AND t.fecha < ?
              AND c.id_tipo = 2
            GROUP BY c.nombre
            ORDER BY total DESC
        """;

        List<ReporteCategoriaDto> categorias = jdbcTemplate.query(
                sqlDesglose,
                (rs, rowNum) -> ReporteCategoriaDto.builder()
                        .categoria(rs.getString("nombre"))
                        .monto(rs.getDouble("total"))
                        .build(),
                idUsuario, fechaInicio, fechaFin
        );

        // ===========================
        // 4b. Desglose de ingresos por categoría
        // ===========================
        String sqlDesgloseIngresos = """
            SELECT c.nombre,
                   ISNULL(SUM(t.monto),0) AS total
            FROM TRANSACCION t
            JOIN CATEGORIA c ON t.id_categoria = c.id_categoria
            WHERE t.id_usuario = ?
              AND t.fecha >= ? AND t.fecha < ?
              AND c.id_tipo = 1
            GROUP BY c.nombre
            ORDER BY total DESC
        """;

        List<ReporteCategoriaDto> categoriasIngresos = jdbcTemplate.query(
                sqlDesgloseIngresos,
                (rs, rowNum) -> ReporteCategoriaDto.builder()
                        .categoria(rs.getString("nombre"))
                        .monto(rs.getDouble("total"))
                        .build(),
                idUsuario, fechaInicio, fechaFin
        );

        // ===========================
        // 5. Periodo
        // ===========================
        String periodo = formatearPeriodo(mesInicio, mesFin, anio);

        // ===========================
        // 6. Tipo de periodo
        // ===========================
        int nMeses = mesFin - mesInicio + 1;

        String tipoPeriodo = switch (nMeses) {
            case 1 -> "Mensual";
            case 3 -> "Trimestral";
            case 6 -> "Semestral";
            case 12 -> "Anual";
            default -> "Personalizado";
        };

        // ===========================
        // 7. Construcción del DTO
        // ===========================
        return ReporteDto.builder()
                .periodo(periodo)
                .tipoPeriodo(tipoPeriodo)
                .totalIngresos(ingresos)
                .totalGastos(gastos)
                .saldo(saldo)
                .categorias(categorias)
                .categoriasIngresos(categoriasIngresos)
                .build();
    }

    // Validar existencia del usuario
    private void validarUsuarioExistente(int idUsuario) {
        String sql = "SELECT COUNT(*) FROM USUARIO WHERE id_usuario = ?";
        int count = jdbcTemplate.queryForObject(sql, Integer.class, idUsuario);
        if (count == 0) {
            throw new IllegalArgumentException("El usuario con ID " + idUsuario + " no existe.");
        }
    }

    // Formateo de rango de meses
    private String formatearPeriodo(int mesInicio, int mesFin, int anio) {
        Locale es = new Locale("es");
        String ini = Month.of(mesInicio).getDisplayName(TextStyle.FULL, es);
        String fin = Month.of(mesFin).getDisplayName(TextStyle.FULL, es);

        ini = ini.substring(0,1).toUpperCase() + ini.substring(1);
        fin = fin.substring(0,1).toUpperCase() + fin.substring(1);

        if (mesInicio == mesFin) {
            return ini + " " + anio;
        }

        return ini + " - " + fin + " " + anio;
    }
}
