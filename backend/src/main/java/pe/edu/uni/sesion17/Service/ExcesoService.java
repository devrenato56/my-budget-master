package pe.edu.uni.sesion17.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.uni.sesion17.Dto.ExcesoCategoriaDto;
import pe.edu.uni.sesion17.Dto.ExcesoGlobalDto;

import java.time.LocalDate;

@Service
public class ExcesoService {

    @Autowired
    private JdbcTemplate jdbc;

    // ============================
    // PRESUPUESTO POR CATEGORÍA
    // ============================
    @Transactional
    public ExcesoCategoriaDto registrarPresupuestoCategoria(ExcesoCategoriaDto dto) {

        validarUsuario(dto.getIdUsuario());
        validarCategoria(dto.getIdCategoria());
        validarCategoriaGasto(dto.getIdCategoria());
        validarMes(dto.getMes());
        validarAnio(dto.getAnio());
        validarMonto(dto.getMontoLimite());
        validarDuplicadoCategoria(dto);

        String sql = """
            INSERT INTO PRESUPUESTO(id_usuario,id_categoria,año,mes,monto_limite,id_estado)
            VALUES(?,?,?,?,?,1)
        """;

        jdbc.update(sql, dto.getIdUsuario(), dto.getIdCategoria(), dto.getAnio(),
                dto.getMes(), dto.getMontoLimite());

        return dto;
    }

    // ============================
    // PRESUPUESTO GLOBAL MENSUAL
    // ============================
    @Transactional
    public ExcesoGlobalDto registrarPresupuestoGlobal(ExcesoGlobalDto dto) {

        validarUsuario(dto.getIdUsuario());
        validarMes(dto.getMes());
        validarAnio(dto.getAnio());
        validarMonto(dto.getMontoLimite());
        validarDuplicadoGlobal(dto);

        String sql = """
            INSERT INTO PRESUPUESTO_GLOBAL_MENSUAL(id_usuario,año,mes,monto_limite,id_estado)
            VALUES(?,?,?,?,1)
        """;

        jdbc.update(sql, dto.getIdUsuario(), dto.getAnio(), dto.getMes(), dto.getMontoLimite());

        return dto;
    }

    // =====================================
    // ALERTA AUTOMÁTICA DE GASTO EXCESIVO
    // =====================================
    @Transactional
    public void verificarExceso(int idUsuario, int idCategoria, double nuevoGasto) {

        LocalDate hoy = LocalDate.now();
        int anio = hoy.getYear();
        int mes = hoy.getMonthValue();

        // ======== 1. Validar presupuesto por categoría ========
        String sqlPres = """
            SELECT monto_limite FROM PRESUPUESTO
            WHERE id_usuario=? AND id_categoria=? AND año=? AND mes=?
        """;

        Double limiteCat = null;
        try { limiteCat = jdbc.queryForObject(sqlPres, Double.class, idUsuario, idCategoria, anio, mes); }
        catch (Exception ignored) {}

        if (limiteCat != null) {
            String sqlAcumCat = """
                SELECT SUM(monto) FROM TRANSACCION
                WHERE id_usuario=? AND id_categoria=? 
                AND YEAR(fecha)=? AND MONTH(fecha)=?
                AND monto < 0
            """;

            Double acumulado = jdbc.queryForObject(sqlAcumCat, Double.class,
                    idUsuario, idCategoria, anio, mes);

            acumulado = (acumulado == null ? 0 : acumulado * -1);

            if (acumulado + nuevoGasto > limiteCat) {
                jdbc.update("""
                    UPDATE PRESUPUESTO SET id_estado=2
                    WHERE id_usuario=? AND id_categoria=? AND año=? AND mes=?
                """, idUsuario, idCategoria, anio, mes);

                throw new RuntimeException("⚠ ALERTA: El gasto mensual en esta categoría ha excedido el presupuesto.");
            }
        }

        // ======== 2. Validar presupuesto global ========
        String sqlGlobal = """
            SELECT monto_limite FROM PRESUPUESTO_GLOBAL_MENSUAL
            WHERE id_usuario=? AND año=? AND mes=?
        """;

        Double limiteGlobal = null;
        try { limiteGlobal = jdbc.queryForObject(sqlGlobal, Double.class, idUsuario, anio, mes); }
        catch (Exception ignored) {}

        if (limiteGlobal != null) {
            String sqlAcumGlobal = """
                SELECT SUM(monto) FROM TRANSACCION
                WHERE id_usuario=? AND monto < 0
                AND YEAR(fecha)=? AND MONTH(fecha)=?
            """;

            Double acumulado = jdbc.queryForObject(sqlAcumGlobal, Double.class,
                    idUsuario, anio, mes);

            acumulado = (acumulado == null ? 0 : acumulado * -1);

            if (acumulado + nuevoGasto > limiteGlobal) {
                jdbc.update("""
                    UPDATE PRESUPUESTO_GLOBAL_MENSUAL SET id_estado=2
                    WHERE id_usuario=? AND año=? AND mes=?
                """, idUsuario, anio, mes);

                throw new RuntimeException("⚠ ALERTA: Se superó el presupuesto global mensual.");
            }
        }
    }

    // ============================
    // VALIDACIONES
    // ============================
    private void validarUsuario(int id) {
        Integer c = jdbc.queryForObject(
                "SELECT COUNT(*) FROM USUARIO WHERE id_usuario=?",
                Integer.class, id);
        if (c == 0) throw new RuntimeException("Usuario no existe.");
    }

    private void validarCategoria(int id) {
        Integer c = jdbc.queryForObject(
                "SELECT COUNT(*) FROM CATEGORIA WHERE id_categoria=?",
                Integer.class, id);
        if (c == 0) throw new RuntimeException("Categoría no existe.");
    }

    private void validarCategoriaGasto(int idCategoria) {
        Integer c = jdbc.queryForObject(
                "SELECT COUNT(*) FROM CATEGORIA WHERE id_categoria=? AND id_tipo=2",
                Integer.class, idCategoria);
        if (c == 0) throw new RuntimeException("La categoría no es de tipo Gasto.");
    }

    private void validarDuplicadoCategoria(ExcesoCategoriaDto dto) {
        Integer c = jdbc.queryForObject("""
            SELECT COUNT(*) FROM PRESUPUESTO
            WHERE id_usuario=? AND id_categoria=? AND año=? AND mes=?
        """, Integer.class, dto.getIdUsuario(), dto.getIdCategoria(),
                dto.getAnio(), dto.getMes());

        if (c > 0) throw new RuntimeException("Ya existe un presupuesto registrado para esta categoría.");
    }

    private void validarDuplicadoGlobal(ExcesoGlobalDto dto) {
        Integer c = jdbc.queryForObject("""
            SELECT COUNT(*) FROM PRESUPUESTO_GLOBAL_MENSUAL
            WHERE id_usuario=? AND año=? AND mes=?
        """, Integer.class, dto.getIdUsuario(), dto.getAnio(), dto.getMes());

        if (c > 0) throw new RuntimeException("Ya existe un presupuesto global para ese mes.");
    }

    private void validarMonto(double m) {
        if (m <= 0) throw new RuntimeException("Monto debe ser mayor a cero.");
    }

    private void validarMes(int m) {
        if (m < 1 || m > 12) throw new RuntimeException("Mes inválido.");
    }

    private void validarAnio(int a) {
        if (a < 2025) throw new RuntimeException("Año inválido.");
    }
}
