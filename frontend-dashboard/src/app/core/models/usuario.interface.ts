export interface Usuario {
    id?: number;
    email: string;
    nombre: string;
    telefono?: string;
    rol: string;
    tipoUsuario?: string;
    password?: string; // Solo se usa al crear/editar
}