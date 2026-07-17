package pe.edu.uni.sesion17.Rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.uni.sesion17.Dto.UsuarioDto;
import pe.edu.uni.sesion17.Service.UsuarioService;


@RestController
@RequestMapping("/Presupuesto/usuario")
public class UsuarioRest {

    @Autowired
    private UsuarioService usuarioService;

    /**
     * Registrar usuario
     * POST /Presupuesto/usuario/registrar
     */
    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody UsuarioDto bean) {
        try {
            UsuarioDto resultado = usuarioService.registrarUsuario(bean);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al registrar usuario.");
        }
    }

    /**
     * Login
     * POST /Presupuesto/usuario/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsuarioDto bean) {
        try {
            UsuarioDto resultado = usuarioService.login(bean.getEmail(), bean.getPassword());
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al iniciar sesión.");
        }
    }

    /**
     * Recuperación de contraseña
     * POST /Presupuesto/usuario/recuperar
     */
    @PostMapping("/recuperar")
    public ResponseEntity<?> recuperar(@RequestBody UsuarioDto bean) {
        try {
            String msg = usuarioService.recuperarPassword(bean.getEmail());
            return ResponseEntity.ok(msg);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar recuperación de contraseña.");
        }
    }
}
