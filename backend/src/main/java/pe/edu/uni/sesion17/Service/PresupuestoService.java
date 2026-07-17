package pe.edu.uni.sesion17.Service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.uni.sesion17.Dto.PresupuestoCategoriaDto;
import pe.edu.uni.sesion17.Dto.PresupuestoUsuarioDto;

import java.time.LocalDate;

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
    private void validarMontoLimite(int monto) {
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
