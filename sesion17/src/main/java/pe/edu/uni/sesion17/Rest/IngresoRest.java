package pe.edu.uni.sesion17.Rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.uni.sesion17.Dto.IngresoDto;
import pe.edu.uni.sesion17.Service.IngresoService;

@RestController
@RequestMapping("/Presupuesto/ingreso")
public class IngresoRest {

    @Autowired
    private IngresoService ingresoService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody IngresoDto bean) {
        try {
            IngresoDto resultado = ingresoService.registrarIngreso(bean);
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error interno al procesar el registro.");
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        try {
            ingresoService.eliminarIngreso(id);
            return ResponseEntity.ok("Ingreso eliminado correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error interno al eliminar el ingreso.");
        }
    }
}

