package pe.edu.uni.sesion17.Service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.uni.sesion17.Dto.CategoriaDto;

import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /** Obtiene todas las categorías activas de un usuario */
    public List<CategoriaDto> obtenerCategoriasPorUsuario(int idUsuario) {
        validarUsuario(idUsuario);

        String sql = """
            SELECT c.id_categoria, c.id_usuario, c.id_tipo, 
                   t.descripcion as tipo_descripcion,
                   c.nombre, c.descripcion, c.activa
            FROM CATEGORIA c
            INNER JOIN TIPO_TRANSACCION t ON c.id_tipo = t.id_tipo
            WHERE c.id_usuario = ? AND c.activa = 1
            ORDER BY t.descripcion, c.nombre
        """;

        try {
            List<CategoriaDto> categorias = jdbcTemplate.query(sql, (rs, rowNum) ->
                            CategoriaDto.builder()
                                    .idCategoria(rs.getInt("id_categoria"))
                                    .idUsuario(rs.getInt("id_usuario"))
                                    .idTipo(rs.getInt("id_tipo"))
                                    .tipoDescripcion(rs.getString("tipo_descripcion"))
                                    .nombre(rs.getString("nombre"))
                                    .descripcion(rs.getString("descripcion"))
                                    .activa(rs.getBoolean("activa"))
                                    .build(),
                    idUsuario
            );

            if (categorias.isEmpty()) {
                throw new RuntimeException("No hay categorías creadas aún para este usuario.");
            }

            return categorias;

        } catch (DataAccessException e) {
            throw new RuntimeException("Error al obtener las categorías del usuario", e);
        }
    }

    /** Obtiene categorías por tipo (Ingreso=1, Gasto=2) */
    public List<CategoriaDto> obtenerCategoriasPorTipo(int idUsuario, int idTipo) {
        validarUsuario(idUsuario);
        validarTipo(idTipo);

        String sql = """
            SELECT c.id_categoria, c.id_usuario, c.id_tipo, 
                   t.descripcion as tipo_descripcion,
                   c.nombre, c.descripcion, c.activa
            FROM CATEGORIA c
            INNER JOIN TIPO_TRANSACCION t ON c.id_tipo = t.id_tipo
            WHERE c.id_usuario = ? AND c.id_tipo = ? AND c.activa = 1
            ORDER BY c.nombre
        """;

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) ->
                            CategoriaDto.builder()
                                    .idCategoria(rs.getInt("id_categoria"))
                                    .idUsuario(rs.getInt("id_usuario"))
                                    .idTipo(rs.getInt("id_tipo"))
                                    .tipoDescripcion(rs.getString("tipo_descripcion"))
                                    .nombre(rs.getString("nombre"))
                                    .descripcion(rs.getString("descripcion"))
                                    .activa(rs.getBoolean("activa"))
                                    .build(),
                    idUsuario, idTipo
            );
        } catch (DataAccessException e) {
            throw new RuntimeException("Error al obtener las categorías por tipo", e);
        }
    }

    /** Obtiene una categoría específica por ID */
    public CategoriaDto obtenerCategoriaPorId(int idCategoria, int idUsuario) {
        if (idCategoria <= 0) {
            throw new IllegalArgumentException("El ID de la categoría debe ser mayor a 0");
        }
        validarUsuario(idUsuario);

        String sql = """
            SELECT c.id_categoria, c.id_usuario, c.id_tipo, 
                   t.descripcion as tipo_descripcion,
                   c.nombre, c.descripcion, c.activa
            FROM CATEGORIA c
            INNER JOIN TIPO_TRANSACCION t ON c.id_tipo = t.id_tipo
            WHERE c.id_categoria = ? AND c.id_usuario = ?
        """;

        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
                            CategoriaDto.builder()
                                    .idCategoria(rs.getInt("id_categoria"))
                                    .idUsuario(rs.getInt("id_usuario"))
                                    .idTipo(rs.getInt("id_tipo"))
                                    .tipoDescripcion(rs.getString("tipo_descripcion"))
                                    .nombre(rs.getString("nombre"))
                                    .descripcion(rs.getString("descripcion"))
                                    .activa(rs.getBoolean("activa"))
                                    .build(),
                    idCategoria, idUsuario
            );
        } catch (EmptyResultDataAccessException e) {
            throw new RuntimeException("Categoría no encontrada con ID: " + idCategoria);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error al obtener la categoría", e);
        }
    }

    /** Crea una nueva categoría */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public CategoriaDto crearCategoria(CategoriaDto dto) {
        validarDatosCategoria(dto);
        validarUsuario(dto.getIdUsuario());
        validarTipo(dto.getIdTipo());
        validarNombreUnico(dto.getIdUsuario(), dto.getIdTipo(), dto.getNombre(), 0);

        String sql = """
            INSERT INTO CATEGORIA (id_usuario, id_tipo, nombre, descripcion, activa)
            VALUES (?, ?, ?, ?, 1)
        """;

        jdbcTemplate.update(sql,
                dto.getIdUsuario(),
                dto.getIdTipo(),
                dto.getNombre().trim(),
                dto.getDescripcion() != null ? dto.getDescripcion().trim() : null
        );

        // Obtener ID generado
        String sqlId = """
            SELECT TOP 1 id_categoria 
            FROM CATEGORIA 
            WHERE id_usuario = ? AND id_tipo = ? AND nombre = ?
            ORDER BY id_categoria DESC
        """;

        int idGenerado = jdbcTemplate.queryForObject(sqlId, Integer.class,
                dto.getIdUsuario(), dto.getIdTipo(), dto.getNombre().trim());

        return obtenerCategoriaPorId(idGenerado, dto.getIdUsuario());
    }

    /** Actualiza una categoría existente */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public CategoriaDto actualizarCategoria(CategoriaDto dto) {
        if (dto.getIdCategoria() <= 0) {
            throw new IllegalArgumentException("El ID de la categoría debe ser mayor a 0");
        }

        validarDatosCategoria(dto);
        validarUsuario(dto.getIdUsuario());
        validarTipo(dto.getIdTipo());
        validarExistenciaCategoria(dto.getIdCategoria(), dto.getIdUsuario());
        validarNombreUnico(dto.getIdUsuario(), dto.getIdTipo(), dto.getNombre(), dto.getIdCategoria());

        String sql = """
            UPDATE CATEGORIA 
            SET id_tipo = ?, nombre = ?, descripcion = ?
            WHERE id_categoria = ? AND id_usuario = ?
        """;

        int filasAfectadas = jdbcTemplate.update(sql,
                dto.getIdTipo(),
                dto.getNombre().trim(),
                dto.getDescripcion() != null ? dto.getDescripcion().trim() : null,
                dto.getIdCategoria(),
                dto.getIdUsuario()
        );

        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar la categoría");
        }

        return obtenerCategoriaPorId(dto.getIdCategoria(), dto.getIdUsuario());
    }

    /** Elimina (desactiva) una categoría */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void eliminarCategoria(int idCategoria, int idUsuario) {
        if (idCategoria <= 0) {
            throw new IllegalArgumentException("El ID de la categoría debe ser mayor a 0");
        }

        validarUsuario(idUsuario);
        validarExistenciaCategoria(idCategoria, idUsuario);
        validarCategoriaSinTransacciones(idCategoria);

        String sql = "UPDATE CATEGORIA SET activa = 0 WHERE id_categoria = ? AND id_usuario = ?";
        int filasAfectadas = jdbcTemplate.update(sql, idCategoria, idUsuario);

        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo eliminar la categoría");
        }
    }

    /** -------- Métodos de validación -------- */

    private void validarUsuario(int idUsuario) {
        if (idUsuario <= 0) throw new IllegalArgumentException("El ID del usuario debe ser mayor a 0");
        String sql = "SELECT COUNT(1) FROM USUARIO WHERE id_usuario = ?";
        int count = jdbcTemplate.queryForObject(sql, Integer.class, idUsuario);
        if (count == 0) throw new RuntimeException("ERROR: Usuario no existe");
    }

    private void validarTipo(int idTipo) {
        if (idTipo != 1 && idTipo != 2) throw new IllegalArgumentException("Tipo debe ser 1 (Ingreso) o 2 (Gasto)");
        String sql = "SELECT COUNT(1) FROM TIPO_TRANSACCION WHERE id_tipo = ?";
        int count = jdbcTemplate.queryForObject(sql, Integer.class, idTipo);
        if (count == 0) throw new RuntimeException("ERROR: Tipo de transacción no existe");
    }

    private void validarDatosCategoria(CategoriaDto dto) {
        if (dto == null) throw new IllegalArgumentException("Los datos de la categoría son requeridos");
        if (dto.getNombre() == null || dto.getNombre().trim().isEmpty())
            throw new IllegalArgumentException("El nombre de la categoría es requerido");
        if (dto.getNombre().trim().length() > 50)
            throw new IllegalArgumentException("El nombre no puede exceder 50 caracteres");
        if (dto.getDescripcion() != null && dto.getDescripcion().trim().length() > 200)
            throw new IllegalArgumentException("La descripción no puede exceder 200 caracteres");
    }

    private void validarNombreUnico(int idUsuario, int idTipo, String nombre, int idCategoriaExcluir) {
        String sql = "SELECT COUNT(1) FROM CATEGORIA WHERE id_usuario = ? AND id_tipo = ? AND nombre = ? AND activa = 1";
        Object[] params = idCategoriaExcluir > 0 ? new Object[]{idUsuario, idTipo, nombre.trim(), idCategoriaExcluir} :
                new Object[]{idUsuario, idTipo, nombre.trim()};
        if (idCategoriaExcluir > 0) sql += " AND id_categoria != ?";
        int count = jdbcTemplate.queryForObject(sql, Integer.class, params);
        if (count > 0) throw new RuntimeException("ERROR: Ya existe una categoría con ese nombre para este tipo");
    }

    private void validarExistenciaCategoria(int idCategoria, int idUsuario) {
        String sql = "SELECT COUNT(1) FROM CATEGORIA WHERE id_categoria = ? AND id_usuario = ? AND activa = 1";
        int count = jdbcTemplate.queryForObject(sql, Integer.class, idCategoria, idUsuario);
        if (count == 0) throw new RuntimeException("ERROR: Categoría no encontrada o no pertenece al usuario");
    }

    private void validarCategoriaSinTransacciones(int idCategoria) {
        String sql = "SELECT COUNT(1) FROM TRANSACCION WHERE id_categoria = ?";
        int count = jdbcTemplate.queryForObject(sql, Integer.class, idCategoria);
        if (count > 0) throw new RuntimeException("ERROR: No se puede eliminar la categoría porque tiene transacciones asociadas");
    }
}
