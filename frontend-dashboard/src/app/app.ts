import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast'; // Importar
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule], // Agregar al array
  providers: [MessageService], // Proveedor global de mensajes
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {}