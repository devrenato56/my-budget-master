

package pe.edu.uni.sesion17.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.uni.sesion17.Dto.UsuarioDto;


@Service
public class UsuarioService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Registrar nuevo usuario
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public UsuarioDto registrarUsuario(UsuarioDto bean) {

        validarNombre(bean.getNombre());
        validarEmail(bean.getEmail());
        validarPassword(bean.getPassword());
        validarNoExisteEmail(bean.getEmail());

        String sql = """
                INSERT INTO USUARIO(nombre, email, password, activo)
                VALUES (?, ?, ?, 1)
        """;

        jdbcTemplate.update(sql,
                bean.getNombre(),
                bean.getEmail(),
                bean.getPassword()
        );

        return bean;
    }

    /**
     * Inicio de sesión
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public UsuarioDto login(String email, String password) {

        validarEmail(email);
        validarPassword(password);

        String sql = """
                SELECT id_usuario, nombre, email, password, activo
                FROM USUARIO
                WHERE email = ?
        """;

        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {

                String passBD = rs.getString("password");

                if (!passBD.equals(password)) {
                    throw new RuntimeException("Contraseña incorrecta.");
                }

                if (rs.getInt("activo") == 0) {
                    throw new RuntimeException("El usuario está desactivado.");
                }

                UsuarioDto dto = new UsuarioDto();
                dto.setIdUsuario(rs.getInt("id_usuario"));
                dto.setNombre(rs.getString("nombre"));
                dto.setEmail(rs.getString("email"));
                dto.setPassword(passBD);
                dto.setActivo(rs.getInt("activo"));
                return dto;

            }, email);

        } catch (Exception e) {
            throw new RuntimeException("El email no está registrado.");
        }
    }


    /**
     * Recuperar contraseña
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public String recuperarPassword(String email) {

        validarEmail(email);

        String sql = """
                SELECT COUNT(1)
                FROM USUARIO
                WHERE email = ?
        """;

        int cont = jdbcTemplate.queryForObject(sql, Integer.class, email);

        if (cont == 0) {
            throw new RuntimeException("El email no existe en el sistema.");
        }

        // En proyecto real: enviar correo. Aquí solo mensaje.
        return "Se envió un correo de recuperación a: " + email;
    }


    // ========================================================
    // VALIDACIONES (MISMO ESTILO QUE RF5)
    // ========================================================

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new RuntimeException("El nombre no puede estar vacío.");
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new RuntimeException("El email no es válido.");
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarPassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("La contraseña no puede estar vacía.");
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarNoExisteEmail(String email) {
        String sql = """
                SELECT COUNT(1)
                FROM USUARIO
                WHERE email = ?
        """;

        int cont = jdbcTemplate.queryForObject(sql, Integer.class, email);

        if (cont > 0) {
            throw new RuntimeException("El email ya está registrado.");
        }
    }
}
