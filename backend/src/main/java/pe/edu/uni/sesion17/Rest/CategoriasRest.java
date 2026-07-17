package pe.edu.uni.sesion17.Rest;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.uni.sesion17.Dto.CategoriaDto;
import pe.edu.uni.sesion17.Service.CategoriaService;

import java.util.List;

@RestController
@RequestMapping("/Presupuesto/categoria")
public class CategoriasRest {

    @Autowired
    private CategoriaService categoriaService;

    // Listar todas las categorías de un usuario
    @GetMapping("/Usuario/{idUsuario}")
    public ResponseEntity<?> listarCategorias(@PathVariable int idUsuario) {
        try {
            List<CategoriaDto> categorias = categoriaService.obtenerCategoriasPorUsuario(idUsuario);
            return ResponseEntity.ok(categorias);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al listar categorías.");
        }
    }

    // Listar categorías de un usuario filtradas por tipo (1=Ingreso, 2=Gasto)
    @GetMapping("/Usuario/{idUsuario}/Tipo/{idTipo}")
    public ResponseEntity<?> listarCategoriasPorTipo(@PathVariable int idUsuario, @PathVariable int idTipo) {
        try {
            List<CategoriaDto> categorias = categoriaService.obtenerCategoriasPorTipo(idUsuario, idTipo);
            return ResponseEntity.ok(categorias);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al listar categorías por tipo.");
        }
    }

    // Obtener una categoría específica
    @GetMapping("/{idCategoria}/Usuario/{idUsuario}")
    public ResponseEntity<?> obtenerCategoria(@PathVariable int idCategoria, @PathVariable int idUsuario) {
        try {
            CategoriaDto categoria = categoriaService.obtenerCategoriaPorId(idCategoria, idUsuario);
            return ResponseEntity.ok(categoria);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al obtener la categoría.");
        }
    }

    // Crear una nueva categoría
    @PostMapping("/Crear")
    public ResponseEntity<?> crearCategoria(@RequestBody CategoriaDto dto) {
        try {
            CategoriaDto categoriaCreada = categoriaService.crearCategoria(dto);
            return ResponseEntity.ok(categoriaCreada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al crear categoría.");
        }
    }

    // Actualizar categoría existente
    @PutMapping("/Actualizar")
    public ResponseEntity<?> actualizarCategoria(@RequestBody CategoriaDto dto) {
        try {
            CategoriaDto categoriaActualizada = categoriaService.actualizarCategoria(dto);
            return ResponseEntity.ok(categoriaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al actualizar categoría.");
        }
    }

    // Eliminar (desactivar) categoría
    @DeleteMapping("/Eliminar/{idCategoria}/{idUsuario}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable int idCategoria, @PathVariable int idUsuario) {
        try {
            categoriaService.eliminarCategoria(idCategoria, idUsuario);
            return ResponseEntity.ok("Categoría eliminada correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al eliminar categoría.");
        }
    }
}