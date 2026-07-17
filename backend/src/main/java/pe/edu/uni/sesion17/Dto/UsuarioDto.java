package pe.edu.uni.sesion17.Dto;


import lombok.Data;

@Data
public class UsuarioDto {
    private int idUsuario;
    private String nombre;
    private String email;
    private String telefono;
    private String usuario;   // login (columna USUARIO.usuario)
    private String clave;     // password (columna USUARIO.clave)
}
