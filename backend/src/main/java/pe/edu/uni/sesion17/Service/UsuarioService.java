

package pe.edu.uni.sesion17.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.uni.sesion17.Dto.UsuarioDto;


@Service
public class UsuarioService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Registrar nuevo usuario
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public UsuarioDto registrarUsuario(UsuarioDto bean) {

        validarNombre(bean.getNombre());
        validarEmail(bean.getEmail());
        validarUsuarioLogin(bean.getUsuario());
        validarPassword(bean.getClave());
        validarNoExisteEmail(bean.getEmail());
        validarNoExisteLogin(bean.getUsuario());

        String claveHasheada = passwordEncoder.encode(bean.getClave());

        String sql = """
                INSERT INTO USUARIO(nombre, email, telefono, usuario, clave)
                VALUES (?, ?, ?, ?, ?)
        """;

        jdbcTemplate.update(sql,
                bean.getNombre(),
                bean.getEmail(),
                bean.getTelefono(),
                bean.getUsuario(),
                claveHasheada
        );

        String sqlId = "SELECT id_usuario FROM USUARIO WHERE usuario = ?";
        int idGenerado = jdbcTemplate.queryForObject(sqlId, Integer.class, bean.getUsuario());
        bean.setIdUsuario(idGenerado);
        bean.setClave(null);

        return bean;
    }

    /**
     * Inicio de sesión (por login de usuario, no por email)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public UsuarioDto login(String usuario, String clave) {

        validarUsuarioLogin(usuario);
        validarPassword(clave);

        String sql = """
                SELECT id_usuario, nombre, email, telefono, usuario, clave
                FROM USUARIO
                WHERE usuario = ?
        """;

        UsuarioDto encontrado;
        try {
            encontrado = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                UsuarioDto dto = new UsuarioDto();
                dto.setIdUsuario(rs.getInt("id_usuario"));
                dto.setNombre(rs.getString("nombre"));
                dto.setEmail(rs.getString("email"));
                dto.setTelefono(rs.getString("telefono"));
                dto.setUsuario(rs.getString("usuario"));
                dto.setClave(rs.getString("clave"));
                return dto;
            }, usuario);
        } catch (Exception e) {
            throw new RuntimeException("El usuario no está registrado.");
        }

        if (!passwordEncoder.matches(clave, encontrado.getClave())) {
            throw new RuntimeException("Contraseña incorrecta.");
        }

        encontrado.setClave(null);
        return encontrado;
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
    // VALIDACIONES
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
    private void validarUsuarioLogin(String usuario) {
        if (usuario == null || usuario.trim().isEmpty()) {
            throw new RuntimeException("El usuario (login) no puede estar vacío.");
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

    @Transactional(propagation = Propagation.MANDATORY)
    private void validarNoExisteLogin(String usuario) {
        String sql = """
                SELECT COUNT(1)
                FROM USUARIO
                WHERE usuario = ?
        """;

        int cont = jdbcTemplate.queryForObject(sql, Integer.class, usuario);

        if (cont > 0) {
            throw new RuntimeException("El usuario (login) ya está registrado.");
        }
    }
}
