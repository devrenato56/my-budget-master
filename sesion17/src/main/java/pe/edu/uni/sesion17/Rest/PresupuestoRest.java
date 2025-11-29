package pe.edu.uni.sesion17.Rest;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.uni.sesion17.Dto.PresupuestoCategoriaDto;
import pe.edu.uni.sesion17.Dto.PresupuestoUsuarioDto;
import pe.edu.uni.sesion17.Service.PresupuestoService;

@RestController
@RequestMapping("/Presupuesto")
public class PresupuestoRest {

    @Autowired
    private PresupuestoService presupuestoService;

    /**
     * Crea un nuevo presupuesto por categoría
     * POST /Presupuesto/Categoria
     */
    @PostMapping("/Categoria")
    public ResponseEntity<?> crearPresupuestoCategoria(@RequestBody PresupuestoCategoriaDto dto) {
        try {
            PresupuestoCategoriaDto resultado = presupuestoService.crearPresupuestoCategoria(dto);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al crear el presupuesto por categoría");
        }
    }

    /**
     * Crea un nuevo presupuesto global mensual
     * POST /Presupuesto/Global
     */
    @PostMapping("/Global")
    public ResponseEntity<?> crearPresupuestoGlobal(@RequestBody PresupuestoUsuarioDto dto) {
        try {
            PresupuestoUsuarioDto resultado = presupuestoService.crearPresupuestoUsuario(dto);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al crear el presupuesto global");
        }
    }
}
