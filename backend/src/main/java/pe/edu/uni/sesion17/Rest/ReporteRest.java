package pe.edu.uni.sesion17.Rest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.uni.sesion17.Dto.ReporteDto;
import pe.edu.uni.sesion17.Service.ReporteService;

@RestController
@RequestMapping("/Presupuesto/reporte")
public class ReporteRest {

    @Autowired
    private ReporteService reporteService;

    /**
     * RF4 – Reporte financiero mensual / trimestral / personalizado
     * Ejemplo:
     * GET /Presupuesto/reporte/periodo?idUsuario=1&anio=2025&mesInicio=5&mesFin=5
     */
    @GetMapping("/periodo")
    public ResponseEntity<?> obtenerReporte(
            @RequestParam int idUsuario,
            @RequestParam int anio,
            @RequestParam int mesInicio,
            @RequestParam int mesFin
    ) {
        try {
            ReporteDto reporte = reporteService.obtenerReportePeriodico(
                    idUsuario, anio, mesInicio, mesFin
            );
            return ResponseEntity.ok(reporte);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

