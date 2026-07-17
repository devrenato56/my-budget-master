package pe.edu.uni.sesion17.Service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.uni.sesion17.Dto.PresupuestoCategoriaDto;
import pe.edu.uni.sesion17.Dto.PresupuestoUsuarioDto;

import java.time.LocalDate;
import java.util.List;

@Service
public class PresupuestoService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public PresupuestoCategoriaDto crearPresupuestoCategoria(PresupuestoCategoriaDto dto) {
        validarUsuario(dto.getIdUsuario());
        validarCategoria(dto.getIdCategoria());
        validarTipoCategoria(dto.getIdCategoria());
        validarMontoLimite(dto.getMontoLimite());
        validarNoExistenciaPresupuestoC(dto.getIdUsuario(), dto.getIdCategoria(), dto.getAnio(), dto.getMes());
        validarMes(dto.getMes());
        validarAnio(dto.getAnio());

        if (dto.getAnio() == 0 || dto.getMes() == 0) {
            LocalDate hoy = LocalDate.now();
            dto.setAnio(hoy.getYear());
            dto.setMes(hoy.getMonthValue());
        }

        if (dto.getIdEstado() <= 0) {
            throw new RuntimeException("El idEstado debe ser un valor válido (ej. 1 para Activo).");
        }

        String sql = """
                INSERT INTO PRESUPUESTO(id_usuario, id_categoria, año, mes, monto_limite, id_estado)
                VALUES(?, ?, ?, ?, ?, ?)
             """;

        jdbcTemplate.update(sql,
                dto.getIdUsuario(),
                dto.getIdCategoria(),
                dto.getAnio(),
                dto.getMes(),
                dto.getMontoLimite(),
                dto.getIdEstado()
        );

        return dto;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public PresupuestoUsuarioDto crearPresupuestoUsuario(PresupuestoUsuarioDto dto) {
        validarUsuario(dto.getIdUsuario());
        validarMontoLimite(dto.getMontoLimite());
        validarNoExistenciaPresupuestoU(dto.getIdUsuario(), dto.getAnio(), dto.getMes());
        validarMes(dto.getMes());
        validarAnio(dto.getAnio());

        if (dto.getAnio() == 0 || dto.getMes() == 0) {
            LocalDate hoy = LocalDate.now();
            dto.setAnio(hoy.getYear());
            dto.setMes(hoy.getMonthValue());
        }

        if (dto.getIdEstado() <= 0) {
            throw new RuntimeException("El idEstado debe ser un valor válido (ej. 1 para Activo).");
        }

        String sql = """
                INSERT INTO PRESUPUESTO_GLOBAL_MENSUAL(id_usuario, año, mes, monto_limite, id_estado)
                VALUES(?, ?, ?, ?, ?)
             """;

        jdbcTemplate.update(sql,
                dto.getIdUsuario(),
                dto.getAnio(),
                dto.getMes(),
                dto.getMontoLimite(),
                dto.getIdEstado()
        );

        return dto;
    }

    /** Lista los presupuestos por categoría de un usuario (con nombre de categoría). */
    public List<PresupuestoCategoriaDto> listarPresupuestosCategoria(int idUsuario) {
        validarUsuario(idUsuario);

        String sql = """
            SELECT p.id_presupuesto, p.id_usuario, p.id_categoria, c.nombre AS nombre_categoria,
                   p.año, p.mes, p.monto_limite, p.id_estado
            FROM PRESUPUESTO p
            JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
            WHERE p.id_usuario = ?
            ORDER BY p.año DESC, p.mes DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            PresupuestoCategoriaDto dto = new PresupuestoCategoriaDto();
            dto.setIdPresupuesto(rs.getInt("id_presupuesto"));
            dto.setIdUsuario(rs.getInt("id_usuario"));
            dto.setIdCategoria(rs.getInt("id_categoria"));
            dto.setNombreCategoria(rs.getString("nombre_categoria"));
            dto.setAnio(rs.getInt("año"));
            dto.setMes(rs.getInt("mes"));
            dto.setMontoLimite(rs.getDouble("monto_limite"));
            dto.setIdEstado(rs.getInt("id_estado"));
            return dto;
        }, idUsuario);
    }

    /** Lista los presupuestos globales mensuales de un usuario. */
    public List<PresupuestoUsuarioDto> listarPresupuestosGlobal(int idUsuario) {
        validarUsuario(idUsuario);

        String sql = """
            SELECT id_presupuesto_global, id_usuario, año, mes, monto_limite, id_estado
            FROM PRESUPUESTO_GLOBAL_MENSUAL
            WHERE id_usuario = ?
            ORDER BY año DESC, mes DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            PresupuestoUsuarioDto dto = new PresupuestoUsuarioDto();
            dto.setIdPresupuestoGlobal(rs.getInt("id_presupuesto_global"));
            dto.setIdUsuario(rs.getInt("id_usuario"));
            dto.setAnio(rs.getInt("año"));
            dto.setMes(rs.getInt("mes"));
            dto.setMontoLimite(rs.getDouble("monto_limite"));
            dto.setIdEstado(rs.getInt("id_estado"));
            return dto;
        }, idUsuario);
    }

    // --- Validaciones ---
    @Transactional(propagation = Propagation.MANDATORY)
    private void validarUsuario(int idUsuario) {
        int cont = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM USUARIO WHERE id_usuario = ?", Integer.class, idUsuario);
        if (cont == 0) throw new RuntimeException("El usuario " + idUsuario + " no existe.");
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarCategoria(int idCategoria) {
        int cont = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM CATEGORIA WHERE id_categoria = ?", Integer.class, idCategoria);
        if (cont == 0) throw new RuntimeException("La categoría " + idCategoria + " no existe.");
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarTipoCategoria(int idCategoria) {
        int cont = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM CATEGORIA WHERE id_categoria = ? AND id_tipo = 2", Integer.class, idCategoria);
        if (cont == 0) throw new RuntimeException("La categoría " + idCategoria + " no es de tipo 'Egreso'.");
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarMontoLimite(double monto) {
        if (monto <= 0) throw new RuntimeException("El monto límite debe ser mayor a cero.");
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarMes(int mes) {
        if (mes < 1 || mes > 12) throw new RuntimeException("El mes debe estar entre 1 y 12.");
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarAnio(int anio) {
        if (anio < 2025) throw new RuntimeException("Año inválido.");
    }

    private void validarNoExistenciaPresupuestoC(int idUsuario, int idCategoria, int anio, int mes) {
        int cont = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM PRESUPUESTO WHERE id_usuario=? AND id_categoria=? AND año=? AND mes=?",
                Integer.class, idUsuario, idCategoria, anio, mes);
        if (cont > 0) throw new RuntimeException("Ya existe presupuesto para esta categoría.");
    }

    private void validarNoExistenciaPresupuestoU(int idUsuario, int anio, int mes) {
        int cont = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM PRESUPUESTO_GLOBAL_MENSUAL WHERE id_usuario=? AND año=? AND mes=?",
                Integer.class, idUsuario, anio, mes);
        if (cont > 0) throw new RuntimeException("Ya existe presupuesto global para este usuario.");
    }
}
