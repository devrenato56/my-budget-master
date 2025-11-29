package pe.edu.uni.sesion17.Dto;


import lombok.Data;

@Data
public class UsuarioDto {
    private int idUsuario;
    private String nombre;
    private String email;
    private String password;
    private int activo;
}