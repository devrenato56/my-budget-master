package pe.edu.uni.sesion17.Rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.uni.sesion17.Dto.TransaccionDto;
import pe.edu.uni.sesion17.Service.TransaccionService;

import java.util.List;

@RestController
@RequestMapping("/Presupuesto/transaccion")
public class TransaccionRest {

    @Autowired
    private TransaccionService transaccionService;

    /**
     * RF1/RF2 - Historial de transacciones (ingresos y gastos)
     * GET /Presupuesto/transaccion/usuario/{idUsuario}
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listar(@PathVariable int idUsuario) {
        try {
            List<TransaccionDto> transacciones = transaccionService.listarPorUsuario(idUsuario);
            return ResponseEntity.ok(transacciones);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al listar transacciones.");
        }
    }

    /**
     * RF1/RF2 - Saldo total acumulado
     * GET /Presupuesto/transaccion/usuario/{idUsuario}/saldo
     */
    @GetMapping("/usuario/{idUsuario}/saldo")
    public ResponseEntity<?> saldo(@PathVariable int idUsuario) {
        try {
            double saldo = transaccionService.obtenerSaldoTotal(idUsuario);
            return ResponseEntity.ok(saldo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al calcular el saldo.");
        }
    }
}
