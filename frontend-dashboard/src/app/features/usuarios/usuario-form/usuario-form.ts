import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../../core/models/usuario.interface';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, PasswordModule],
  template: `
    <p-dialog [(visible)]="visible" [style]="{ width: '500px', maxWidth: '95vw' }" [header]="usuarioData ? 'Editar Usuario' : 'Nuevo Usuario'" [modal]="true" [draggable]="false" (onHide)="cancel()" headerStyleClass="!bg-white border-b border-gray-200" contentStyleClass="!bg-white pt-4">
      <form [formGroup]="userForm" class="flex flex-col gap-4">
        
        <div class="flex flex-col gap-1.5 w-full">
          <label class="font-bold text-sm text-gray-700">Nombre Completo</label>
          <input type="text" pInputText formControlName="nombre" class="w-full border-gray-300" />
        </div>

        <div class="flex flex-col gap-1.5 w-full">
          <label class="font-bold text-sm text-gray-700">Correo Electrónico</label>
          <input type="email" pInputText formControlName="email" class="w-full border-gray-300" />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5 w-full">
              <label class="font-bold text-sm text-gray-700">Teléfono</label>
              <input type="tel" pInputText formControlName="telefono" class="w-full border-gray-300" />
            </div>
            <div class="flex flex-col gap-1.5 w-full">
              <label class="font-bold text-sm text-gray-700">Rol del Sistema</label>
              <p-select [options]="roles" formControlName="rol" optionLabel="label" optionValue="value" styleClass="w-full border-gray-300" appendTo="body"></p-select>
            </div>
        </div>

        <div class="flex flex-col gap-1.5 w-full">
          <label class="font-bold text-sm text-gray-700">Contraseña <span class="text-xs text-gray-400 font-normal" *ngIf="usuarioData">(Deja en blanco para no cambiar)</span></label>
          <p-password formControlName="password" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full border-gray-300"></p-password>
        </div>

      </form>
      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-3 pt-4">
            <button pButton label="Cancelar" icon="pi pi-times" class="p-button-text !text-red-500 font-bold" (click)="cancel()"></button>
            <button pButton label="Guardar" icon="pi pi-check" class="!bg-[#000E29] hover:!bg-[#001B4B] !border-none text-white shadow-md transition-colors" (click)="save()" [loading]="isLoading" [disabled]="userForm.invalid"></button>
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class UsuarioFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  
  @Input() visible = false;
  @Input() usuarioData: Usuario | null = null;
  @Input() isLoading = false;
  
  @Output() onSave = new EventEmitter<Usuario>();
  @Output() onCancel = new EventEmitter<void>();

  userForm!: FormGroup;
  roles = [{ label: 'Cliente (USER)', value: 'USER' }, { label: 'Administrador (ADMIN)', value: 'ADMIN' }];

  ngOnInit() {
    this.userForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      rol: ['USER', Validators.required],
      password: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['usuarioData'] && this.userForm) {
      if (this.usuarioData) {
        // Editando
        this.userForm.patchValue(this.usuarioData);
        this.userForm.get('password')?.clearValidators();
      } else {
        // Nuevo
        this.userForm.reset({ rol: 'USER' });
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      }
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  save() {
    if (this.userForm.invalid) return;
    this.onSave.emit(this.userForm.value);
  }

  cancel() { this.onCancel.emit(); }
}