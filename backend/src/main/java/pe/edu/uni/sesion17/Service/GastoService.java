package pe.edu.uni.sesion17.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.uni.sesion17.Dto.GastoDto;

import java.sql.Date;
import java.time.LocalDate;

@Service
public class GastoService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Registrar gasto (egreso) - siempre negativo.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public GastoDto registrarGasto(GastoDto bean) {

        // ---------- VALIDACIONES ----------
        validarUsuario(bean.getIdUsuario());
        validarCategoriaEgreso(bean.getIdCategoria(), bean.getIdUsuario());
        validarMonto(bean.getMonto());

        // ---------- PREPARAR FECHA ----------
        if (bean.getFecha() == null || bean.getFecha().isBlank()) {
            bean.setFecha(LocalDate.now().toString());
        }

        // ---------- Monto negativo ----------
        double montoNegativo = -Math.abs(bean.getMonto());

        // ---------- INSERTAR ----------
        String sql = """
            INSERT INTO TRANSACCION(id_usuario, id_categoria, fecha, monto, descripcion, fecha_registro)
            VALUES (?, ?, ?, ?, ?, GETDATE())
        """;

        jdbcTemplate.update(sql,
                bean.getIdUsuario(),
                bean.getIdCategoria(),
                bean.getFecha(),
                montoNegativo,
                bean.getDescripcion()
        );

        // ---------- ALERTAS ----------
        LocalDate f = LocalDate.parse(bean.getFecha());
        bean.setAlertaUsuario(alertaGlobal(bean.getIdUsuario(), f.getYear(), f.getMonthValue()));
        bean.setAlertaCategoria(alertaCategoria(bean.getIdUsuario(), bean.getIdCategoria(), f.getYear(), f.getMonthValue()));

        return bean;
    }

    /**
     * Eliminar gasto solo si es egreso.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void eliminarGasto(int idTransaccion) {

        String validar = """
            SELECT COUNT(*) FROM TRANSACCION t
            JOIN CATEGORIA c ON t.id_categoria = c.id_categoria
            WHERE t.id_transaccion = ? AND c.id_tipo = 2
        """;

        int count = jdbcTemplate.queryForObject(validar, Integer.class, idTransaccion);
        if (count == 0) {
            throw new RuntimeException("La transacción no existe o no es un gasto.");
        }

        String sql = "DELETE FROM TRANSACCION WHERE id_transaccion = ?";
        jdbcTemplate.update(sql, idTransaccion);
    }

    /* =============================================================
        VALIDACIONES
    ============================================================= */

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarUsuario(int idUsuario) {
        String sql = "SELECT COUNT(*) FROM USUARIO WHERE id_usuario = ?";
        int c = jdbcTemplate.queryForObject(sql, Integer.class, idUsuario);
        if (c == 0) throw new RuntimeException("El usuario no existe.");
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarCategoriaEgreso(int idCategoria, int idUsuario) {
        String sql = """
            SELECT COUNT(*) FROM CATEGORIA 
            WHERE id_categoria = ? AND id_usuario = ? AND id_tipo = 2
        """;
        int c = jdbcTemplate.queryForObject(sql, Integer.class, idCategoria, idUsuario);
        if (c == 0) throw new RuntimeException("La categoría no pertenece al usuario o no es EGRESO.");
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarMonto(double monto) {
        if (monto <= 0)
            throw new RuntimeException("El monto debe venir POSITIVO. El sistema lo convierte a negativo.");
    }

    /* =============================================================
        ALERTAS Y CONTROL DE PRESUPUESTO (RF5)
        Recalcula el acumulado del mes y sincroniza id_estado en
        PRESUPUESTO / PRESUPUESTO_GLOBAL_MENSUAL (1=Dentro del límite,
        2=Presupuesto excedido) cada vez que se registra un gasto.
    ============================================================= */

    private String alertaGlobal(int idUsuario, int año, int mes) {

        Date fechaInicio = Date.valueOf(LocalDate.of(año, mes, 1));
        Date fechaFin = Date.valueOf(LocalDate.of(año, mes, 1).plusMonths(1));

        String sqlGasto = """
            SELECT ISNULL(SUM(monto),0)
            FROM TRANSACCION
            WHERE id_usuario = ? AND monto < 0
            AND fecha >= ? AND fecha < ?
        """;

        double egresos = Math.abs(jdbcTemplate.queryForObject(sqlGasto, Double.class, idUsuario, fechaInicio, fechaFin));

        String sqlLimite = """
            SELECT monto_limite FROM PRESUPUESTO_GLOBAL_MENSUAL
            WHERE id_usuario = ? AND año = ? AND mes = ?
        """;

        Double limite;
        try {
            limite = jdbcTemplate.queryForObject(sqlLimite, Double.class, idUsuario, año, mes);
        } catch (EmptyResultDataAccessException e) {
            return "No hay presupuesto global definido.";
        }

        boolean excedido = egresos > limite;
        jdbcTemplate.update("""
            UPDATE PRESUPUESTO_GLOBAL_MENSUAL SET id_estado = ?
            WHERE id_usuario = ? AND año = ? AND mes = ?
        """, excedido ? 2 : 1, idUsuario, año, mes);

        if (excedido)
            return "⚠️ Excediste tu presupuesto mensual global.";

        return "Presupuesto global OK.";
    }

    private String alertaCategoria(int idUsuario, int idCategoria, int año, int mes) {

        Date fechaInicio = Date.valueOf(LocalDate.of(año, mes, 1));
        Date fechaFin = Date.valueOf(LocalDate.of(año, mes, 1).plusMonths(1));

        String sqlCat = """
            SELECT ISNULL(SUM(monto),0)
            FROM TRANSACCION
            WHERE id_usuario = ? AND id_categoria = ? AND monto < 0
            AND fecha >= ? AND fecha < ?
        """;

        double egresos = Math.abs(jdbcTemplate.queryForObject(sqlCat, Double.class, idUsuario, idCategoria, fechaInicio, fechaFin));

        String sqlLimite = """
            SELECT monto_limite FROM PRESUPUESTO
            WHERE id_usuario = ? AND id_categoria = ? AND año = ? AND mes = ?
        """;

        Double limite;
        try {
            limite = jdbcTemplate.queryForObject(sqlLimite, Double.class, idUsuario, idCategoria, año, mes);
        } catch (EmptyResultDataAccessException e) {
            return "No hay presupuesto definido para esta categoría.";
        }

        boolean excedido = egresos > limite;
        jdbcTemplate.update("""
            UPDATE PRESUPUESTO SET id_estado = ?
            WHERE id_usuario = ? AND id_categoria = ? AND año = ? AND mes = ?
        """, excedido ? 2 : 1, idUsuario, idCategoria, año, mes);

        if (excedido)
            return "⚠️ Excediste el presupuesto de esta categoría.";

        return "Categoría OK.";
    }
}
