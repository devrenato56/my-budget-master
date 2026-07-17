package pe.edu.uni.sesion17.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import pe.edu.uni.sesion17.Dto.TransaccionDto;

import java.util.List;

@Service
public class TransaccionService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /** RF1/RF2 - Historial de transacciones (ingresos y gastos) de un usuario */
    public List<TransaccionDto> listarPorUsuario(int idUsuario) {
        validarUsuario(idUsuario);

        String sql = """
            SELECT t.id_transaccion, t.id_usuario, t.id_categoria,
                   c.nombre AS categoria_nombre,
                   c.id_tipo, tt.descripcion AS tipo_descripcion,
                   t.fecha, t.monto, t.descripcion
            FROM TRANSACCION t
            JOIN CATEGORIA c ON t.id_categoria = c.id_categoria
            JOIN TIPO_TRANSACCION tt ON c.id_tipo = tt.id_tipo
            WHERE t.id_usuario = ?
            ORDER BY t.fecha DESC, t.id_transaccion DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> TransaccionDto.builder()
                        .idTransaccion(rs.getInt("id_transaccion"))
                        .idUsuario(rs.getInt("id_usuario"))
                        .idCategoria(rs.getInt("id_categoria"))
                        .nombreCategoria(rs.getString("categoria_nombre"))
                        .idTipo(rs.getInt("id_tipo"))
                        .tipoDescripcion(rs.getString("tipo_descripcion"))
                        .fecha(rs.getString("fecha"))
                        .monto(rs.getDouble("monto"))
                        .descripcion(rs.getString("descripcion"))
                        .build(),
                idUsuario);
    }

    /** RF1/RF2 - Saldo total acumulado (histórico) de un usuario */
    public double obtenerSaldoTotal(int idUsuario) {
        validarUsuario(idUsuario);

        String sql = "SELECT ISNULL(SUM(monto),0) FROM TRANSACCION WHERE id_usuario = ?";
        return jdbcTemplate.queryForObject(sql, Double.class, idUsuario);
    }

    private void validarUsuario(int idUsuario) {
        String sql = "SELECT COUNT(*) FROM USUARIO WHERE id_usuario = ?";
        int c = jdbcTemplate.queryForObject(sql, Integer.class, idUsuario);
        if (c == 0) throw new RuntimeException("El usuario no existe.");
    }
}
