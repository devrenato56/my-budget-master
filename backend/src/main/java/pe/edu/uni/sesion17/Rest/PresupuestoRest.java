package pe.edu.uni.sesion17.Rest;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.uni.sesion17.Dto.PresupuestoCategoriaDto;
import pe.edu.uni.sesion17.Dto.PresupuestoUsuarioDto;
import pe.edu.uni.sesion17.Service.PresupuestoService;

import java.util.List;

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

    /**
     * Lista los presupuestos por categoría de un usuario
     * GET /Presupuesto/Categoria/Usuario/{idUsuario}
     */
    @GetMapping("/Categoria/Usuario/{idUsuario}")
    public ResponseEntity<?> listarPresupuestosCategoria(@PathVariable int idUsuario) {
        try {
            List<PresupuestoCategoriaDto> resultado = presupuestoService.listarPresupuestosCategoria(idUsuario);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al listar los presupuestos por categoría");
        }
    }

    /**
     * Lista los presupuestos globales mensuales de un usuario
     * GET /Presupuesto/Global/Usuario/{idUsuario}
     */
    @GetMapping("/Global/Usuario/{idUsuario}")
    public ResponseEntity<?> listarPresupuestosGlobal(@PathVariable int idUsuario) {
        try {
            List<PresupuestoUsuarioDto> resultado = presupuestoService.listarPresupuestosGlobal(idUsuario);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al listar los presupuestos globales");
        }
    }
}
