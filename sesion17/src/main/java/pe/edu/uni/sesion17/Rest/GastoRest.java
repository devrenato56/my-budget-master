package pe.edu.uni.sesion17.Rest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.uni.sesion17.Dto.GastoDto;
import pe.edu.uni.sesion17.Service.GastoService;
@RestController
@RequestMapping("/Presupuesto/gasto")
public class GastoRest {

    @Autowired
    private GastoService gastoService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody GastoDto bean) {
        try {
            GastoDto result = gastoService.registrarGasto(bean);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        try {
            gastoService.eliminarGasto(id);
            return ResponseEntity.ok("Gasto eliminado correctamente.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
