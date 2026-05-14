import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.interface';
import { MessageService } from 'primeng/api';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { UsuarioFormComponent } from '../usuario-form/usuario-form';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, InputTextModule, SelectModule, TooltipModule, UsuarioFormComponent],
  templateUrl: './usuario-list.html'
})
export class UsuarioListComponent implements OnInit { // <-- Verifica que el nombre de clase coincida con app.routes.ts
  usuarios: Usuario[] = [];
  isLoading = true;
  isSaving = false;
  dialogVisible = false;
  selectedUsuario: Usuario | null = null;

  rolesOptions = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Cliente', value: 'USER' }
  ];

  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);

  ngOnInit() { this.loadUsuarios(); }

  loadUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => { this.usuarios = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  openNew() {
    this.selectedUsuario = null;
    this.dialogVisible = true;
  }

  editUsuario(user: Usuario) {
    this.selectedUsuario = { ...user };
    this.dialogVisible = true;
  }

  deleteUsuario(user: Usuario) {
    if (user.rol === 'ADMIN') {
      this.messageService.add({ severity: 'warn', summary: 'Restringido', detail: 'No se puede eliminar administradores.' });
      return;
    }
    if (confirm(`¿Eliminar al usuario ${user.nombre}?`)) {
      this.isLoading = true;
      this.usuarioService.deleteUsuario(user.id!).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.id !== user.id);
          this.messageService.add({ severity: 'success', summary: 'Borrado', detail: 'Usuario eliminado.' });
          this.isLoading = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'No se pudo eliminar.' });
          this.isLoading = false;
        }
      });
    }
  }

  saveUsuario(userData: Usuario) {
    this.isSaving = true;
    if (userData.id) {
      this.usuarioService.updateUsuario(userData.id, userData).subscribe({
        next: () => {
          this.loadUsuarios(); // Recargamos para ver los datos frescos de la BD
          this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Usuario actualizado.' });
          this.dialogVisible = false;
          this.isSaving = false;
        },
        error: (err) => this.errorHandler(err)
      });
    } else {
      this.usuarioService.createUsuario(userData).subscribe({
        next: () => {
          this.loadUsuarios();
          this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Usuario registrado.' });
          this.dialogVisible = false;
          this.isSaving = false;
        },
        error: (err) => this.errorHandler(err)
      });
    }
  }

  private errorHandler(err: any) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Operación fallida' });
    this.isSaving = false;
  }

  getRolSeverity(rol: string): any { return rol === 'ADMIN' ? 'danger' : 'info'; }
}