package pe.edu.uni.sesion17.Rest;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.uni.sesion17.Dto.ExcesoCategoriaDto;
import pe.edu.uni.sesion17.Dto.ExcesoGlobalDto;
import pe.edu.uni.sesion17.Service.ExcesoService;

@RestController
@RequestMapping("/api/exceso")
public class ExcesoServiceRest {

    @Autowired
    private ExcesoService service;

    /**
     * Registrar presupuesto por categoría.
     * POST /api/exceso/categoria
     */
    @PostMapping("/categoria")
    public ResponseEntity<?> crearPresupuestoCategoria(@RequestBody ExcesoCategoriaDto dto) {
        try {
            ExcesoCategoriaDto resultado = service.registrarPresupuestoCategoria(dto);
            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error de validación: " + e.getMessage());

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error interno al registrar presupuesto por categoría.");
        }
    }

    /**
     * Registrar presupuesto global mensual.
     * POST /api/exceso/global
     */
    @PostMapping("/global")
    public ResponseEntity<?> crearPresupuestoGlobal(@RequestBody ExcesoGlobalDto dto) {
        try {
            ExcesoGlobalDto resultado = service.registrarPresupuestoGlobal(dto);
            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error de validación: " + e.getMessage());

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error interno al registrar el presupuesto global.");
        }
    }
}
