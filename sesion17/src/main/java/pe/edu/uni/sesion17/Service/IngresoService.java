package pe.edu.uni.sesion17.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.uni.sesion17.Dto.IngresoDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Service
public class IngresoService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /** RF1 - Registrar ingreso */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public IngresoDto registrarIngreso(IngresoDto bean) {

        validarUsuario(bean.getIdUsuario());
        validarCategoriaIngreso(bean.getIdCategoria());
        validarCategoriaUsuario(bean.getIdCategoria(), bean.getIdUsuario());
        validarMonto(bean.getMonto());

        // Construir fecha completa
        bean.setFecha(construirFechaCompleta(
                bean.getFechaTexto(),
                bean.getHoraTexto()
        ));

        // Descripción por defecto
        if (bean.getDescripcion() == null || bean.getDescripcion().isBlank()) {
            bean.setDescripcion("SIN DESCRIPCION");
        }

        // Insertar transacción
        String sql = """
                INSERT INTO TRANSACCION(id_categoria, id_usuario, fecha, monto, descripcion, fecha_registro)
                VALUES(?, ?, ?, ?, ?, GETDATE())
                """;

        jdbcTemplate.update(sql,
                bean.getIdCategoria(),
                bean.getIdUsuario(),
                bean.getFecha(),
                bean.getMonto(),
                bean.getDescripcion()
        );

        return bean;
    }

    /** RF1 - Eliminar ingreso */
    @Transactional(propagation = Propagation.REQUIRED)
    public void eliminarIngreso(int idTransaccion) {

        String sqlValidar = """
                SELECT COUNT(*)
                FROM TRANSACCION t
                JOIN CATEGORIA c ON t.id_categoria = c.id_categoria
                WHERE t.id_transaccion = ? AND c.id_tipo = 1
                """;

        int count = jdbcTemplate.queryForObject(sqlValidar, Integer.class, idTransaccion);

        if (count == 0) {
            throw new RuntimeException("La transacción no existe o no corresponde a un ingreso.");
        }

        String sql = "DELETE FROM TRANSACCION WHERE id_transaccion = ?";
        jdbcTemplate.update(sql, idTransaccion);
    }

    /* ==========================================================
       VALIDACIONES
       ========================================================== */

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarUsuario(int idUsuario) {
        String sql = "SELECT COUNT(*) FROM USUARIO WHERE id_usuario = ?";
        if (jdbcTemplate.queryForObject(sql, Integer.class, idUsuario) == 0) {
            throw new RuntimeException("El usuario " + idUsuario + " no existe.");
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarCategoriaIngreso(int idCategoria) {
        String sql = """
                SELECT COUNT(*) FROM CATEGORIA 
                WHERE id_categoria = ? AND id_tipo = 1
                """;
        if (jdbcTemplate.queryForObject(sql, Integer.class, idCategoria) == 0) {
            throw new RuntimeException("La categoría no corresponde a un ingreso (id_tipo = 1).");
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarCategoriaUsuario(int idCategoria, int idUsuario) {
        String sql = """
                SELECT COUNT(*) FROM CATEGORIA
                WHERE id_categoria = ? AND id_usuario = ?
                """;
        if (jdbcTemplate.queryForObject(sql, Integer.class, idCategoria, idUsuario) == 0) {
            throw new RuntimeException("La categoría " + idCategoria + " no pertenece al usuario " + idUsuario + ".");
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarMonto(double monto) {
        if (monto <= 0) {
            throw new RuntimeException("El monto debe ser mayor a 0.");
        }
    }

    /* ==========================================================
       FECHA COMPLETA YYYY-MM-DD HH:mm:ss
       ========================================================== */
    private String construirFechaCompleta(String fechaTexto, String horaTexto) {
        LocalDate fecha;
        LocalTime hora;

        try {
            fecha = (fechaTexto == null || fechaTexto.isBlank())
                    ? LocalDate.now()
                    : LocalDate.parse(fechaTexto, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Fecha inválida. Formato correcto: yyyy-MM-dd");
        }

        try {
            hora = (horaTexto == null || horaTexto.isBlank())
                    ? LocalTime.now()
                    : LocalTime.parse(horaTexto);
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Hora inválida. Formato correcto: HH:mm o HH:mm:ss");
        }

        LocalDateTime fechaCompleta = LocalDateTime.of(fecha, hora);
        return fechaCompleta.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
